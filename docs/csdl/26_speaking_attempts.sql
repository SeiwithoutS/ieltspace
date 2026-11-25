-- 26: Lượt làm Speaking (idempotent, chạy lại an toàn). CHƯA áp dụng lên database nào; cần người duyệt.
-- Làm gì: thêm client_attempt_id (idempotent theo người dùng), mode/time_limit_minutes cho lượt làm,
-- cho deadline_at nhận NULL (Practice không giới hạn), và khóa theo câu hỏi cho bản ghi âm ở submission_contents.
-- Cần có sẵn: các bảng users, exams, exam_skills, exam_sections, attempts, skill_attempts, submission_contents
-- (từ 01_tao_cau_truc.sql hoặc 01_tao_cau_truc_moi.sql; database nâng cấp từ 01 cũ thì chạy 04, 05 trước). Tệp này KHÔNG tự tạo
-- các bảng đó: thiếu bảng thì dừng ngay ở khối kiểm tra đầu tệp. Không xóa dữ liệu.
--
-- Kiểm tra TRƯỚC khi áp (chạy riêng, kết quả mong đợi ghi ở từng dòng):
--   select to_regclass('public.attempts'), to_regclass('public.skill_attempts'), to_regclass('public.submission_contents');  -- không NULL
--   select distinct recording_status from public.submission_contents;  -- chỉ NULL, PENDING, UPLOADED, DELETED
--   select count(*) from public.submission_contents;                   -- ghi lại để so sau khi áp
--   select count(*) from public.attempts where client_attempt_id is not null;  -- lỗi "column does not exist" nghĩa là chưa áp 26
-- Rollback: xem khối chú thích cuối tệp.
begin;

do $$
begin
  if to_regclass('public.attempts') is null or to_regclass('public.skill_attempts') is null
     or to_regclass('public.submission_contents') is null or to_regclass('public.exam_sections') is null then
    raise exception 'Thiếu bảng attempts/skill_attempts/submission_contents/exam_sections: chạy 01 (hoặc 01 mới / 04, 05) trước 26';
  end if;
  -- Ràng buộc recording_status bên dưới được thêm KHÔNG NOT VALID; có giá trị lạ thì dừng để xử lý tay trước.
  if exists (select 1 from public.submission_contents
             where recording_status is not null and recording_status not in ('PENDING','UPLOADED','DELETED')) then
    raise exception 'submission_contents.recording_status có giá trị ngoài PENDING/UPLOADED/DELETED: xử lý trước khi áp 26';
  end if;
end $$;

-- Idempotent theo (người dùng, clientAttemptId do client sinh). NULL cho dữ liệu cũ (nhiều NULL được phép).
alter table public.attempts add column if not exists client_attempt_id uuid;
create unique index if not exists attempts_user_client_attempt_key on public.attempts(user_id, client_attempt_id);

alter table public.skill_attempts
  add column if not exists mode text,
  add column if not exists time_limit_minutes integer;
-- Practice "không giới hạn": deadline_at = NULL. Ràng buộc check(deadline_at>=started_at) vẫn đúng với NULL.
-- Lưu ý: code đọc deadline_at (practice-progress.ts) chỉ xét Listening/Reading nên không bị ảnh hưởng.
alter table public.skill_attempts alter column deadline_at drop not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'skill_attempts_mode_valid'
                 and conrelid = 'public.skill_attempts'::regclass) then
    alter table public.skill_attempts add constraint skill_attempts_mode_valid
      check (mode is null or mode in ('REAL','PRACTICE'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'skill_attempts_time_limit_valid'
                 and conrelid = 'public.skill_attempts'::regclass) then
    alter table public.skill_attempts add constraint skill_attempts_time_limit_valid
      check (time_limit_minutes is null or time_limit_minutes > 0);
  end if;
end $$;

-- Bản ghi âm theo câu hỏi: question_key = khóa câu do client đặt (vd p1q1), '' cho Writing/bài một phần.
alter table public.submission_contents add column if not exists question_key text not null default '';
do $$
declare c record;
begin
  -- Bỏ unique cũ (skill_attempt_id, section_id): mỗi Part Speaking giờ có nhiều câu.
  for c in
    select con.conname from pg_constraint con
    where con.conrelid = 'public.submission_contents'::regclass and con.contype = 'u'
      and (select array_agg(att.attname::text order by att.attname::text) from pg_attribute att
           where att.attrelid = con.conrelid and att.attnum = any(con.conkey)) = array['section_id','skill_attempt_id']
  loop
    execute format('alter table public.submission_contents drop constraint %I', c.conname);
  end loop;
  -- Đã kiểm ở khối đầu: không hàng cũ nào vi phạm, nên thêm ràng buộc đã kiểm hợp lệ (không NOT VALID, không để hàng cũ
  -- lỗi làm hỏng UPDATE về sau).
  if not exists (select 1 from pg_constraint where conname = 'submission_contents_recording_status_valid'
                 and conrelid = 'public.submission_contents'::regclass) then
    alter table public.submission_contents add constraint submission_contents_recording_status_valid
      check (recording_status is null or recording_status in ('PENDING','UPLOADED','DELETED'));
  end if;
end $$;
create unique index if not exists submission_contents_attempt_section_question_key
  on public.submission_contents(skill_attempt_id, section_id, question_key);
-- Một khóa câu chỉ thuộc một hàng trong một lượt (chặn đổi partIndex để ghi lại câu Thi thật). ON CONFLICT của backend dùng index này.
create unique index if not exists submission_contents_attempt_question_key
  on public.submission_contents(skill_attempt_id, question_key) where question_key <> '';

create index if not exists skills_attempt on public.skill_attempts(attempt_id);
create index if not exists contents_expiration on public.skill_attempts(content_expires_at) where content_status='AVAILABLE';
create index if not exists skill_attempts_stale_in_progress on public.skill_attempts(started_at) where status='IN_PROGRESS';

commit;

-- ROLLBACK (thủ công, chỉ khi chưa có dữ liệu mới phụ thuộc; chạy trong một transaction, kiểm trước từng điều kiện):
--   Trước: tắt API /learner/skill-attempts. Cần không còn hàng có question_key <> '' (nhiều hàng cùng section sẽ vi phạm unique cũ)
--   và không còn skill_attempts.deadline_at IS NULL (Practice không giới hạn): xóa hoặc gán deadline_at trước.
--   begin;
--   drop index if exists public.submission_contents_attempt_question_key;
--   drop index if exists public.submission_contents_attempt_section_question_key;
--   alter table public.submission_contents drop constraint if exists submission_contents_recording_status_valid;
--   alter table public.submission_contents add constraint submission_contents_skill_attempt_id_section_id_key unique (skill_attempt_id, section_id);
--   alter table public.submission_contents drop column if exists question_key;
--   alter table public.skill_attempts drop constraint if exists skill_attempts_mode_valid;
--   alter table public.skill_attempts drop constraint if exists skill_attempts_time_limit_valid;
--   alter table public.skill_attempts alter column deadline_at set not null;
--   alter table public.skill_attempts drop column if exists mode, drop column if exists time_limit_minutes;
--   drop index if exists public.attempts_user_client_attempt_key;
--   alter table public.attempts drop column if exists client_attempt_id;
--   -- Các index skills_attempt, contents_expiration, skill_attempts_stale_in_progress vô hại, có thể giữ.
--   commit;

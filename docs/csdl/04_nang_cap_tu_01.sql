-- IELTSpace · Chỉ chạy trên database đã áp dụng 01_tao_cau_truc.sql cũ.
-- Điền hai bảng ánh xạ tạm nếu kiểm tra trước phát hiện dữ liệu tương ứng.
-- Mọi thay đổi hoàn tất cùng nhau. Không sử dụng CASCADE.
begin;
set local lock_timeout='5s';
set local search_path=pg_catalog,public;
do $$
begin
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='exams' and column_name='exam_type') then
  raise exception 'Không tìm thấy exams.exam_type của 01 cũ. Kiểm tra phiên bản trước khi chạy.';
 end if;
end $$;

lock table public.exam_sets, public.exams, public.exam_versions, public.exam_skills, public.exam_sections,
 public.question_groups, public.questions, public.question_answers, public.import_batches,
 public.flashcard_sessions, public.flashcard_session_items, public.vocabulary_tags, public.vocabulary_tag_items
 in access exclusive mode;

create temporary table import_map(batch_id uuid primary key, new_type text not null, exam_id uuid, skill text) on commit drop;
-- Ví dụ: insert into import_map values ('<batch uuid>','EXAM_READING','<exam uuid>','READING');
create temporary table tag_session_map(session_id uuid primary key, set_id uuid not null) on commit drop;
-- Chỉ ánh xạ khi đã xác minh bộ từ tương ứng: insert into tag_session_map values ('<session uuid>','<set uuid>');

do $$
declare bad uuid;
begin
 select id into bad from public.import_batches b where import_type not in ('SAMPLE','VOCABULARY')
 and not exists(select from import_map m where m.batch_id=b.id) limit 1;
 if found then raise exception 'Lô nhập % thiếu ánh xạ import_map. Xem hướng dẫn.',bad; end if;
 select id into bad from public.flashcard_sessions s where source_type='TAG'
 and not exists(select from tag_session_map m where m.session_id=s.id) limit 1;
 if found then raise exception 'Phiên theo nhãn % chưa có bộ từ tương ứng trong tag_session_map.',bad; end if;
end $$;

-- Lưu lại loại đề cũ, kể cả đề chưa có phần thi, và dữ liệu nhãn lịch sử.
create schema ielts_archive_01;
revoke all on schema ielts_archive_01 from public,anon,authenticated;
create table ielts_archive_01.exam_forms as select id,exam_type from public.exams;
create table ielts_archive_01.tag_sessions as select id,tag_id from public.flashcard_sessions where source_type='TAG';
create table ielts_archive_01.import_types as select b.id,b.import_type from public.import_batches b join import_map m on m.batch_id=b.id;
revoke all on all tables in schema ielts_archive_01 from public,anon,authenticated;

alter table public.exam_sets rename column cover_path to cover_url;
alter table public.exams add column order_no integer;
alter table public.exams disable trigger set_updated_at;
with ranked as (select id,row_number() over(partition by exam_set_id order by created_at,id) as pos from public.exams)
update public.exams e set order_no=r.pos from ranked r where r.id=e.id;
alter table public.exams enable trigger set_updated_at;
alter table public.exams alter column order_no set not null,
 add check(order_no > 0), add unique(exam_set_id,order_no);
create unique index one_draft_per_exam on public.exam_versions(exam_id) where status='DRAFT';

alter table public.exam_skills add column is_hidden boolean not null default false;
alter table public.exam_skills add unique(id,skill),
 add constraint exam_skill_scoring check (
 (skill in ('READING','LISTENING') and grading_rule_id is null) or
 (skill in ('WRITING','SPEAKING') and band_scale_id is null));
alter table public.exam_sections add column form text, add column config jsonb not null default '{}'::jsonb;
update public.exam_sections s set form=case e.exam_type when 'GENERAL_TRAINING' then 'GENERAL' else e.exam_type end
from public.exam_skills k join public.exam_versions v on v.id=k.exam_version_id join public.exams e on e.id=v.exam_id
where s.exam_skill_id=k.id and k.skill in ('READING','WRITING');
-- Mẫu 02 cũ bọc mảng trong {"paragraphs":[...]}. Chỉ bóc khi không có khóa khác.
update public.exam_sections set content=content->'paragraphs' where section_type='PASSAGE'
 and jsonb_typeof(content->'paragraphs')='array' and content-'paragraphs'='{}'::jsonb;
alter table public.exam_sections drop constraint exam_sections_exam_skill_id_order_no_key;
-- Derived key ties section type and form to the actual parent skill.
alter table public.exam_sections
 add column section_skill text generated always as (case section_type
   when 'PASSAGE' then 'READING' when 'SECTION' then 'LISTENING'
   when 'TASK' then 'WRITING' when 'PART' then 'SPEAKING' end) stored not null,
 add foreign key(exam_skill_id,section_skill) references public.exam_skills(id,skill),
 add constraint section_form_valid check (
   (section_type in ('PASSAGE','TASK') and form is not null and form in ('ACADEMIC','GENERAL')) or
   (section_type in ('SECTION','PART') and form is null));
create unique index section_order_per_form on public.exam_sections(exam_skill_id,form,order_no) where form is not null;
create unique index section_order_without_form on public.exam_sections(exam_skill_id,order_no) where form is null;
alter table public.exams drop column exam_type;

alter table public.question_groups add column config jsonb not null default '{}'::jsonb,
 add column question_from integer, add column question_to integer;
alter table public.questions add column number_from integer, add column number_to integer;
with numbered as (
 select q.id,q.answer_count,sum(q.answer_count) over
 (partition by s.exam_skill_id,s.form order by s.order_no,g.order_no,q.order_no rows unbounded preceding) as last_no
 from public.questions q join public.question_groups g on g.id=q.question_group_id
 join public.exam_sections s on s.id=g.section_id where s.section_type in ('PASSAGE','SECTION')
)
update public.questions q set number_from=n.last_no-n.answer_count+1, number_to=n.last_no from numbered n where q.id=n.id;
with bounds as (select question_group_id,min(number_from) lo,max(number_to) hi from public.questions
 where number_from is not null group by question_group_id)
update public.question_groups g set question_from=b.lo,question_to=b.hi from bounds b where b.question_group_id=g.id;
alter table public.questions add constraint question_numbers_valid check (
 (number_from is null and number_to is null) or
 (number_from is not null and number_to is not null and number_from > 0 and number_to >= number_from));
alter table public.question_groups add constraint group_numbers_valid check (
 (question_from is null and question_to is null) or
 (question_from is not null and question_to is not null and question_from > 0 and question_to >= question_from));
alter table public.question_answers add column evidence jsonb not null default '{}'::jsonb;
update public.question_answers a set evidence=jsonb_strip_nulls(jsonb_build_object(
 'para_label',case when s.section_type='PASSAGE' then coalesce(q.explanation->'para_label',q.explanation->'label') end,
 'transcript_label',q.explanation->'transcript_label','key_phrases',q.explanation->'key_phrases'))
from public.questions q join public.question_groups g on g.id=q.question_group_id
join public.exam_sections s on s.id=g.section_id where a.question_id=q.id and jsonb_typeof(q.explanation)='object';

alter table public.import_batches add column exam_id uuid references public.exams(id), add column skill text;
update public.import_batches b set import_type=m.new_type,exam_id=m.exam_id,skill=m.skill from import_map m where m.batch_id=b.id;
alter table public.import_batches add constraint import_target_valid check (
 (import_type in ('SAMPLE','VOCABULARY') and exam_id is null and skill is null) or
 (exam_id is not null and skill is not null and skill in ('READING','LISTENING','WRITING','SPEAKING') and import_type='EXAM_' || skill));

-- DROP COLUMN chỉ bỏ các ràng buộc nội bộ có dùng tag_id. Giữ check về reviewed_count.
alter table public.flashcard_sessions drop constraint flashcard_sessions_source_type_check;
alter table public.flashcard_sessions drop column tag_id;
update public.flashcard_sessions s set source_type='SET',set_id=m.set_id from tag_session_map m where s.id=m.session_id and s.source_type='TAG';
alter table public.vocabulary_tag_items set schema ielts_archive_01;
alter table public.vocabulary_tags set schema ielts_archive_01;
revoke all on all tables in schema ielts_archive_01 from public,anon,authenticated;
update public.flashcard_session_items set self_rating=case self_rating when 'Chưa nhớ' then 'NOT_REMEMBERED' else 'REMEMBERED' end
where self_rating in ('Chưa nhớ','Đã nhớ');
alter table public.flashcard_sessions add constraint flashcard_source_valid check (
 (source_type='SET' and set_id is not null) or (source_type='FAVORITES' and set_id is null));
alter table public.flashcard_session_items add constraint flashcard_rating_valid check (self_rating in ('NOT_REMEMBERED','REMEMBERED'));

create table public.system_settings (
 key text primary key, value jsonb not null, description text,
 updated_at timestamptz not null default now(), updated_by uuid references public.users(id)
);
insert into public.system_settings(key,value,description) values
 ('grading_assignment_timeout_hours','72','Hạn chờ phân công (giờ)'),
 ('submission_retention_days','14','Hạn lưu nội dung (ngày)'),
 ('flashcard_minimum_cards','10','Số thẻ khác nhau tối thiểu');
create trigger set_updated_at before update on public.system_settings for each row execute function public.set_updated_at();
alter table public.system_settings enable row level security;
revoke all on public.system_settings from public,anon,authenticated;
commit;

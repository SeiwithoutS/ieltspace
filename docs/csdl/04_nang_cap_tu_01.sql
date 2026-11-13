-- IELTSpace · Chỉ chạy trên database đã áp dụng 01_tao_cau_truc.sql cũ.
-- Kết quả trùng cấu trúc 01_tao_cau_truc_moi.sql sau D08–D10 (13/11): bỏ exam_versions,
-- exam_skills là đơn vị đăng và phiên bản, form nằm ở exam_skills, bộ đề có danh mục.
-- Điền hai bảng ánh xạ tạm nếu kiểm tra trước phát hiện dữ liệu tương ứng.
-- Mọi thay đổi hoàn tất cùng nhau. Không sử dụng CASCADE.
begin;
set local lock_timeout='5s';
set local search_path=pg_catalog,public;
do $$
begin
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='exams' and column_name='exam_type')
  or to_regclass('public.exam_versions') is null then
  raise exception 'Không tìm thấy exams.exam_type và exam_versions của 01 cũ. Kiểm tra phiên bản trước khi chạy.';
 end if;
end $$;

lock table public.exam_sets, public.exams, public.exam_versions, public.exam_skills, public.exam_sections,
 public.band_scales, public.attempts, public.skill_attempts,
 public.question_groups, public.questions, public.question_answers, public.import_batches,
 public.flashcard_sessions, public.flashcard_session_items, public.vocabulary_tags, public.vocabulary_tag_items
 in access exclusive mode;

create temporary table import_map(batch_id uuid primary key, new_type text not null, exam_id uuid, skill text, form text) on commit drop;
-- Ví dụ: insert into import_map values ('<batch uuid>','EXAM_READING','<exam uuid>','READING','ACADEMIC');
-- form: ACADEMIC hoặc GENERAL cho READING/WRITING, NULL cho LISTENING/SPEAKING.
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
 -- D08 chỉ cho một bản nháp mỗi kỹ năng; 01 cũ cho nhiều bản nháp mỗi Test.
 select exam_id into bad from public.exam_versions where status='DRAFT' group by exam_id having count(*)>1 limit 1;
 if found then raise exception 'Test % có nhiều phiên bản DRAFT. Giữ một bản nháp trước khi nâng cấp.',bad; end if;
 -- Thang Reading phải cùng form với Test.
 select k.id into bad from public.exam_skills k join public.exam_versions v on v.id=k.exam_version_id
 join public.exams e on e.id=v.exam_id join public.band_scales b on b.id=k.band_scale_id
 where k.skill='READING' and (b.skill<>'READING' or b.exam_type<>e.exam_type) limit 1;
 if found then raise exception 'Kỹ năng Reading % dùng thang band khác kỹ năng hoặc khác loại đề.',bad; end if;
end $$;

-- Lưu lại loại đề, trạng thái cũ, phiên bản và dữ liệu nhãn lịch sử.
create schema ielts_archive_01;
revoke all on schema ielts_archive_01 from public,anon,authenticated;
create table ielts_archive_01.exam_forms as select id,exam_type,status from public.exams;
create table ielts_archive_01.exam_versions as select * from public.exam_versions;
create table ielts_archive_01.exam_skill_orders as select id,exam_version_id,order_no from public.exam_skills;
create table ielts_archive_01.attempt_versions as select id,exam_version_id from public.attempts;
create table ielts_archive_01.band_scale_types as select id,exam_type from public.band_scales;
create table ielts_archive_01.tag_sessions as select id,tag_id from public.flashcard_sessions where source_type='TAG';
create table ielts_archive_01.import_types as select b.id,b.import_type from public.import_batches b join import_map m on m.batch_id=b.id;
revoke all on all tables in schema ielts_archive_01 from public,anon,authenticated;

-- Bộ đề: ảnh bìa, danh mục (D10) và ngày đăng lần đầu.
alter table public.exam_sets disable trigger set_updated_at;
alter table public.exam_sets rename column cover_path to cover_url;
alter table public.exam_sets
 add column category text not null default 'OTHER' check(category in ('MOCK_TEST','ACTUAL_TEST','PRACTICE_TEST','FORECAST','OTHER')),
 add column published_at timestamptz;
update public.exam_sets s set published_at=coalesce(
 (select min(v.published_at) from public.exams e join public.exam_versions v on v.exam_id=e.id
  where e.exam_set_id=s.id and v.published_at is not null), s.updated_at)
where s.status<>'DRAFT';
alter table public.exam_sets enable trigger set_updated_at;
alter table public.exam_sets add check(status='DRAFT' or published_at is not null);

alter table public.exams add column order_no integer;
alter table public.exams disable trigger set_updated_at;
with ranked as (select id,row_number() over(partition by exam_set_id order by created_at,id) as pos from public.exams)
update public.exams e set order_no=r.pos from ranked r where r.id=e.id;
alter table public.exams enable trigger set_updated_at;
alter table public.exams alter column order_no set not null,
 add check(order_no > 0), add unique(exam_set_id,order_no);

-- Thang band: exam_type thành form, chỉ Reading có form.
alter table public.band_scales add column form text check(form in ('ACADEMIC','GENERAL'));
update public.band_scales set form=case exam_type when 'GENERAL_TRAINING' then 'GENERAL' else 'ACADEMIC' end where skill='READING';
alter table public.band_scales drop column exam_type;
alter table public.band_scales add check((skill='READING')=(form is not null)),
 add unique(name,skill,form,version), add unique(id,skill,form);

-- Kỹ năng: giữ id (skill_attempts và exam_sections vẫn trỏ đúng), gắn thẳng vào Test.
-- Bản nháp cũ thành DRAFT; phiên bản đã đăng mới nhất của Test thành PUBLISHED, hoặc HIDDEN
-- nếu Test cũ không Công khai; các phiên bản đã đăng trước đó thành ARCHIVED.
alter table public.exam_skills add column exam_id uuid, add column form text, add column version_number integer,
 add column status text, add column created_by uuid, add column created_at timestamptz, add column published_at timestamptz;
with latest as (select exam_id,max(version_number) as v from public.exam_versions where status='PUBLISHED' group by exam_id)
update public.exam_skills k set exam_id=v.exam_id, version_number=v.version_number,
 form=case when k.skill in ('READING','WRITING') then case e.exam_type when 'GENERAL_TRAINING' then 'GENERAL' else 'ACADEMIC' end end,
 status=case when v.status='DRAFT' then 'DRAFT' when v.version_number<l.v then 'ARCHIVED'
  when e.status='PUBLISHED' then 'PUBLISHED' else 'HIDDEN' end,
 created_by=v.created_by, created_at=v.created_at, published_at=v.published_at
from public.exam_versions v join public.exams e on e.id=v.exam_id left join latest l on l.exam_id=v.exam_id
where v.id=k.exam_version_id;
alter table public.exam_skills drop column exam_version_id;
alter table public.exam_skills drop column order_no;
alter table public.exam_skills
 alter column exam_id set not null, add foreign key(exam_id) references public.exams(id),
 add check(form in ('ACADEMIC','GENERAL')),
 alter column version_number set not null, add check(version_number>0),
 alter column status set default 'DRAFT', alter column status set not null,
 add check(status in ('DRAFT','PUBLISHED','HIDDEN','ARCHIVED')),
 add foreign key(created_by) references public.users(id),
 alter column created_at set default now(), alter column created_at set not null,
 add check((skill in ('READING','WRITING'))=(form is not null)),
 add check((status='DRAFT')=(published_at is null));
-- Mỗi kỹ năng + form của một Test: một bản nháp, một bản đang hiển thị (Công khai hoặc Đã ẩn).
create unique index skill_version_no on public.exam_skills(exam_id,skill,coalesce(form,''),version_number);
create unique index one_draft_per_skill on public.exam_skills(exam_id,skill,coalesce(form,'')) where status='DRAFT';
create unique index one_live_per_skill on public.exam_skills(exam_id,skill,coalesce(form,'')) where status in ('PUBLISHED','HIDDEN');
create index exam_sets_library on public.exam_sets(category,published_at desc) where status='PUBLISHED';
-- Reading phải dùng thang đúng kỹ năng và form; Listening (form NULL) do service kiểm tra.
alter table public.exam_skills add unique(id,skill),
 add foreign key(band_scale_id,skill,form) references public.band_scales(id,skill,form),
 add constraint exam_skill_scoring check (
 (skill in ('READING','LISTENING') and grading_rule_id is null) or
 (skill in ('WRITING','SPEAKING') and band_scale_id is null));

-- Lượt làm trỏ Test; phiên bản đã làm nằm ở skill_attempts.exam_skill_id.
alter table public.attempts add column exam_id uuid;
update public.attempts a set exam_id=v.exam_id from public.exam_versions v where v.id=a.exam_version_id;
alter table public.attempts drop column exam_version_id;
alter table public.attempts alter column exam_id set not null, add foreign key(exam_id) references public.exams(id);

alter table public.exams drop column exam_type;
alter table public.exams drop column status;
drop table public.exam_versions;

alter table public.exam_sections add column config jsonb not null default '{}'::jsonb;
-- Mẫu 02 cũ bọc mảng trong {"paragraphs":[...]}. Chỉ bóc khi không có khóa khác.
update public.exam_sections set content=content->'paragraphs' where section_type='PASSAGE'
 and jsonb_typeof(content->'paragraphs')='array' and content-'paragraphs'='{}'::jsonb;
-- Derived key ties section type to the actual parent skill; form lấy từ exam_skills.
-- Giữ unique(exam_skill_id,order_no) của 01 cũ.
alter table public.exam_sections
 add column section_skill text generated always as (case section_type
   when 'PASSAGE' then 'READING' when 'SECTION' then 'LISTENING'
   when 'TASK' then 'WRITING' when 'PART' then 'SPEAKING' end) stored not null,
 add foreign key(exam_skill_id,section_skill) references public.exam_skills(id,skill);

alter table public.question_groups add column config jsonb not null default '{}'::jsonb,
 add column question_from integer, add column question_to integer;
alter table public.questions add column number_from integer, add column number_to integer;
with numbered as (
 select q.id,q.answer_count,sum(q.answer_count) over
 (partition by s.exam_skill_id order by s.order_no,g.order_no,q.order_no rows unbounded preceding) as last_no
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

-- Lô nhập đề: một kỹ năng, kèm form với Reading/Writing.
alter table public.import_batches add column exam_id uuid references public.exams(id), add column skill text, add column form text;
update public.import_batches b set import_type=m.new_type,exam_id=m.exam_id,skill=m.skill,form=m.form from import_map m where m.batch_id=b.id;
alter table public.import_batches add constraint import_target_valid check (
 (import_type in ('SAMPLE','VOCABULARY') and exam_id is null and skill is null and form is null) or
 (exam_id is not null and skill is not null and skill in ('READING','LISTENING','WRITING','SPEAKING') and import_type='EXAM_' || skill
  and (skill in ('READING','WRITING'))=(form is not null) and (form is null or form in ('ACADEMIC','GENERAL'))));

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

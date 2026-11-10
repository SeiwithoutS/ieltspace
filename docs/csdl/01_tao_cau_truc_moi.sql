-- IELTSpace · Khởi tạo trên project Supabase mới, public trống.
-- Database đã chạy 01 cũ: dùng 04_nang_cap_tu_01.sql.
-- Auth triggers và các job nghiệp vụ được cấu hình riêng.
begin;
do $$
begin
 if exists(select from pg_catalog.pg_tables where schemaname='public') then
  raise exception 'Schema public đã có bảng. Dừng khởi tạo; dùng bản nâng cấp nếu đã chạy 01 cũ.';
 end if;
end $$;

create table public.users (
 id uuid primary key default gen_random_uuid(),
 auth_user_id uuid unique references auth.users(id) on delete set null,
 full_name text not null, display_name text, email text,
 avatar_url text,
 role text not null default 'LEARNER' check(role in ('LEARNER','TEACHER','ADMIN')),
 status text not null default 'ACTIVE' check(status in ('ACTIVE','LOCKED','DELETED')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create unique index users_email_unique on public.users(lower(email)) where email is not null;
create table public.teacher_permissions (
 id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.users(id),
 skill text not null check(skill in ('WRITING','SPEAKING')),
 max_pending integer not null default 5 check(max_pending>=0), is_accepting boolean not null default true,
 status text not null default 'ACTIVE' check(status in ('ACTIVE','PENDING_REVOKE','REVOKED')),
 last_assigned_at timestamptz, updated_at timestamptz not null default now(), unique(teacher_id,skill)
);
create table public.study_goals (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 overall_target numeric(2,1) check(overall_target between 0 and 9),
 listening_target numeric(2,1) check(listening_target between 0 and 9),
 reading_target numeric(2,1) check(reading_target between 0 and 9),
 writing_target numeric(2,1) check(writing_target between 0 and 9),
 speaking_target numeric(2,1) check(speaking_target between 0 and 9),
 daily_session_target integer not null default 1 check(daily_session_target>0),
 effective_from timestamptz not null default now()
);
create table public.exam_sets (
 id uuid primary key default gen_random_uuid(), name text not null, description text, cover_url text,
 status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED','HIDDEN')),
 created_by uuid references public.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.exams (
 id uuid primary key default gen_random_uuid(), exam_set_id uuid not null references public.exam_sets(id),
 title text not null, order_no integer,
 description text, status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED','HIDDEN')),
 created_by uuid references public.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.exam_versions (
 id uuid primary key default gen_random_uuid(), exam_id uuid not null references public.exams(id),
 version_number integer not null check(version_number>0),
 status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED')),
 created_by uuid references public.users(id), created_at timestamptz not null default now(), published_at timestamptz,
 unique(exam_id,version_number), check((status='PUBLISHED')=(published_at is not null))
);
create table public.band_scales (
 id uuid primary key default gen_random_uuid(), name text not null,
 skill text not null check(skill in ('LISTENING','READING')),
 exam_type text not null check(exam_type in ('ACADEMIC','GENERAL_TRAINING')),
 version integer not null check(version>0), conversion_rules jsonb not null,
 unique(name,skill,exam_type,version)
);
create table public.grading_rules (
 id uuid primary key default gen_random_uuid(), name text not null,
 skill text not null check(skill in ('WRITING','SPEAKING')),
 assessment_scope text not null check(assessment_scope in ('FULL_SKILL','SECTION')),
 version integer not null check(version>0), aggregation_rules jsonb not null, rounding_rules jsonb not null,
 unique(name,skill,assessment_scope,version)
);
create table public.rubric_criteria (
 id uuid primary key default gen_random_uuid(), grading_rule_id uuid not null references public.grading_rules(id),
 name text not null, description text, weight numeric not null check(weight>0),
 min_score numeric not null default 0, max_score numeric not null default 9,
 score_step numeric not null default 0.5 check(score_step>0), order_no integer not null check(order_no>0),
 check(max_score>=min_score), unique(grading_rule_id,order_no)
);
create table public.exam_skills (
 id uuid primary key default gen_random_uuid(), exam_version_id uuid not null references public.exam_versions(id),
 skill text not null check(skill in ('LISTENING','READING','WRITING','SPEAKING')),
 duration_minutes integer not null check(duration_minutes>0),
 is_hidden boolean not null default false, band_scale_id uuid references public.band_scales(id), grading_rule_id uuid references public.grading_rules(id),
 order_no integer not null check(order_no>0), unique(exam_version_id,skill), unique(exam_version_id,order_no)
);
create table public.exam_sections (
 id uuid primary key default gen_random_uuid(), exam_skill_id uuid not null references public.exam_skills(id),
 title text not null, section_type text not null, form text, config jsonb not null default '{}'::jsonb, instruction text,
 content jsonb not null default '{}'::jsonb, transcript jsonb not null default '[]'::jsonb,
 audio_path text, image_path text, order_no integer not null check(order_no>0)
);
create table public.question_groups (
 id uuid primary key default gen_random_uuid(), section_id uuid not null references public.exam_sections(id),
 title text, question_from integer, question_to integer, config jsonb not null default '{}'::jsonb, question_type text not null, instruction text, content jsonb not null default '{}'::jsonb,
 audio_path text, image_path text, order_no integer not null check(order_no>0), unique(section_id,order_no)
);
create table public.questions (
 id uuid primary key default gen_random_uuid(), question_group_id uuid not null references public.question_groups(id),
 content jsonb not null, question_type text not null,
 number_from integer, number_to integer, answer_count integer not null default 1 check(answer_count>0), max_score numeric not null default 1 check(max_score>0),
 explanation jsonb, order_no integer not null check(order_no>0), unique(question_group_id,order_no)
);
create table public.question_options (
 id uuid primary key default gen_random_uuid(), question_id uuid not null references public.questions(id),
 label text not null, content text not null, order_no integer not null check(order_no>0),
 unique(question_id,label), unique(question_id,order_no)
);
create table public.question_answers (
 id uuid primary key default gen_random_uuid(), question_id uuid not null unique references public.questions(id),
 accepted_answers jsonb not null, matching_rule jsonb not null, evidence jsonb not null default '{}'::jsonb
);
create table public.attempts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 exam_version_id uuid not null references public.exam_versions(id),
 attempt_type text not null check(attempt_type in ('FULL_EXAM','FULL_SKILL','SECTION','QUESTION_GROUP')),
 selected_scope jsonb not null default '{}'::jsonb,
 status text not null default 'IN_PROGRESS' check(status in ('IN_PROGRESS','COMPLETED','ABANDONED')),
 started_at timestamptz not null default now(), completed_at timestamptz
);
create table public.skill_attempts (
 id uuid primary key default gen_random_uuid(), attempt_id uuid not null references public.attempts(id),
 exam_skill_id uuid not null references public.exam_skills(id), section_id uuid references public.exam_sections(id),
 question_group_id uuid references public.question_groups(id),
 status text not null default 'IN_PROGRESS' check(status in ('IN_PROGRESS','COMPLETED','ABANDONED')),
 started_at timestamptz not null default now(), deadline_at timestamptz not null, completed_at timestamptz,
 duration_seconds integer check(duration_seconds>=0), correct_count integer check(correct_count>=0),
 total_questions integer check(total_questions>0), accuracy numeric(5,2) check(accuracy between 0 and 100),
 band_score numeric(2,1) check(band_score between 0 and 9),
 band_scale_id uuid references public.band_scales(id), grading_rule_id uuid references public.grading_rules(id),
 initial_expires_at timestamptz, content_expires_at timestamptz,
 content_status text not null default 'AVAILABLE' check(content_status in ('AVAILABLE','HELD','EXPIRED','DELETED')),
 content_deleted_at timestamptz, check(correct_count<=total_questions), check(deadline_at>=started_at)
);
create table public.attempt_answers (
 id uuid primary key default gen_random_uuid(), skill_attempt_id uuid not null references public.skill_attempts(id),
 question_id uuid not null references public.questions(id), answer_data jsonb not null default '{}'::jsonb,
 earned_score numeric check(earned_score>=0), correct_count integer check(correct_count>=0),
 updated_at timestamptz not null default now(), unique(skill_attempt_id,question_id)
);
create table public.submission_contents (
 id uuid primary key default gen_random_uuid(), skill_attempt_id uuid not null references public.skill_attempts(id),
 section_id uuid not null references public.exam_sections(id), text_content text, audio_path text,
 file_type text, file_size bigint check(file_size>=0), audio_duration numeric check(audio_duration>=0),
 recording_status text, updated_at timestamptz not null default now(), unique(skill_attempt_id,section_id)
);
create table public.attempt_section_states (
 id uuid primary key default gen_random_uuid(), skill_attempt_id uuid not null references public.skill_attempts(id),
 section_id uuid not null references public.exam_sections(id),
 status text not null default 'NOT_STARTED' check(status in ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
 started_at timestamptz, completed_at timestamptz, listening_started_at timestamptz,
 recording_started_at timestamptz, recording_locked_at timestamptz, unique(skill_attempt_id,section_id)
);
create table public.support_credits (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 credit_type text not null check(credit_type in ('FREE_WEEKLY','BONUS')),
 week_start date, valid_from timestamptz not null, expires_at timestamptz not null,
 used_at timestamptz, created_at timestamptz not null default now(), check(expires_at>valid_from),
 check((credit_type='FREE_WEEKLY' and week_start is not null and extract(isodow from week_start)=1)
    or (credit_type='BONUS' and week_start is null))
);
create unique index one_free_credit_per_week on public.support_credits(user_id,week_start) where credit_type='FREE_WEEKLY';
create table public.grading_requests (
 id uuid primary key default gen_random_uuid(), skill_attempt_id uuid not null references public.skill_attempts(id),
 used_credit_id uuid not null unique references public.support_credits(id),
 status text not null default 'WAITING_ASSIGNMENT' check(status in ('WAITING_ASSIGNMENT','ASSIGNED','COMPLETED','CANCELLED')),
 requested_at timestamptz not null default now(), assignment_deadline timestamptz not null,
 teacher_id uuid references public.users(id), assigned_at timestamptz,
 cancel_reason text check(cancel_reason in ('ASSIGNMENT_TIMEOUT','TEACHER_UNAVAILABLE','LEARNER_DELETED')),
 cancel_note text, cancelled_at timestamptz, cancelled_by uuid references public.users(id),
 check(assignment_deadline=requested_at+interval '72 hours'),
 check((teacher_id is null)=(assigned_at is null)),
 check(status not in ('ASSIGNED','COMPLETED') or teacher_id is not null),
 check(status<>'WAITING_ASSIGNMENT' or teacher_id is null),
 check((status='CANCELLED')=(cancelled_at is not null and cancel_reason is not null))
);
create unique index one_active_request on public.grading_requests(skill_attempt_id) where status in ('WAITING_ASSIGNMENT','ASSIGNED');
create unique index one_completed_request on public.grading_requests(skill_attempt_id) where status='COMPLETED';
create table public.grading_reviews (
 id uuid primary key default gen_random_uuid(), grading_request_id uuid not null unique references public.grading_requests(id),
 teacher_id uuid not null references public.users(id), grading_rule_id uuid not null references public.grading_rules(id),
 status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED')),
 overall_score numeric(2,1) check(overall_score between 0 and 9), general_comment text,
 updated_at timestamptz not null default now(), published_at timestamptz,
 check((status='PUBLISHED')=(published_at is not null)), check(status<>'PUBLISHED' or overall_score is not null)
);
create table public.grading_scores (
 id uuid primary key default gen_random_uuid(), grading_review_id uuid not null references public.grading_reviews(id),
 criterion_id uuid not null references public.rubric_criteria(id),
 assessment_scope text not null check(assessment_scope in ('FULL_SKILL','SECTION')),
 section_id uuid references public.exam_sections(id), score numeric(2,1) not null check(score between 0 and 9), comment text,
 check((assessment_scope='SECTION')=(section_id is not null))
);
create unique index unique_full_skill_score on public.grading_scores(grading_review_id,criterion_id) where section_id is null;
create unique index unique_section_score on public.grading_scores(grading_review_id,criterion_id,section_id) where section_id is not null;
create table public.credit_refunds (
 id uuid primary key default gen_random_uuid(), grading_request_id uuid not null unique references public.grading_requests(id),
 bonus_credit_id uuid unique references public.support_credits(id),
 status text not null default 'PENDING' check(status in ('PENDING','COMPLETED','FAILED')),
 created_at timestamptz not null default now(), refunded_at timestamptz, error_message text,
 check(status<>'COMPLETED' or (bonus_credit_id is not null and refunded_at is not null))
);
create table public.vocabulary_sets (
 id uuid primary key default gen_random_uuid(), name text not null, description text,
 status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED','HIDDEN')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.vocabularies (
 id uuid primary key default gen_random_uuid(), word text not null, phonetic text,
 definitions jsonb not null default '[]'::jsonb, audio_url text, sources jsonb not null default '[]'::jsonb,
 fetched_at timestamptz, status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED','HIDDEN')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.vocabulary_set_items (
 id uuid primary key default gen_random_uuid(), set_id uuid not null references public.vocabulary_sets(id),
 vocabulary_id uuid not null references public.vocabularies(id), order_no integer not null check(order_no>0),
 unique(set_id,vocabulary_id), unique(set_id,order_no)
);
create table public.favorite_vocabularies (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 vocabulary_id uuid not null references public.vocabularies(id), created_at timestamptz not null default now(), unique(user_id,vocabulary_id)
);
create table public.vocabulary_notes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 vocabulary_id uuid not null references public.vocabularies(id), content text not null,
 updated_at timestamptz not null default now(), unique(user_id,vocabulary_id)
);
create table public.flashcard_sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 source_type text not null,
 set_id uuid references public.vocabulary_sets(id),
 total_cards integer not null check(total_cards>0), minimum_cards integer not null check(minimum_cards>0),
 reviewed_count integer not null default 0 check(reviewed_count>=0),
 status text not null default 'IN_PROGRESS' check(status in ('IN_PROGRESS','COMPLETED','ABANDONED')),
 is_qualified boolean not null default false, started_at timestamptz not null default now(), completed_at timestamptz,
 check(reviewed_count<=total_cards)
);
create table public.flashcard_session_items (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.flashcard_sessions(id),
 vocabulary_id uuid not null references public.vocabularies(id), order_no integer not null check(order_no>0),
 is_reviewed boolean not null default false, self_rating text, reviewed_at timestamptz,
 unique(session_id,vocabulary_id), unique(session_id,order_no)
);
create table public.sample_answers (
 id uuid primary key default gen_random_uuid(), title text not null, skill text not null check(skill in ('WRITING','SPEAKING')),
 sample_type text not null, topic text, prompt text, content text not null,
 exam_id uuid references public.exams(id), section_id uuid references public.exam_sections(id),
 status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED','HIDDEN')),
 created_by uuid references public.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.learning_activities (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 activity_type text not null check(activity_type in ('ATTEMPT','FLASHCARD')),
 attempt_id uuid unique references public.attempts(id), flashcard_session_id uuid unique references public.flashcard_sessions(id),
 completed_at timestamptz not null,
 activity_date date generated always as ((completed_at at time zone 'Asia/Ho_Chi_Minh')::date) stored,
 check((activity_type='ATTEMPT' and attempt_id is not null and flashcard_session_id is null)
 or (activity_type='FLASHCARD' and flashcard_session_id is not null and attempt_id is null))
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), recipient_id uuid not null references public.users(id),
 event_key text not null, type text not null, title text not null, content text,
 reference_type text, reference_id uuid, created_at timestamptz not null default now(), read_at timestamptz,
 unique(recipient_id,event_key)
);
create table public.import_batches (
 id uuid primary key default gen_random_uuid(), request_key uuid not null unique, import_type text not null,
 exam_id uuid references public.exams(id), skill text,
 file_name text not null, temporary_path text,
 status text not null default 'PENDING' check(status in ('PENDING','VALIDATED','COMPLETED','FAILED','CANCELLED')),
 total_records integer not null default 0 check(total_records>=0), valid_records integer not null default 0 check(valid_records>=0),
 error_records integer not null default 0 check(error_records>=0), created_by uuid references public.users(id),
 created_at timestamptz not null default now(), completed_at timestamptz
);
create table public.import_assets (
 id uuid primary key default gen_random_uuid(), batch_id uuid not null references public.import_batches(id),
 file_name text not null, storage_path text not null, file_type text, file_size bigint check(file_size>=0),
 status text not null default 'TEMPORARY', unique(batch_id,file_name)
);
create table public.import_errors (
 id uuid primary key default gen_random_uuid(), batch_id uuid not null references public.import_batches(id),
 sheet_name text, row_number integer check(row_number>0), field_name text,
 severity text not null check(severity in ('ERROR','WARNING')), message text not null
);
create table public.audit_logs (
 id uuid primary key default gen_random_uuid(), actor_id uuid references public.users(id),
 actor_type text not null check(actor_type in ('USER','SYSTEM')), action text not null,
 entity_type text not null, entity_id uuid, change_data jsonb, reason text, created_at timestamptz not null default now()
);

create unique index one_draft_per_exam on public.exam_versions(exam_id) where status='DRAFT';

alter table public.exams alter column order_no set not null,
 add check(order_no > 0), add unique(exam_set_id,order_no);

alter table public.exam_skills add unique(id,skill),
 add constraint exam_skill_scoring check (
 (skill in ('READING','LISTENING') and grading_rule_id is null) or
 (skill in ('WRITING','SPEAKING') and band_scale_id is null));

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

alter table public.questions add constraint question_numbers_valid check (
 (number_from is null and number_to is null) or
 (number_from is not null and number_to is not null and number_from > 0 and number_to >= number_from));
alter table public.question_groups add constraint group_numbers_valid check (
 (question_from is null and question_to is null) or
 (question_from is not null and question_to is not null and question_from > 0 and question_to >= question_from));

alter table public.import_batches add constraint import_target_valid check (
 (import_type in ('SAMPLE','VOCABULARY') and exam_id is null and skill is null) or
 (exam_id is not null and skill is not null and skill in ('READING','LISTENING','WRITING','SPEAKING') and import_type='EXAM_' || skill));

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

-- Tu dong cap nhat updated_at; khong tu dong tao tai khoan hay tinh diem.
create function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end;
$$;
revoke all on function public.set_updated_at() from public;
do $$
declare t record;
begin
 for t in select table_name from information_schema.columns where table_schema='public' and column_name='updated_at'
 loop execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',t.table_name); end loop;
end $$;

create index attempts_user_time on public.attempts(user_id,started_at desc);
create index skills_attempt on public.skill_attempts(attempt_id);
create index contents_expiration on public.skill_attempts(content_expires_at) where content_status='AVAILABLE';
create index requests_queue on public.grading_requests(requested_at) where status='WAITING_ASSIGNMENT';
create index requests_teacher on public.grading_requests(teacher_id) where status='ASSIGNED';
create index available_credits on public.support_credits(user_id,expires_at) where used_at is null;
create index activities_user_date on public.learning_activities(user_id,activity_date);
create index notifications_recipient on public.notifications(recipient_id,created_at desc);

-- Chi cho dashboard/ket noi server co quyen truy cap. Khong co policy public.
-- Ap dung tat ca bang public vi script nay chi danh cho project moi.
do $$
declare t record;
begin
 for t in select tablename from pg_tables where schemaname='public'
 loop
  execute format('alter table public.%I enable row level security',t.tablename);
  execute format('revoke all on table public.%I from anon, authenticated',t.tablename);
 end loop;
end $$;
commit;

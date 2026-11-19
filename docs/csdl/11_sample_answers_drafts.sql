-- SAMPLE-01 / Đợt 1
-- Áp dụng trên dev đã xác nhận. Script dừng nếu có dữ liệu hoặc policy cũ.
-- Không chạy lại SQL 01.
-- Không sửa Auth trigger, không seed, không tự ánh xạ dữ liệu cũ.
-- Không tự cấp quyền cho runtime role chưa xác minh.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if to_regclass('public.sample_answers') is null then
    raise exception
      'Thiếu public.sample_answers. Đối chiếu DB-01 trước.';
  end if;

  if to_regclass('public.users') is null then
    raise exception 'Thiếu public.users.';
  end if;
end;
$$;

-- Giữ kết quả kiểm tra dữ liệu ổn định trong transaction migration.
lock table public.sample_answers in access exclusive mode;

do $$
begin
  -- Migration chỉ dành cho baseline 13 cột được cung cấp.
  -- Không dùng IF NOT EXISTS để che giấu schema lệch hoặc chạy lại.
  if exists (
    with expected(column_name, udt_name, is_nullable) as (
      values
        ('id', 'uuid', 'NO'), ('title', 'text', 'NO'),
        ('skill', 'text', 'NO'), ('sample_type', 'text', 'NO'),
        ('topic', 'text', 'YES'), ('prompt', 'text', 'YES'),
        ('content', 'text', 'NO'), ('exam_id', 'uuid', 'YES'),
        ('section_id', 'uuid', 'YES'), ('status', 'text', 'NO'),
        ('created_by', 'uuid', 'YES'), ('created_at', 'timestamptz', 'NO'),
        ('updated_at', 'timestamptz', 'NO')
    ), actual as (
      select column_name::text, udt_name::text, is_nullable::text
      from information_schema.columns
      where table_schema = 'public' and table_name = 'sample_answers'
    )
    (select * from expected except select * from actual)
    union all
    (select * from actual except select * from expected)
  ) then
    raise exception 'Schema sample_answers khác baseline. Dừng để đối chiếu.';
  end if;

  if exists (select 1 from public.sample_answers) then
    raise exception
      'sample_answers đã có dữ liệu. Cần migration ánh xạ được duyệt; không tự backfill.';
  end if;

  if to_regclass('public.sample_answer_drafts') is not null then
    raise exception
      'sample_answer_drafts đã tồn tại. Kiểm tra lịch sử migration.';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'sample_answers'
  ) then
    raise exception
      'sample_answers đã có policy. Phải duyệt policy hiện tại trước.';
  end if;
end;
$$;

alter table public.sample_answers
  add column published_payload jsonb,
  add column published_revision integer,
  add column published_at timestamptz,

  add constraint sample_answers_kind_v1_ck check (
    (
      skill = 'WRITING'
      and sample_type in (
        'WRITING_TASK_1_ACADEMIC',
        'WRITING_TASK_1_GENERAL',
        'WRITING_TASK_2'
      )
    )
    or
    (
      skill = 'SPEAKING'
      and sample_type in (
        'SPEAKING_PART_1',
        'SPEAKING_PART_2',
        'SPEAKING_PART_3'
      )
    )
  ),

  add constraint sample_answers_publication_v1_ck check (
    (
      status = 'DRAFT'
      and published_payload is null
      and published_revision is null
      and published_at is null
    )
    or
    (
      status in ('PUBLISHED', 'HIDDEN')
      and published_payload is not null
      and published_revision is not null
      and published_revision > 0
      and published_at is not null
    )
  ),

  add constraint sample_answers_snapshot_v1_ck check (
    published_payload is null
    or coalesce(
      jsonb_typeof(published_payload) = 'object'
      and published_payload -> 'schemaVersion' = '1'::jsonb
      and published_payload ->> 'skill' = skill
      and published_payload ->> 'sampleType' = sample_type
      and published_payload ->> 'title' = title
      and published_payload ->> 'topic' = topic
      and length(btrim(title)) > 0
      and length(btrim(topic)) > 0,
      false
    )
  );

create table public.sample_answer_drafts (
  sample_id uuid primary key
    references public.sample_answers(id) on delete restrict,

  revision integer not null default 1,
  payload jsonb not null,

  updated_by uuid not null references public.users(id),
  updated_at timestamptz not null default now(),

  constraint sample_answer_drafts_revision_ck
    check (revision > 0),

  constraint sample_answer_drafts_payload_v1_ck check (
    coalesce(
      jsonb_typeof(payload) = 'object'
      and payload ?& array[
        'schemaVersion',
        'skill',
        'sampleType',
        'title',
        'topic',
        'source',
        'band',
        'cover',
        'outlineIntro',
        'outline'
      ]
      and payload -> 'schemaVersion' = '1'::jsonb

      and jsonb_typeof(payload -> 'title') = 'string'
      and length(btrim(payload ->> 'title')) > 0
      and jsonb_typeof(payload -> 'topic') = 'string'
      and jsonb_typeof(payload -> 'source') = 'string'
      and jsonb_typeof(payload -> 'outlineIntro') = 'string'
      and jsonb_typeof(payload -> 'outline') = 'string'

      and payload -> 'band' in (
        '7'::jsonb,
        '7.5'::jsonb,
        '8'::jsonb,
        '8.5'::jsonb,
        '9'::jsonb
      )

      and (
        payload -> 'cover' = 'null'::jsonb
        or jsonb_typeof(payload -> 'cover') = 'object'
      )

      and (
        (
          payload ->> 'skill' = 'WRITING'
          and payload ?& array[
            'form',
            'task',
            'writingType',
            'prompt',
            'promptImage',
            'essay',
            'translation'
          ]
          and jsonb_typeof(payload -> 'writingType') = 'string'
          and jsonb_typeof(payload -> 'prompt') = 'string'
          and jsonb_typeof(payload -> 'essay') = 'string'
          and jsonb_typeof(payload -> 'translation') = 'string'
          and (
            payload -> 'promptImage' = 'null'::jsonb
            or jsonb_typeof(payload -> 'promptImage') = 'object'
          )
          and (
            (
              payload ->> 'sampleType' =
                'WRITING_TASK_1_ACADEMIC'
              and payload ->> 'form' = 'ACADEMIC'
              and payload -> 'task' = '1'::jsonb
            )
            or
            (
              payload ->> 'sampleType' =
                'WRITING_TASK_1_GENERAL'
              and payload ->> 'form' = 'GENERAL_TRAINING'
              and payload -> 'task' = '1'::jsonb
            )
            or
            (
              payload ->> 'sampleType' = 'WRITING_TASK_2'
              and payload ->> 'form' in (
                'ACADEMIC', 'GENERAL_TRAINING'
              )
              and payload -> 'task' = '2'::jsonb
            )
          )
        )
        or
        (
          payload ->> 'skill' = 'SPEAKING'
          and case
            when jsonb_typeof(payload -> 'items') = 'array' then
              case when payload -> 'part' = '2'::jsonb
                then jsonb_array_length(payload -> 'items') = 1
                else jsonb_array_length(payload -> 'items') >= 1
              end
            else false
          end
          and (
            (
              payload ->> 'sampleType' = 'SPEAKING_PART_1'
              and payload -> 'part' = '1'::jsonb
            )
            or
            (
              payload ->> 'sampleType' = 'SPEAKING_PART_2'
              and payload -> 'part' = '2'::jsonb
            )
            or
            (
              payload ->> 'sampleType' = 'SPEAKING_PART_3'
              and payload -> 'part' = '3'::jsonb
            )
          )
        )
      ),
      false
    )
  )
);

-- Không tạo trigger revision.
-- Backend phải CAS revision và cập nhật updated_at trong transaction.

create index sample_answer_drafts_updated_idx
  on public.sample_answer_drafts(updated_at desc, sample_id desc);

create index sample_answer_drafts_updated_by_idx
  on public.sample_answer_drafts(updated_by);

create index sample_answers_public_library_idx
  on public.sample_answers(
    skill,
    sample_type,
    published_at desc,
    id desc
  )
  where status = 'PUBLISHED';

alter table public.sample_answers enable row level security;
alter table public.sample_answer_drafts enable row level security;

revoke all privileges
  on table public.sample_answers
  from public, anon, authenticated;

revoke all privileges
  on table public.sample_answer_drafts
  from public, anon, authenticated;

comment on table public.sample_answer_drafts is
  'SAMPLE-01: một tài liệu nháp mỗi bài; revision dùng chống ghi đè và chuyển trạng thái.';

comment on column public.sample_answers.published_payload is
  'Snapshot nội dung công bố; không thay đổi khi lưu nháp hoặc ẩn/hiện.';

comment on column public.sample_answers.published_revision is
  'Revision tại lần công bố nội dung gần nhất.';

comment on column public.sample_answers.published_at is
  'Thời điểm công bố nội dung gần nhất; không đổi khi ẩn/hiện.';

commit;

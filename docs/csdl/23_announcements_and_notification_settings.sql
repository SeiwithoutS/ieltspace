begin;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.users(id),
  request_id uuid not null,
  title text not null check (length(btrim(title)) between 1 and 200),
  content text not null check (length(btrim(content)) between 1 and 3000),
  audience text not null check (audience in ('ALL','LEARNER','TEACHER')),
  status text not null default 'DRAFT' check (status in ('DRAFT','SCHEDULED','SENT')),
  revision integer not null default 0 check (revision >= 0),
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipient_count integer check (recipient_count >= 0),
  created_at timestamptz not null default now(),
  unique (created_by, request_id),
  check (
    (status='DRAFT' and scheduled_at is null and sent_at is null and recipient_count is null)
    or (status='SCHEDULED' and scheduled_at is not null and sent_at is null and recipient_count is null)
    or (status='SENT' and scheduled_at is not null and sent_at is not null and recipient_count is not null)
  )
);
create index if not exists announcements_due on public.announcements(scheduled_at,id) where status='SCHEDULED';
create index if not exists announcements_history on public.announcements(created_at desc,id desc);

create table if not exists public.notification_settings (
  event_type text primary key check (event_type in (
    'GRADING_REQUEST_ACCEPTED','GRADING_ASSIGNED','GRADING_RESULT_PUBLISHED',
    'GRADING_CANCELLED_REFUNDED','GRADING_CANCELLED','CONTENT_EXPIRING'
  )),
  title_template text not null check (length(btrim(title_template)) between 1 and 200),
  body_template text not null check (length(btrim(body_template)) between 1 and 3000),
  enabled boolean not null default true,
  lead_hours integer,
  revision integer not null default 0 check (revision >= 0),
  updated_by uuid not null references public.users(id),
  updated_at timestamptz not null default now(),
  check (
    (event_type='CONTENT_EXPIRING' and lead_hours is not null and lead_hours between 1 and 168)
    or (event_type<>'CONTENT_EXPIRING' and enabled and lead_hours is null)
  )
);

alter table public.announcements enable row level security;
alter table public.notification_settings enable row level security;
revoke all on public.announcements, public.notification_settings from public, anon, authenticated;
commit;

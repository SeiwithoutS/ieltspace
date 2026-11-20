begin;

create index if not exists notifications_unread_by_recipient
  on public.notifications (recipient_id, created_at desc, id desc)
  where read_at is null;

create table if not exists public.support_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id),
  request_id uuid not null,
  content text not null check (length(btrim(content)) between 1 and 3000),
  status text not null default 'PENDING' check (status in ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
  reply text check (reply is null or length(btrim(reply)) between 1 and 3000),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, request_id)
);

create table if not exists public.support_report_updates (
  report_id uuid not null references public.support_reports(id) on delete cascade,
  revision integer not null check (revision > 0),
  actor_id uuid not null references public.users(id),
  previous_status text not null check (previous_status in ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
  status text not null check (status in ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
  reply text check (reply is null or length(btrim(reply)) between 1 and 3000),
  created_at timestamptz not null default now(),
  primary key (report_id, revision)
);

create index if not exists support_reports_created on public.support_reports (created_at desc, id desc);
create index if not exists support_reports_owner_created on public.support_reports (owner_id, created_at desc, id desc);
create index if not exists support_reports_status_created on public.support_reports (status, created_at desc, id desc);

alter table public.support_reports enable row level security;
alter table public.support_report_updates enable row level security;
revoke all on public.support_reports, public.support_report_updates from public, anon, authenticated;

commit;

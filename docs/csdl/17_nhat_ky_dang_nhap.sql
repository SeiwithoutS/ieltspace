begin;

create table if not exists public.user_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  method text not null check (method in ('PASSWORD', 'GOOGLE')),
  session_digest text not null unique check (session_digest ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create index if not exists user_login_events_recent on public.user_login_events (created_at desc, id desc);
create index if not exists user_login_events_by_user on public.user_login_events (user_id, created_at desc, id desc);

alter table public.user_login_events enable row level security;
revoke all on public.user_login_events from public, anon, authenticated;

commit;

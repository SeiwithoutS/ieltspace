begin;

create table if not exists public.admin_action_codes (
  id uuid primary key,
  actor_id uuid not null references public.users(id) on delete cascade,
  code_digest text not null check (code_digest ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  failed_attempts smallint not null default 0 check (failed_attempts between 0 and 5),
  consumed_at timestamptz
);

create index if not exists admin_action_codes_by_actor on public.admin_action_codes (actor_id, created_at desc);

alter table public.admin_action_codes enable row level security;
revoke all on public.admin_action_codes from public, anon, authenticated;

commit;

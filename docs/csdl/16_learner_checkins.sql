begin;

create table if not exists public.learner_checkins (
  user_id uuid not null references public.users(id) on delete cascade,
  checked_in_at timestamptz not null,
  checkin_date date generated always as ((checked_in_at at time zone 'Asia/Ho_Chi_Minh')::date) stored,
  primary key (user_id, checkin_date)
);

alter table public.learner_checkins enable row level security;
revoke all on public.learner_checkins from public, anon, authenticated;

commit;

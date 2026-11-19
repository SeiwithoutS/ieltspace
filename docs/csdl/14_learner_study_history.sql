begin;

alter table public.flashcard_sessions
  add column if not exists title text,
  add column if not exists finish_reason text check (finish_reason in ('completed', 'timeout', 'stopped')),
  add column if not exists elapsed_seconds integer check (elapsed_seconds >= 0);

alter table public.flashcard_sessions drop constraint if exists flashcard_source_valid;
alter table public.flashcard_sessions add constraint flashcard_source_valid check (
  (source_type = 'SET' and set_id is not null)
  or (source_type in ('FAVORITES', 'REVIEW') and set_id is null)
);

create index if not exists study_goals_user_history_idx
  on public.study_goals (user_id, effective_from desc, id desc);
create index if not exists flashcard_sessions_user_history_idx
  on public.flashcard_sessions (user_id, completed_at desc, id desc) where completed_at is not null;

commit;

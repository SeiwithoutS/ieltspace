begin;

create index if not exists learning_activities_user_date_idx
  on public.learning_activities (user_id, activity_date);

insert into public.learning_activities (user_id, activity_type, flashcard_session_id, completed_at)
select s.user_id, 'FLASHCARD', s.id, s.completed_at
from public.flashcard_sessions s
where s.is_qualified and s.completed_at is not null and s.started_at <= s.completed_at
  and s.status in ('COMPLETED', 'ABANDONED')
on conflict (flashcard_session_id) do nothing;

commit;

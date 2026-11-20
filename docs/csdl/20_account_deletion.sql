begin;

create table if not exists public.account_deletion_jobs (
  user_id uuid primary key references public.users(id),
  auth_user_id uuid,
  avatar_reference text,
  recordings text[] not null default '{}',
  lease_id uuid,
  lease_until timestamptz,
  completed_at timestamptz
);
alter table public.account_deletion_jobs enable row level security;
revoke all on public.account_deletion_jobs from public, anon, authenticated;

create or replace function public.ieltspace_stage_account_deletion(target uuid, administrator uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.account_deletion_jobs(user_id, auth_user_id, avatar_reference, recordings)
    select u.id, u.auth_user_id, u.avatar_url,
      array(select distinct s.audio_path from public.submission_contents s
        join public.skill_attempts k on k.id = s.skill_attempt_id join public.attempts a on a.id = k.attempt_id
        where a.user_id = target and nullif(s.audio_path, '') is not null)
    from public.users u where u.id = target;

  update public.users set status = 'DELETED', deleted_at = now(), updated_at = now(),
    auth_user_id = null, full_name = 'Tài khoản đã xóa', display_name = null, email = null, avatar_url = null
    where id = target;
  delete from public.staff_invitations where user_id = target;
  delete from public.admin_action_codes where actor_id = target;

  update public.grading_requests r set status = 'CANCELLED', cancel_reason = 'LEARNER_DELETED',
    cancelled_at = now(), cancelled_by = administrator, cancel_note = null
    from public.skill_attempts k join public.attempts a on a.id = k.attempt_id
    where r.skill_attempt_id = k.id and a.user_id = target and r.status in ('WAITING_ASSIGNMENT', 'ASSIGNED');

  delete from public.grading_scores s using public.grading_reviews review, public.grading_requests r, public.skill_attempts k, public.attempts a
    where s.grading_review_id = review.id and review.grading_request_id = r.id and r.skill_attempt_id = k.id
      and k.attempt_id = a.id and (a.user_id = target or review.teacher_id = target) and review.status = 'DRAFT';
  delete from public.grading_reviews review using public.grading_requests r, public.skill_attempts k, public.attempts a
    where review.grading_request_id = r.id and r.skill_attempt_id = k.id and k.attempt_id = a.id
      and (a.user_id = target or review.teacher_id = target) and review.status = 'DRAFT';
  update public.grading_scores s set comment = null
    from public.grading_reviews review, public.grading_requests r, public.skill_attempts k, public.attempts a
    where s.grading_review_id = review.id and review.grading_request_id = r.id and r.skill_attempt_id = k.id
      and k.attempt_id = a.id and (a.user_id = target or review.teacher_id = target);
  update public.grading_reviews review set general_comment = null
    from public.grading_requests r, public.skill_attempts k, public.attempts a
    where review.grading_request_id = r.id and r.skill_attempt_id = k.id and k.attempt_id = a.id
      and (a.user_id = target or review.teacher_id = target);

  delete from public.submission_contents s using public.skill_attempts k, public.attempts a
    where s.skill_attempt_id = k.id and k.attempt_id = a.id and a.user_id = target;
  delete from public.attempt_answers s using public.skill_attempts k, public.attempts a
    where s.skill_attempt_id = k.id and k.attempt_id = a.id and a.user_id = target;
  delete from public.attempt_section_states s using public.skill_attempts k, public.attempts a
    where s.skill_attempt_id = k.id and k.attempt_id = a.id and a.user_id = target;
  update public.skill_attempts k set content_status = 'DELETED', content_deleted_at = now(),
    status = case when k.status = 'IN_PROGRESS' then 'ABANDONED' else k.status end
    from public.attempts a where k.attempt_id = a.id and a.user_id = target;
  update public.attempts set status = 'ABANDONED' where user_id = target and status = 'IN_PROGRESS';

  delete from public.notifications where recipient_id = target;
  delete from public.learner_checkins where user_id = target;
  delete from public.study_goals where user_id = target;
  delete from public.vocabulary_notes where user_id = target;
  delete from public.favorite_vocabularies where user_id = target;
  delete from public.learning_activities where user_id = target;
  delete from public.flashcard_session_items item using public.flashcard_sessions card
    where item.session_id = card.id and card.user_id = target;
  delete from public.flashcard_sessions where user_id = target;
  delete from public.teacher_permissions where teacher_id = target;
  delete from public.support_credits c where c.user_id = target
    and not exists (select 1 from public.grading_requests r where r.used_credit_id = c.id)
    and not exists (select 1 from public.credit_refunds r where r.bonus_credit_id = c.id);
end;
$$;
revoke all on function public.ieltspace_stage_account_deletion(uuid,uuid) from public, anon, authenticated;

commit;

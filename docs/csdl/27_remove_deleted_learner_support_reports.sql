begin;

create or replace function public.ieltspace_remove_deleted_learner_support_reports()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  -- support_report_updates follows its parent through ON DELETE CASCADE.
  delete from public.support_reports where owner_id = new.id;
  return new;
end;
$$;
revoke all on function public.ieltspace_remove_deleted_learner_support_reports() from public, anon, authenticated;

drop trigger if exists ieltspace_remove_deleted_learner_support_reports on public.users;
create trigger ieltspace_remove_deleted_learner_support_reports
  after update of status on public.users
  for each row when (new.role = 'LEARNER' and new.status = 'DELETED' and old.status is distinct from new.status)
  execute function public.ieltspace_remove_deleted_learner_support_reports();

commit;

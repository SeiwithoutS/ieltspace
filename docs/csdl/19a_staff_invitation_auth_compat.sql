-- Bridge for a project using public.handle_new_auth_user() for public signup.
-- Run before 19 only on that project. The development profile trigger needs no bridge.
begin;

do $$
begin
  if exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'auth.users'::regclass and tgname = 'ieltspace_create_learner_profile' and not tgisinternal
  ) then
    raise exception 'This bridge is only for the on_auth_user_created configuration';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'auth.users'::regclass and tgname = 'on_auth_user_created'
      and tgfoid = 'public.handle_new_auth_user()'::regprocedure and tgenabled <> 'D'
  ) then
    raise exception 'Expected the production Auth profile trigger before installing the bridge';
  end if;
end;
$$;

-- Replaced by migration 19. Until then, an invitation must fail closed.
create or replace function public.ieltspace_create_learner_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  raise exception 'Staff invitation processing is unavailable until migration 19';
end;
$$;
revoke all on function public.ieltspace_create_learner_profile() from public, anon, authenticated;

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row when ((new.raw_app_meta_data ->> 'ieltspace_invitation_proof') is null)
  execute function public.handle_new_auth_user();
create trigger ieltspace_staff_profile_from_invite after insert on auth.users
  for each row when ((new.raw_app_meta_data ->> 'ieltspace_invitation_proof') is not null)
  execute function public.ieltspace_create_learner_profile();

commit;

begin;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgfoid = 'public.ieltspace_create_learner_profile()'::regprocedure and tgenabled <> 'D'
  ) then
    raise exception 'Apply migration 08 and check the Auth profile trigger before migration 19';
  end if;
end;
$$;

alter table public.users drop constraint if exists users_status_check;
alter table public.users add constraint users_status_check
  check (status in ('ACTIVE', 'LOCKED', 'DELETED', 'INVITED'));

create table if not exists public.staff_invitations (
  user_id uuid primary key references public.users(id),
  invited_by uuid not null references public.users(id),
  token_digest text not null unique check (token_digest ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  sent_at timestamptz,
  writing boolean not null default false,
  speaking boolean not null default false,
  max_pending integer not null check (max_pending between 1 and 50)
);
alter table public.staff_invitations enable row level security;
revoke all on public.staff_invitations from public, anon, authenticated;

create or replace function public.ieltspace_create_learner_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  invited_profile public.users%rowtype;
  invitation public.staff_invitations%rowtype;
  proof text := new.raw_app_meta_data ->> 'ieltspace_invitation_proof';
begin
  if proof is not null then
    select * into invited_profile from public.users
      where lower(email) = lower(new.email) and status = 'INVITED' and role in ('TEACHER', 'ADMIN')
      for update;
    if not found then raise exception 'Staff invitation is unavailable'; end if;

    delete from public.staff_invitations
      where user_id = invited_profile.id and token_digest = proof and expires_at > now()
      returning * into invitation;
    if not found then raise exception 'Staff invitation is invalid or expired'; end if;

    update public.users set auth_user_id = new.id, status = 'ACTIVE', updated_at = now() where id = invited_profile.id;
    if invited_profile.role = 'TEACHER' then
      insert into public.teacher_permissions(teacher_id, skill, max_pending)
        select invited_profile.id, item.skill, invitation.max_pending
        from (values ('WRITING', invitation.writing), ('SPEAKING', invitation.speaking)) item(skill, allowed)
        where item.allowed;
    end if;
    insert into public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, change_data)
      values (invited_profile.id, 'USER', 'USER_INVITE_ACCEPTED', 'USER', invited_profile.id,
        jsonb_build_object('before', 'INVITED', 'after', 'ACTIVE'));
  else
    insert into public.users(auth_user_id, email, full_name, role, status)
      values (new.id, new.email, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(split_part(new.email, '@', 1), ''), 'Người học'), 'LEARNER', 'ACTIVE')
      on conflict (auth_user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.ieltspace_create_learner_profile() from public, anon, authenticated;

commit;

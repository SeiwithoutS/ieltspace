begin;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'auth.users'::regclass and not tgisinternal
      and tgfoid = 'public.ieltspace_create_learner_profile()'::regprocedure and tgenabled in ('O', 'A')
  ) then
    raise exception 'Apply migration 19 and verify the Auth profile trigger before migration 24';
  end if;
end;
$$;

alter table public.users add column if not exists must_change_password boolean not null default false;

create or replace function public.ieltspace_create_learner_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  request jsonb := new.raw_app_meta_data -> 'ieltspace_staff_creation';
  route text := new.raw_app_meta_data ->> 'ieltspace_invitation_proof';
  employee_id uuid;
  actor_id uuid;
  staff_role text;
  staff_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  writing boolean;
  speaking boolean;
  max_pending integer;
begin
  -- The invitation proof field also routes Auth inserts on projects using the bridge in 19a.
  if route is null then
    insert into public.users(auth_user_id, email, full_name, role, status)
      values (new.id, new.email, coalesce(staff_name,
        nullif(split_part(new.email, '@', 1), ''), 'Người học'), 'LEARNER', 'ACTIVE')
      on conflict (auth_user_id) do nothing;
    return new;
  end if;

  if route <> 'managed-account-v1' or request is null or
    (new.raw_app_meta_data ->> 'ieltspace_staff_created') is distinct from 'true' then
    raise exception 'Staff account creation is unavailable for this request';
  end if;
  actor_id := (request ->> 'actorId')::uuid;
  staff_role := request ->> 'role';
  if actor_id is null or staff_role is null or staff_role not in ('TEACHER', 'ADMIN')
    or staff_name is null or new.email is null then
    raise exception 'Invalid staff account details';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('ieltspace:admin-accounts', 0));
  perform 1 from public.users where id = actor_id and role = 'ADMIN' and status = 'ACTIVE' for update;
  if not found then raise exception 'Staff account creator is not an active administrator'; end if;
  if exists (select 1 from public.users where lower(email) = lower(new.email)) then
    raise exception 'Staff account email already exists';
  end if;

  insert into public.users(auth_user_id, email, full_name, role, status, must_change_password)
    values (new.id, new.email, staff_name, staff_role, 'ACTIVE', true)
    returning id into employee_id;

  if staff_role = 'TEACHER' then
    writing := coalesce((request ->> 'writing')::boolean, false);
    speaking := coalesce((request ->> 'speaking')::boolean, false);
    max_pending := (request ->> 'maxPending')::integer;
    if not (writing or speaking) or max_pending is null or max_pending not between 1 and 50 then
      raise exception 'Invalid teacher permissions';
    end if;
    insert into public.teacher_permissions(teacher_id, skill, max_pending)
      select employee_id, item.skill, max_pending
      from (values ('WRITING', writing), ('SPEAKING', speaking)) item(skill, allowed)
      where item.allowed;
  end if;

  insert into public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, change_data)
    values (actor_id, 'USER', 'USER_CREATED', 'USER', employee_id,
      jsonb_build_object('after', 'ACTIVE', 'role', staff_role));
  return new;
end;
$$;
revoke all on function public.ieltspace_create_learner_profile() from public, anon, authenticated;

create or replace function public.ieltspace_clear_temporary_password_reminder()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.users set must_change_password = false
    where auth_user_id = new.id and must_change_password;
  return new;
end;
$$;
revoke all on function public.ieltspace_clear_temporary_password_reminder() from public, anon, authenticated;

drop trigger if exists ieltspace_clear_temporary_password_reminder on auth.users;
create trigger ieltspace_clear_temporary_password_reminder
  after update of encrypted_password on auth.users for each row
  when (old.encrypted_password is distinct from new.encrypted_password)
  execute function public.ieltspace_clear_temporary_password_reminder();

commit;

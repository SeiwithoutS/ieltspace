begin;

do $$
begin
  if to_regprocedure('public.ieltspace_clear_temporary_password_reminder()') is null
    or to_regclass('public.user_login_events') is null then
    raise exception 'Apply migrations 17 and 24 before migration 25';
  end if;
end;
$$;

-- Auth Admin can insert auth.users before writing raw_app_meta_data.
create or replace function public.ieltspace_create_learner_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  request jsonb := new.raw_app_meta_data -> 'ieltspace_staff_creation';
  route text := new.raw_app_meta_data ->> 'ieltspace_invitation_proof';
  employee public.users%rowtype;
  actor_id uuid;
  staff_role text;
  staff_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  writing boolean;
  speaking boolean;
  max_pending integer;
  retrying boolean := false;
begin
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

  if tg_op = 'UPDATE' then
    retrying := (old.raw_app_meta_data ->> 'ieltspace_invitation_proof') is not distinct from route
      and (old.raw_app_meta_data ->> 'ieltspace_staff_created') = 'true'
      and (old.raw_app_meta_data -> 'ieltspace_staff_creation') = request
      and (new.raw_app_meta_data ->> 'ieltspace_staff_recovery') ~ '^[a-f0-9]{32}$';
    select * into employee from public.users where auth_user_id = new.id for update;
    -- Normal creation promotes only the learner profile inserted in this same transaction.
    -- Recovery must match a trusted prior attempt whose account has never been used.
    if not found or employee.role <> 'LEARNER' or employee.status <> 'ACTIVE'
      or lower(employee.email) is distinct from lower(new.email) or new.last_sign_in_at is not null
      or (case when retrying then
        exists (select 1 from public.user_login_events where user_id = employee.id)
        or exists (select 1 from public.audit_logs where entity_type = 'USER'
          and entity_id = employee.id and action = 'USER_CREATED')
      else employee.created_at <> transaction_timestamp()
        or (old.raw_app_meta_data ->> 'ieltspace_invitation_proof') is not null end) then
      raise exception 'Staff account profile cannot be provisioned';
    end if;
    update public.users set role = staff_role, must_change_password = true, updated_at = now()
      where id = employee.id;
  else
    if exists (select 1 from public.users where lower(email) = lower(new.email)) then
      raise exception 'Staff account email already exists';
    end if;
    insert into public.users(auth_user_id, email, full_name, role, status, must_change_password)
      values (new.id, new.email, staff_name, staff_role, 'ACTIVE', true)
      returning * into employee;
  end if;

  if staff_role = 'TEACHER' then
    writing := coalesce((request ->> 'writing')::boolean, false);
    speaking := coalesce((request ->> 'speaking')::boolean, false);
    max_pending := (request ->> 'maxPending')::integer;
    if not (writing or speaking) or max_pending is null or max_pending not between 1 and 50 then
      raise exception 'Invalid teacher permissions';
    end if;
    insert into public.teacher_permissions(teacher_id, skill, max_pending)
      select employee.id, item.skill, max_pending
      from (values ('WRITING', writing), ('SPEAKING', speaking)) item(skill, allowed)
      where item.allowed;
  end if;
  insert into public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, change_data)
    values (actor_id, 'USER', 'USER_CREATED', 'USER', employee.id,
      jsonb_build_object('after', 'ACTIVE', 'role', staff_role));
  return new;
end;
$$;
revoke all on function public.ieltspace_create_learner_profile() from public, anon, authenticated;

drop trigger if exists ieltspace_staff_profile_from_metadata on auth.users;
create trigger ieltspace_staff_profile_from_metadata
  after update of raw_app_meta_data on auth.users for each row
  when ((new.raw_app_meta_data ->> 'ieltspace_invitation_proof') = 'managed-account-v1'
    and ((old.raw_app_meta_data ->> 'ieltspace_invitation_proof') is distinct from
      (new.raw_app_meta_data ->> 'ieltspace_invitation_proof')
    or (old.raw_app_meta_data ->> 'ieltspace_staff_recovery') is distinct from
      (new.raw_app_meta_data ->> 'ieltspace_staff_recovery')))
  execute function public.ieltspace_create_learner_profile();

commit;

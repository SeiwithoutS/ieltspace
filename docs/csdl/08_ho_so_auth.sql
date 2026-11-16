-- Chạy trên IELTSpace-dev bằng SQL Editor. Giữ nguyên hồ sơ và quyền đã có.
begin;
create or replace function public.ieltspace_create_learner_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users(auth_user_id, email, full_name, role, status)
  values (new.id, new.email, coalesce(nullif(btrim(new.raw_user_meta_data->>'full_name'),''),
          nullif(split_part(new.email,'@',1),''),'Người học'), 'LEARNER','ACTIVE')
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.ieltspace_create_learner_profile() from public, anon, authenticated;
drop trigger if exists ieltspace_create_learner_profile on auth.users;
create trigger ieltspace_create_learner_profile after insert on auth.users
for each row execute function public.ieltspace_create_learner_profile();

insert into public.users(auth_user_id,email,full_name,role,status)
select a.id,a.email,coalesce(nullif(btrim(a.raw_user_meta_data->>'full_name'),''),
       nullif(split_part(a.email,'@',1),''),'Người học'),'LEARNER','ACTIVE'
from auth.users a where not exists(select from public.users u where u.auth_user_id=a.id)
on conflict (auth_user_id) do nothing;
commit;

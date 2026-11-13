-- IELTSpace · 05: danh mục bộ đề thành bảng riêng, tên bộ đề không trùng, exam_skills.updated_at.
-- Chạy sau 01_tao_cau_truc_moi.sql (project mới) hoặc sau 04_nang_cap_tu_01.sql (database cũ).
-- Chạy cả tệp trong một lần. Chạy lần hai sẽ dừng ở bước kiểm tra, không đổi gì.
begin;
do $$
begin
 if to_regclass('public.exam_set_categories') is not null then
  raise exception '05 đã chạy trên database này.';
 end if;
 if not exists(select from information_schema.columns
   where table_schema='public' and table_name='exam_sets' and column_name='category') then
  raise exception 'Chưa có exam_sets.category: chạy 01 mới hoặc 04 trước.';
 end if;
 if exists(select from public.exam_sets group by lower(btrim(name)) having count(*)>1) then
  raise exception 'Có bộ đề trùng tên (không phân biệt hoa thường, khoảng trắng đầu cuối). Đổi tên trước khi chạy 05.';
 end if;
end $$;

-- Danh mục do Quản lý tạo thêm từ combo box "Tạo danh mục X". code chỉ có ở 5 danh mục gốc.
create table public.exam_set_categories (
 id uuid primary key default gen_random_uuid(),
 code text unique,
 name text not null check(length(btrim(name)) between 1 and 60),
 order_no integer not null default 100 check(order_no>0),
 created_by uuid references public.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index exam_set_categories_name_unique on public.exam_set_categories(lower(btrim(name)));
insert into public.exam_set_categories(code,name,order_no) values
 ('MOCK_TEST','Mock Test',1),('ACTUAL_TEST','Actual Test',2),('PRACTICE_TEST','Practice Test',3),
 ('FORECAST','Forecast',4),('OTHER','Khác',99);

alter table public.exam_sets add column category_id uuid references public.exam_set_categories(id);
update public.exam_sets s set category_id=c.id from public.exam_set_categories c where c.code=s.category;
alter table public.exam_sets alter column category_id set not null;
drop index public.exam_sets_library;
alter table public.exam_sets drop column category;
create index exam_sets_library on public.exam_sets(category_id,published_at desc) where status='PUBLISHED';
create unique index exam_sets_name_unique on public.exam_sets(lower(btrim(name)));

-- Ngày "Cập nhật" của Test và bộ đề tính cả lần ẩn/hiện/đăng một kỹ năng.
alter table public.exam_skills add column updated_at timestamptz not null default now();
update public.exam_skills set updated_at=coalesce(published_at,created_at);
create trigger set_updated_at before update on public.exam_skills
 for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.exam_set_categories
 for each row execute function public.set_updated_at();

-- Giống các bảng khác: chỉ backend (kết nối server) truy cập, không mở cho anon/authenticated.
alter table public.exam_set_categories enable row level security;
revoke all on table public.exam_set_categories from anon, authenticated;
commit;

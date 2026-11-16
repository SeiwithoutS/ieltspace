-- IELTSpace · Bổ sung phần từ vựng cho project đã có 01 cũ.
-- Trước khi chạy: xác nhận đúng project, có bản sao lưu có thể phục hồi.
-- Chạy nguyên file trong SQL Editor. Không chạy lại 01, 02, 03 hoặc 08.
-- Chỉ chạy một lần. Nếu bảng nháp đã có, dừng để đối chiếu schema.
begin;
set local lock_timeout = '5s';

-- Kiểm tra các cột mà API cần. Nếu bản 01 trên máy chủ khác bản trong repo,
-- PostgreSQL báo tên bảng/cột thiếu và hủy giao dịch.
select id, auth_user_id, role, status from public.users limit 0;
select id, name, description, status, updated_at from public.vocabulary_sets limit 0;
select id, word, phonetic, definitions, audio_url, sources, status, updated_at
from public.vocabularies limit 0;
select id, set_id, vocabulary_id, order_no from public.vocabulary_set_items limit 0;
select user_id, vocabulary_id from public.favorite_vocabularies limit 0;
select user_id, vocabulary_id, content, updated_at from public.vocabulary_notes limit 0;

do $$
begin
  if to_regclass('public.vocabulary_set_drafts') is not null then
    raise exception 'Bảng nháp đã tồn tại. Đối chiếu các cột, khóa và RLS trước khi triển khai.';
  end if;
  if exists (select from public.vocabulary_sets) then
    raise exception 'Đã có bộ từ trên DB đích. Cần ánh xạ bộ cũ thành bản nháp và bản công bố trước khi chuyển UI; giữ nguyên dữ liệu.';
  end if;
end $$;

create table public.vocabulary_set_drafts (
  set_id uuid primary key references public.vocabulary_sets(id),
  revision integer not null default 0 check (revision >= 0),
  content jsonb not null default '{"words":[]}'::jsonb check (jsonb_typeof(content) = 'object'),
  updated_by uuid references public.users(id),
  updated_at timestamptz not null default now()
);
alter table public.vocabulary_set_drafts enable row level security;
revoke all on table public.vocabulary_set_drafts from public, anon, authenticated;
commit;

-- Kiểm tra chỉ đọc sau khi chạy. Hai trigger trong ảnh cần ở trạng thái
-- hoạt động (O là trạng thái thông thường). Số user không được đổi do script này.
select (select count(*) from auth.users) as auth_users,
       (select count(*) from public.users) as profiles,
       (select count(*) from public.vocabulary_set_drafts) as drafts;
select tgname, tgenabled from pg_trigger
where tgrelid = 'auth.users'::regclass and not tgisinternal order by tgname;
select tablename, rowsecurity from pg_tables where schemaname = 'public'
and tablename in ('vocabulary_sets','vocabulary_set_drafts','vocabularies',
                  'vocabulary_set_items','favorite_vocabularies','vocabulary_notes');

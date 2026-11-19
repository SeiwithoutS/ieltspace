-- SAMPLE-01 đợt 5. Chạy sau SQL 11; độc lập với các bảng nhập đề thi.
begin;
set local lock_timeout = '5s';

create table public.sample_import_receipts (
  request_key uuid primary key,
  created_by uuid not null references public.users(id),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  file_name text not null check (char_length(file_name) between 1 and 255),
  result jsonb not null check (jsonb_typeof(result) = 'object'),
  created_at timestamptz not null default now()
);

alter table public.sample_import_receipts enable row level security;
revoke all on table public.sample_import_receipts from public, anon, authenticated;

commit;

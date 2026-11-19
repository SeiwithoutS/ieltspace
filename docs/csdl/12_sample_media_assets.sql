-- SAMPLE-01 đợt 4. Dùng sau SQL 11. Bucket tạo qua Supabase Storage API.
begin;
set local lock_timeout = '5s';

create table public.sample_media_assets (
  id uuid primary key,
  sample_id uuid not null
    references public.sample_answers(id)
    on delete restrict,

  kind text not null
    check (kind in ('cover', 'prompt-image', 'audio')),

  bucket text not null,
  path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,

  -- DELETING dành cho quy trình dọn file có khóa, chưa bật tự động.
  state text not null default 'READY'
    check (state in ('READY', 'DELETING')),

  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),

  constraint sample_media_assets_object_uq unique (bucket, path),

  constraint sample_media_assets_name_ck
    check (char_length(original_name) between 1 and 255),

  constraint sample_media_assets_size_type_ck check (
    (
      kind in ('cover', 'prompt-image')
      and mime_type in ('image/jpeg', 'image/png', 'image/webp')
      and size_bytes between 1 and 5242880
    )
    or
    (
      kind = 'audio'
      and mime_type in ('audio/mpeg', 'audio/wav', 'audio/mp4')
      and size_bytes between 1 and 52428800
    )
  )
);

create index sample_media_assets_sample_idx
  on public.sample_media_assets(sample_id);

create index sample_media_assets_cleanup_idx
  on public.sample_media_assets(state, created_at);

alter table public.sample_media_assets enable row level security;

revoke all on table public.sample_media_assets
  from public, anon, authenticated;

commit;

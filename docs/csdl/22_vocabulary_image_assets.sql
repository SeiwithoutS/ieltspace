begin;

create table if not exists public.vocabulary_image_assets (
  id uuid primary key,
  bucket text not null,
  object_key text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 1048576),
  source text not null check (source in ('UPLOAD', 'PIXABAY')),
  state text not null default 'PENDING' check (state in ('PENDING', 'READY', 'DELETING')),
  created_at timestamptz not null default now(),
  unique (bucket, object_key)
);

create index if not exists vocabulary_image_assets_created
  on public.vocabulary_image_assets (created_at, id);
create index if not exists vocabulary_drafts_published_cover
  on public.vocabulary_set_drafts ((content->'publishedSet'->>'cover'));
create index if not exists vocabularies_published_image
  on public.vocabularies ((definitions->0->>'image'));

alter table public.vocabulary_image_assets enable row level security;
revoke all on public.vocabulary_image_assets from public, anon, authenticated;

commit;

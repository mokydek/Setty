-- 0011_style_embeddings.sql
-- Storage for the v1 style-similarity scorer: one centroid embedding per
-- collection, computed by scripts/embed-collections.mjs from the approved
-- assets of that collection.
--
-- Apply via the Supabase SQL editor after 0010_notifications.sql.

create table if not exists public.collection_embeddings (
  collection_id uuid primary key references public.collections (id) on delete cascade,
  updated_at timestamptz not null default now(),
  -- CLIP embedding centroid; stored as a float array to avoid requiring the
  -- pgvector extension for a v1 (cosine similarity is computed in the Edge
  -- Function, not in SQL).
  centroid double precision[] not null,
  sample_count int not null default 0
);

alter table public.collection_embeddings enable row level security;

-- Read-only from the client; written only by the service role (backfill
-- script and Edge Functions).
create policy "collection_embeddings_select_public"
  on public.collection_embeddings for select
  using (true);

-- Persist per-asset scores so curators see them in the queue.
alter table public.assets
  add column if not exists style_score double precision,
  add column if not exists style_verdict text
    check (style_verdict in ('pass', 'review', 'fail'));

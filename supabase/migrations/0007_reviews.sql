-- 0007_reviews.sql
-- Verified-purchase reviews with 1..5 ratings. One review per buyer per
-- asset; only actual buyers can write one.
--
-- Apply via the Supabase SQL editor after 0006_search.sql.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  rating int not null check (rating between 1 and 5),
  text text not null default '',
  unique (asset_id, user_id)
);

alter table public.reviews enable row level security;

create policy "reviews_select_public"
  on public.reviews for select
  using (true);

-- Verified purchase only: the insert must match an existing purchase row.
create policy "reviews_insert_verified_buyer"
  on public.reviews for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.purchases p
      where p.user_id = auth.uid()
        and p.asset_id = reviews.asset_id
    )
  );

create policy "reviews_update_own"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- Aggregates for cards and lists: one row per reviewed asset.
create or replace view public.asset_ratings as
  select
    asset_id,
    round(avg(rating)::numeric, 2) as avg_rating,
    count(*)::int as review_count
  from public.reviews
  group by asset_id;

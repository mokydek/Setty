-- 0001_enable_rls.sql
-- Enables Row Level Security on all Setty tables and defines the access
-- policies. Without this, the browser anon key allows anyone to read and
-- write arbitrary rows straight through the Supabase REST API.
--
-- Apply via the Supabase SQL editor (see README, "Database security").

-- ---------------------------------------------------------------------------
-- Integrity constraints
-- ---------------------------------------------------------------------------

alter table public.assets
  add constraint assets_price_non_negative check (price >= 0);

alter table public.bounties
  add constraint bounties_reward_positive check (reward > 0);

alter table public.bounties
  add constraint bounties_status_valid check (
    status in ('open', 'in_progress', 'submitted', 'approved', 'paid', 'cancelled')
  );

-- One purchase per (user, asset). Also makes purchase inserts idempotent.
alter table public.purchases
  add constraint purchases_user_asset_unique unique (user_id, asset_id);

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------

alter table public.assets enable row level security;
alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.bounties enable row level security;

-- ---------------------------------------------------------------------------
-- assets: public catalogue, seller-owned rows
-- ---------------------------------------------------------------------------

create policy "assets_select_public"
  on public.assets for select
  using (true);

create policy "assets_insert_own"
  on public.assets for insert
  to authenticated
  with check (auth.uid() = seller_id);

create policy "assets_update_own"
  on public.assets for update
  to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "assets_delete_own"
  on public.assets for delete
  to authenticated
  using (auth.uid() = seller_id);

-- ---------------------------------------------------------------------------
-- profiles: public read, self-managed, never deletable
-- ---------------------------------------------------------------------------

create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No DELETE policy on profiles: with RLS enabled and no policy, deletes are
-- denied for everyone using the anon/authenticated roles.

-- ---------------------------------------------------------------------------
-- purchases: private to the buyer, append-only
-- ---------------------------------------------------------------------------

create policy "purchases_select_own"
  on public.purchases for select
  to authenticated
  using (auth.uid() = user_id);

create policy "purchases_insert_own"
  on public.purchases for insert
  to authenticated
  with check (auth.uid() = user_id);

-- No UPDATE/DELETE policies: purchase history is immutable from the client.

-- ---------------------------------------------------------------------------
-- bounties: public board, creator-owned, assignee can update status
-- ---------------------------------------------------------------------------

create policy "bounties_select_public"
  on public.bounties for select
  using (true);

create policy "bounties_insert_own"
  on public.bounties for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "bounties_update_creator_or_assignee"
  on public.bounties for update
  to authenticated
  using (auth.uid() = user_id or auth.uid() = assignee_id)
  with check (auth.uid() = user_id or auth.uid() = assignee_id);

create policy "bounties_delete_creator_while_open"
  on public.bounties for delete
  to authenticated
  using (auth.uid() = user_id and status = 'open');

-- ---------------------------------------------------------------------------
-- storage: asset-images bucket (public previews)
-- Public read; authenticated users may only write inside a folder named
-- after their own auth.uid(); only the owner may update or delete.
-- ---------------------------------------------------------------------------

create policy "asset_images_public_read"
  on storage.objects for select
  using (bucket_id = 'asset-images');

create policy "asset_images_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'asset-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "asset_images_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'asset-images'
    and owner = auth.uid()
  )
  with check (
    bucket_id = 'asset-images'
    and owner = auth.uid()
  );

create policy "asset_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'asset-images'
    and owner = auth.uid()
  );

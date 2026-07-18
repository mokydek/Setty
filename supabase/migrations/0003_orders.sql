-- 0003_orders.sql
-- Payment plumbing for Lemon Squeezy checkouts. Orders are written only by
-- the ls-webhook Edge Function (service role); the unique Lemon Squeezy
-- order id makes webhook processing idempotent.
--
-- Apply via the Supabase SQL editor after 0002_asset_files.sql.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ls_order_id text not null unique,
  user_id uuid not null references auth.users (id),
  asset_ids uuid[] not null,
  total_cents bigint not null check (total_cents >= 0),
  currency text not null default 'USD'
);

alter table public.orders enable row level security;

-- Buyers can see their own orders. There are intentionally no INSERT,
-- UPDATE or DELETE policies: only the service role (webhook) writes here.
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

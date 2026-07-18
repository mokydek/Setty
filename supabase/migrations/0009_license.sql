-- 0009_license.sql
-- License metadata: every asset carries the standard Setty license; sellers
-- record when they accepted the seller terms.
--
-- Apply via the Supabase SQL editor after 0008_collections.sql.

alter table public.assets
  add column if not exists license text not null default 'standard';

alter table public.profiles
  add column if not exists sellers_accepted_terms_at timestamptz;

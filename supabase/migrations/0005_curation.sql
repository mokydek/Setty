-- 0005_curation.sql
-- Curation pipeline: nothing reaches the public marketplace until a curator
-- approves it. This protects Setty's core promise of strict style curation.
--
-- Apply via the Supabase SQL editor after 0004_bounty_lifecycle.sql.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

alter table public.assets
  add column if not exists review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected')),
  add column if not exists rejection_reason text;

alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'curator'));

-- Grandfather existing catalogue: assets published before curation existed
-- stay visible.
update public.assets set review_status = 'approved' where review_status = 'pending';

-- ---------------------------------------------------------------------------
-- Helper: is the current user a curator?
-- SECURITY DEFINER so policies can consult profiles without recursive RLS.
-- ---------------------------------------------------------------------------

create or replace function public.is_curator()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'curator'
  );
$$;

-- ---------------------------------------------------------------------------
-- assets policies: public sees only approved; sellers always see their own;
-- curators see everything and can update review_status.
-- ---------------------------------------------------------------------------

drop policy if exists "assets_select_public" on public.assets;

create policy "assets_select_approved_or_own_or_curator"
  on public.assets for select
  using (
    review_status = 'approved'
    or seller_id = auth.uid()
    or public.is_curator()
  );

create policy "assets_update_curator"
  on public.assets for update
  to authenticated
  using (public.is_curator())
  with check (public.is_curator());

-- Note: profiles.role must not be self-assignable. profiles_update_self
-- already allows owners to update their row, so add a trigger guard.
create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_curator() then
    raise exception 'Only curators can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();

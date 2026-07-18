-- 0004_bounty_lifecycle.sql
-- Full bounty lifecycle: artists submit work, creators review it.
-- Statuses: open -> in_progress -> submitted -> approved
--                        ^______________|  (request changes)
-- plus cancelled (creator, only while open). 'paid' is reserved for the
-- future payout hook.
--
-- Apply via the Supabase SQL editor after 0003_orders.sql.

create table if not exists public.bounty_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  bounty_id uuid not null references public.bounties (id) on delete cascade,
  artist_id uuid not null references auth.users (id),
  file_path text not null,
  preview_url text,
  comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_comment text
);

alter table public.bounty_submissions enable row level security;

-- Only the two parties of a bounty see its submissions.
create policy "bounty_submissions_select_parties"
  on public.bounty_submissions for select
  to authenticated
  using (
    artist_id = auth.uid()
    or exists (
      select 1 from public.bounties b
      where b.id = bounty_id and b.user_id = auth.uid()
    )
  );

-- Only the assigned artist submits, and only while work is in progress.
create policy "bounty_submissions_insert_assignee"
  on public.bounty_submissions for insert
  to authenticated
  with check (
    artist_id = auth.uid()
    and exists (
      select 1 from public.bounties b
      where b.id = bounty_id
        and b.assignee_id = auth.uid()
        and b.status = 'in_progress'
    )
  );

-- Only the bounty creator reviews (approve / reject with a comment).
create policy "bounty_submissions_update_creator"
  on public.bounty_submissions for update
  to authenticated
  using (
    exists (
      select 1 from public.bounties b
      where b.id = bounty_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bounties b
      where b.id = bounty_id and b.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Private bucket for bounty work files (200 MB per file)
-- Layout: {artist_id}/{bounty_id}/{filename}
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('bounty-files', 'bounty-files', false, 209715200)
on conflict (id) do nothing;

create policy "bounty_files_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'bounty-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- The artist always reads their own uploads. The bounty creator gets read
-- access (and therefore signed URLs) only once a submission referencing the
-- file has been approved: the work is escrowed until acceptance.
create policy "bounty_files_select_artist_or_approved_creator"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'bounty-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.bounty_submissions s
        join public.bounties b on b.id = s.bounty_id
        where s.file_path = storage.objects.name
          and s.status = 'approved'
          and b.user_id = auth.uid()
      )
    )
  );

create policy "bounty_files_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'bounty-files' and owner = auth.uid())
  with check (bucket_id = 'bounty-files' and owner = auth.uid());

create policy "bounty_files_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'bounty-files' and owner = auth.uid());

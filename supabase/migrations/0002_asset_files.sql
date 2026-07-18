-- 0002_asset_files.sql
-- Real asset file delivery: sellers upload the actual product file (zip,
-- fbx, glb, png) into a PRIVATE bucket; buyers download it via signed URLs.
--
-- Apply via the Supabase SQL editor after 0001_enable_rls.sql.

-- ---------------------------------------------------------------------------
-- assets: file metadata columns
-- ---------------------------------------------------------------------------

alter table public.assets
  add column if not exists file_path text,
  add column if not exists file_size_bytes bigint,
  add column if not exists file_format text;

-- ---------------------------------------------------------------------------
-- Private bucket for product files (200 MB per file)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('asset-files', 'asset-files', false, 209715200)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- storage policies for asset-files
-- Layout: {seller_id}/{asset_id}/{filename}
-- ---------------------------------------------------------------------------

-- Sellers upload only inside their own auth.uid() folder.
create policy "asset_files_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'asset-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read (required for createSignedUrl with the user JWT) is allowed for:
--   1. the seller, inside their own folder;
--   2. any user who has purchased the asset that references this object.
-- There is NO public read: the bucket is private, so anonymous access and
-- direct unsigned URLs are impossible.
create policy "asset_files_select_seller_or_buyer"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'asset-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.purchases p
        join public.assets a on a.id = p.asset_id
        where p.user_id = auth.uid()
          and a.file_path = storage.objects.name
      )
    )
  );

create policy "asset_files_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'asset-files' and owner = auth.uid())
  with check (bucket_id = 'asset-files' and owner = auth.uid());

create policy "asset_files_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'asset-files' and owner = auth.uid());

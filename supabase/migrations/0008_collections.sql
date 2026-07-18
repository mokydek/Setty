-- 0008_collections.sql
-- Collections become a first-class entity: a curated, style-guaranteed set
-- of assets with its own page, instead of a raw style string filter.
--
-- Apply via the Supabase SQL editor after 0007_reviews.sql.

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  name_en text not null,
  name_ru text not null,
  description_en text not null default '',
  description_ru text not null default '',
  cover_url text,
  style text not null
);

alter table public.collections enable row level security;

create policy "collections_select_public"
  on public.collections for select
  using (true);

-- Curators manage collections.
create policy "collections_insert_curator"
  on public.collections for insert
  to authenticated
  with check (public.is_curator());

create policy "collections_update_curator"
  on public.collections for update
  to authenticated
  using (public.is_curator())
  with check (public.is_curator());

-- ---------------------------------------------------------------------------
-- assets: collection link + category (powers the completeness meter)
-- ---------------------------------------------------------------------------

alter table public.assets
  add column if not exists collection_id uuid references public.collections (id),
  add column if not exists category text not null default 'prop'
    check (category in ('environment', 'character', 'prop', 'vfx', 'ui'));

-- ---------------------------------------------------------------------------
-- Seed the four existing styles as collections
-- ---------------------------------------------------------------------------

insert into public.collections (slug, name_en, name_ru, description_en, description_ru, style)
values
  ('low-poly', 'Low Poly', 'Лоу поли',
   'Clean geometric silhouettes and flat shading. Every asset in this collection shares the same polygon budget and palette discipline.',
   'Чистые геометричные силуэты и плоская заливка. Все ассеты коллекции выдержаны в едином бюджете полигонов и палитре.',
   'lowPoly'),
  ('cyberpunk', 'Cyberpunk', 'Киберпанк',
   'Neon-soaked dystopia: emissive signage, wet asphalt, harsh contrast. Strict palette and lighting rules keep every piece compatible.',
   'Неоновая антиутопия: светящиеся вывески, мокрый асфальт, жёсткий контраст. Строгие правила палитры и света делают все элементы совместимыми.',
   'cyberpunk'),
  ('hand-painted', 'Hand Painted', 'Ручная отрисовка',
   'Stylized brushwork with soft gradients and painterly texture. Unified stroke density and saturation across the whole set.',
   'Стилизованная живопись с мягкими градиентами и фактурой мазка. Единая плотность штриха и насыщенность по всему набору.',
   'handPainted'),
  ('realistic', 'Realistic', 'Реализм',
   'PBR-accurate materials and true-to-scale proportions. Calibrated albedo and roughness ranges guarantee visual consistency.',
   'PBR-точные материалы и достоверные пропорции. Откалиброванные диапазоны albedo и roughness гарантируют визуальную целостность.',
   'realistic')
on conflict (slug) do nothing;

-- Backfill: attach existing assets to their style's collection.
update public.assets a
set collection_id = c.id
from public.collections c
where a.collection_id is null and c.style = a.style;

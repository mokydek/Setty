-- 0006_search.sql
-- Real full-text search over assets: a generated tsvector column with a GIN
-- index, plus a search_assets(term) RPC that ranks by ts_rank and falls back
-- to ilike so short and partial terms still match.
--
-- Apply via the Supabase SQL editor after 0005_curation.sql.

alter table public.assets
  add column if not exists search_vector tsvector
    generated always as (
      setweight(to_tsvector('english', coalesce(title, '')), 'A')
      || setweight(to_tsvector('english', coalesce(author_name, '')), 'B')
      || setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) stored;

create index if not exists idx_assets_search_vector
  on public.assets using gin (search_vector);

-- SECURITY INVOKER (the default): RLS on assets still applies, so callers
-- only ever see rows they are allowed to see. The function itself also
-- restricts to the approved catalogue.
create or replace function public.search_assets(term text)
returns setof public.assets
language sql
stable
as $$
  select a.*
  from public.assets a
  where a.review_status = 'approved'
    and (
      a.search_vector @@ websearch_to_tsquery('english', term)
      or a.title ilike '%' || term || '%'
      or a.author_name ilike '%' || term || '%'
    )
  order by
    ts_rank(a.search_vector, websearch_to_tsquery('english', term)) desc,
    a.created_at desc;
$$;

-- 0012_metrics.sql
-- Founder metrics: SQL views for GMV, purchases, active sellers and bounty
-- fill stats, exposed through a single curator-gated RPC (the views
-- themselves are not granted to API roles).
--
-- Apply via the Supabase SQL editor after 0011_style_embeddings.sql.

create or replace view public.metrics_gmv_by_month as
  select
    date_trunc('month', p.created_at) as month,
    round(sum(a.price)::numeric, 2) as gmv,
    count(*)::int as purchases
  from public.purchases p
  join public.assets a on a.id = p.asset_id
  group by 1
  order by 1;

create or replace view public.metrics_bounty_fill as
  select
    count(*) filter (where status <> 'cancelled')::int as posted,
    count(*) filter (where assignee_id is not null)::int as accepted,
    percentile_cont(0.5) within group (
      order by extract(epoch from (now() - created_at)) / 3600.0
    ) filter (where assignee_id is not null) as median_hours_to_fill
  from public.bounties;

-- Views are only for the RPC below: hide them from the API roles.
revoke all on public.metrics_gmv_by_month from anon, authenticated;
revoke all on public.metrics_bounty_fill from anon, authenticated;

-- Curator-gated metrics snapshot.
create or replace function public.get_founder_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result jsonb;
begin
  if not public.is_curator() then
    raise exception 'Curator role required';
  end if;

  select jsonb_build_object(
    'gmv_by_month', coalesce(
      (select jsonb_agg(jsonb_build_object(
        'month', to_char(month, 'YYYY-MM'),
        'gmv', gmv,
        'purchases', purchases
      ) order by month) from public.metrics_gmv_by_month),
      '[]'::jsonb
    ),
    'total_gmv', coalesce((select sum(gmv) from public.metrics_gmv_by_month), 0),
    'total_purchases', coalesce((select sum(purchases) from public.metrics_gmv_by_month), 0),
    'active_sellers', (
      select count(distinct seller_id) from public.assets where review_status = 'approved'
    ),
    'bounty_fill', (
      select jsonb_build_object(
        'posted', posted,
        'accepted', accepted,
        'fill_rate', case when posted > 0 then round(accepted::numeric / posted, 2) else 0 end,
        'median_hours_to_fill', round(coalesce(median_hours_to_fill, 0)::numeric, 1)
      ) from public.metrics_bounty_fill
    )
  ) into result;

  return result;
end;
$$;

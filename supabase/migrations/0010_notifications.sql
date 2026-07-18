-- 0010_notifications.sql
-- Email notifications: profiles.locale for EN/RU copy, plus triggers that
-- call the send-email Edge Function (via pg_net) on the events that matter:
--   * purchases insert            -> buyer receipt + seller sale notice
--   * bounties status change      -> both parties
--   * assets review_status change -> seller
--
-- Setup (once, in the SQL editor, BEFORE running the triggers below):
--   insert into public.app_config (key, value) values
--     ('edge_send_email_url', 'https://<project-ref>.functions.supabase.co/send-email'),
--     ('email_hook_secret', '<the same value as the EMAIL_HOOK_SECRET function secret>')
--   on conflict (key) do update set value = excluded.value;
--
-- Apply via the Supabase SQL editor after 0009_license.sql.

create extension if not exists pg_net;

-- Locale for email copy. The app stores 'en' or 'ru'.
alter table public.profiles
  add column if not exists locale text not null default 'en'
    check (locale in ('en', 'ru'));

-- Private key-value config for triggers. RLS enabled with NO policies: only
-- the service role and the postgres role (which triggers run as) can read it.
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

alter table public.app_config enable row level security;

-- ---------------------------------------------------------------------------
-- Helper that posts an event to the send-email function. Fire-and-forget:
-- pg_net queues the request; a missing config row simply skips the email so
-- local databases without the function keep working.
-- ---------------------------------------------------------------------------

create or replace function public.notify_send_email(event jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  url text;
  secret text;
begin
  select value into url from public.app_config where key = 'edge_send_email_url';
  if url is null then
    return;
  end if;
  select value into secret from public.app_config where key = 'email_hook_secret';

  perform net.http_post(
    url := url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-email-hook-secret', coalesce(secret, '')
    ),
    body := event
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.on_purchase_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_send_email(jsonb_build_object(
    'type', 'purchase_created',
    'user_id', new.user_id,
    'asset_id', new.asset_id
  ));
  return new;
end;
$$;

drop trigger if exists purchases_email_trigger on public.purchases;
create trigger purchases_email_trigger
  after insert on public.purchases
  for each row execute function public.on_purchase_created();

create or replace function public.on_bounty_status_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    perform public.notify_send_email(jsonb_build_object(
      'type', 'bounty_status_changed',
      'bounty_id', new.id,
      'old_status', old.status,
      'new_status', new.status
    ));
  end if;
  return new;
end;
$$;

drop trigger if exists bounties_email_trigger on public.bounties;
create trigger bounties_email_trigger
  after update on public.bounties
  for each row execute function public.on_bounty_status_changed();

create or replace function public.on_asset_review_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.review_status is distinct from old.review_status then
    perform public.notify_send_email(jsonb_build_object(
      'type', 'asset_review_changed',
      'asset_id', new.id,
      'review_status', new.review_status,
      'rejection_reason', new.rejection_reason
    ));
  end if;
  return new;
end;
$$;

drop trigger if exists assets_review_email_trigger on public.assets;
create trigger assets_review_email_trigger
  after update on public.assets
  for each row execute function public.on_asset_review_changed();

import posthog from 'posthog-js'

// Typed product analytics via PostHog (EU cloud). Cookieless and
// consent-aware: memory-only persistence (no cookies, no localStorage
// identifiers), Do-Not-Track respected, and no PII in event payloads.

export type AnalyticsEvent =
  | { name: 'asset_viewed'; props: { asset_id: string; style: string } }
  | { name: 'added_to_cart'; props: { asset_id: string } }
  | { name: 'checkout_started'; props: { asset_count: number; value: number } }
  | { name: 'purchase_completed'; props: { asset_count: number; value: number } }
  | { name: 'bounty_posted'; props: { style: string; reward: number } }
  | { name: 'bounty_accepted'; props: { bounty_id: string } }
  | { name: 'bounty_submitted'; props: { bounty_id: string } }
  | { name: 'bounty_approved'; props: { bounty_id: string } }
  | { name: 'asset_submitted'; props: { style: string; price: number } }
  | { name: 'search_performed'; props: { query: string; result_count: number } }

let initialized = false

function dntEnabled(): boolean {
  return (
    navigator.doNotTrack === '1' ||
    (window as Window & { doNotTrack?: string }).doNotTrack === '1'
  )
}

export function initAnalytics() {
  const key: string | undefined = import.meta.env.VITE_POSTHOG_KEY
  if (!key || dntEnabled() || initialized) return

  posthog.init(key, {
    api_host: 'https://eu.i.posthog.com',
    persistence: 'memory',
    autocapture: false,
    capture_pageview: true,
    disable_session_recording: true,
  })
  initialized = true
}

export function track(event: AnalyticsEvent) {
  if (!initialized) return
  posthog.capture(event.name, event.props)
}

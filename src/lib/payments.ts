import { supabase } from '../backend/supabase'

// When true, checkout goes through the Lemon Squeezy Edge Function and the
// client-side insert into purchases is disabled. When false (local dev),
// the legacy free-insert path stays active.
export const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true'

const PENDING_CHECKOUT_KEY = 'setty-pending-checkout'

export async function createCheckout(
  assetIds: string[],
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { asset_ids: assetIds },
  })

  if (error) {
    return { url: null, error: error.message }
  }

  const url = (data as { url?: string; error?: string } | null)?.url
  if (!url) {
    return { url: null, error: (data as { error?: string } | null)?.error ?? 'No checkout URL returned.' }
  }

  return { url, error: null }
}

// The success page needs to know which assets to poll for after Lemon
// Squeezy redirects back; sessionStorage survives the round-trip.
export function rememberPendingCheckout(assetIds: string[]) {
  window.sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(assetIds))
}

export function readPendingCheckout(): string[] {
  try {
    const raw = window.sessionStorage.getItem(PENDING_CHECKOUT_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function clearPendingCheckout() {
  window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY)
}

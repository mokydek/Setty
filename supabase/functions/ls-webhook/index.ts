// Supabase Edge Function: ls-webhook
// Receives Lemon Squeezy webhooks, verifies the HMAC signature and, on
// order_created, records the order and grants the purchases. Idempotent:
// orders.ls_order_id is unique and purchases has a unique (user_id, asset_id).
//
// Deploy: supabase functions deploy ls-webhook --no-verify-jwt
// Secrets: supabase secrets set LEMONSQUEEZY_WEBHOOK_SECRET=...

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const secret = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET')
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set')
    return new Response('Server misconfigured', { status: 500 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('X-Signature') ?? ''

  if (!(await verifySignature(rawBody, signature, secret))) {
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: { user_id?: string; asset_ids?: string } }
    data?: { id?: string; attributes?: { total?: number; currency?: string } }
  }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (payload.meta?.event_name !== 'order_created') {
    return new Response('Ignored', { status: 200 })
  }

  const userId = payload.meta?.custom_data?.user_id
  const assetIds = (payload.meta?.custom_data?.asset_ids ?? '').split(',').filter(Boolean)
  const lsOrderId = payload.data?.id

  if (!userId || assetIds.length === 0 || !lsOrderId) {
    console.error('order_created without custom data:', JSON.stringify(payload.meta))
    return new Response('Missing custom data', { status: 400 })
  }

  // Service role: bypasses RLS. This key must only ever live in function secrets.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { error: orderError } = await supabase.from('orders').insert({
    ls_order_id: lsOrderId,
    user_id: userId,
    asset_ids: assetIds,
    total_cents: payload.data?.attributes?.total ?? 0,
    currency: payload.data?.attributes?.currency ?? 'USD',
  })

  // 23505 = duplicate ls_order_id: the webhook was already processed.
  if (orderError) {
    if (orderError.code === '23505') {
      return new Response('Already processed', { status: 200 })
    }
    console.error('orders insert failed:', orderError)
    return new Response('Order insert failed', { status: 500 })
  }

  const { error: purchasesError } = await supabase
    .from('purchases')
    .upsert(
      assetIds.map((assetId) => ({ user_id: userId, asset_id: assetId })),
      { onConflict: 'user_id,asset_id', ignoreDuplicates: true },
    )

  if (purchasesError) {
    console.error('purchases upsert failed:', purchasesError)
    return new Response('Purchase grant failed', { status: 500 })
  }

  return new Response('OK', { status: 200 })
})

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  if (!signature) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expected = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // Constant-time comparison.
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

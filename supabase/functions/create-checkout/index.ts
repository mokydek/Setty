// Supabase Edge Function: create-checkout
// Creates a Lemon Squeezy checkout for the given asset ids. Prices are read
// server-side from the assets table; the client is never trusted with them.
//
// Deploy: supabase functions deploy create-checkout
// Secrets: supabase secrets set LEMONSQUEEZY_API_KEY=... LEMONSQUEEZY_STORE_ID=... LEMONSQUEEZY_VARIANT_ID=... APP_URL=https://your-domain

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401)
    }

    // Client bound to the caller's JWT: auth.getUser() validates the token.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return json({ error: 'Invalid or expired session' }, 401)
    }

    const body = await req.json().catch(() => null)
    const assetIds: unknown = body?.asset_ids
    if (!Array.isArray(assetIds) || assetIds.length === 0 || !assetIds.every((id) => typeof id === 'string')) {
      return json({ error: 'asset_ids must be a non-empty array of ids' }, 400)
    }

    // Server-side price lookup: never trust client prices.
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, title, price')
      .in('id', assetIds)

    if (assetsError || !assets || assets.length !== assetIds.length) {
      return json({ error: 'One or more assets were not found' }, 400)
    }

    const totalCents = Math.round(
      assets.reduce((sum: number, a: { price: number }) => sum + a.price, 0) * 100,
    )
    if (totalCents <= 0) {
      return json({ error: 'Total must be greater than zero' }, 400)
    }

    const title =
      assets.length === 1
        ? (assets[0] as { title: string }).title
        : `Setty order (${assets.length} assets)`

    const storeId = Deno.env.get('LEMONSQUEEZY_STORE_ID')!
    const variantId = Deno.env.get('LEMONSQUEEZY_VARIANT_ID')!
    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

    const checkoutRes = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${Deno.env.get('LEMONSQUEEZY_API_KEY')}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: totalCents,
            product_options: {
              name: title,
              redirect_url: `${appUrl}/checkout/success`,
            },
            checkout_data: {
              email: user.email,
              custom: {
                user_id: user.id,
                asset_ids: assetIds.join(','),
              },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    })

    if (!checkoutRes.ok) {
      const detail = await checkoutRes.text()
      console.error('Lemon Squeezy checkout failed:', checkoutRes.status, detail)
      return json({ error: 'Payment provider rejected the checkout' }, 502)
    }

    const checkout = await checkoutRes.json()
    const url = checkout?.data?.attributes?.url
    if (!url) {
      return json({ error: 'Payment provider returned no checkout URL' }, 502)
    }

    return json({ url })
  } catch (err) {
    console.error('create-checkout error:', err)
    return json({ error: 'Internal error' }, 500)
  }
})

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

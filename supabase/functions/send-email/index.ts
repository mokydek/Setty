// Supabase Edge Function: send-email
// Central transactional email dispatcher. Called by database triggers (see
// supabase/migrations/0010_notifications.sql) with an event payload; looks
// up recipients and locales itself, renders the monochrome template and
// sends via the Resend API.
//
// Deploy: supabase functions deploy send-email --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=... EMAIL_FROM="Setty <noreply@your-domain>" APP_URL=https://your-domain EMAIL_HOOK_SECRET=...

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'

type EventPayload =
  | { type: 'purchase_created'; user_id: string; asset_id: string }
  | { type: 'bounty_status_changed'; bounty_id: string; old_status: string; new_status: string }
  | { type: 'asset_review_changed'; asset_id: string; review_status: string; rejection_reason?: string }

const COPY = {
  en: {
    purchaseBuyerSubject: 'Your Setty purchase is ready',
    purchaseBuyerBody: (title: string) =>
      `Payment confirmed. "${title}" is now in your library and ready to download from your dashboard.`,
    purchaseSellerSubject: 'You made a sale on Setty',
    purchaseSellerBody: (title: string) => `Your asset "${title}" was just purchased.`,
    bountySubject: (status: string) => `Bounty update: ${status}`,
    bountyBody: (title: string, status: string) =>
      `The bounty "${title}" changed status to: ${status}.`,
    assetApprovedSubject: 'Your asset passed curation',
    assetApprovedBody: (title: string) =>
      `"${title}" was approved and is now live in the Setty marketplace.`,
    assetRejectedSubject: 'Your asset needs changes',
    assetRejectedBody: (title: string, reason: string) =>
      `"${title}" was not approved by curation. Reason: ${reason}`,
    open: 'Open Setty',
  },
  ru: {
    purchaseBuyerSubject: 'Ваша покупка на Setty готова',
    purchaseBuyerBody: (title: string) =>
      `Оплата подтверждена. «${title}» уже в вашей библиотеке — скачать можно в кабинете.`,
    purchaseSellerSubject: 'У вас продажа на Setty',
    purchaseSellerBody: (title: string) => `Ваш ассет «${title}» только что купили.`,
    bountySubject: (status: string) => `Обновление баунти: ${status}`,
    bountyBody: (title: string, status: string) =>
      `Баунти «${title}» перешёл в статус: ${status}.`,
    assetApprovedSubject: 'Ваш ассет прошёл курацию',
    assetApprovedBody: (title: string) =>
      `«${title}» одобрен и опубликован в маркетплейсе Setty.`,
    assetRejectedSubject: 'Ассету нужны правки',
    assetRejectedBody: (title: string, reason: string) =>
      `«${title}» не прошёл курацию. Причина: ${reason}`,
    open: 'Открыть Setty',
  },
} as const

type Locale = keyof typeof COPY

function template(locale: Locale, heading: string, body: string): string {
  const appUrl = Deno.env.get('APP_URL') ?? 'https://setty.app'
  // Monochrome brand template: white, black, #0000FF links, no images.
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#ffffff;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;font-family:'Space Grotesk',Arial,Helvetica,sans-serif;color:#000000;">
    <div style="font-weight:700;font-size:20px;letter-spacing:-0.5px;border-bottom:1px solid #000000;padding-bottom:16px;margin-bottom:24px;">Setty</div>
    <div style="font-weight:700;font-size:16px;margin-bottom:12px;">${heading}</div>
    <div style="font-size:14px;line-height:1.6;color:#000000;">${body}</div>
    <div style="margin-top:32px;">
      <a href="${appUrl}/dashboard" style="display:inline-block;background:#0000FF;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;">${COPY[locale].open}</a>
    </div>
    <div style="margin-top:40px;border-top:1px solid #e5e5e5;padding-top:16px;font-size:12px;color:#666666;">Setty — curated assets for developers</div>
  </div>
</body>
</html>`
}

async function getUserContact(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ email: string | null; locale: Locale }> {
  const { data: userData } = await supabase.auth.admin.getUserById(userId)
  const { data: profile } = await supabase
    .from('profiles')
    .select('locale')
    .eq('id', userId)
    .maybeSingle()

  const locale: Locale = (profile as { locale?: string } | null)?.locale === 'ru' ? 'ru' : 'en'
  return { email: userData?.user?.email ?? null, locale }
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_FROM') ?? 'Setty <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    console.error('Resend error:', res.status, await res.text())
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  // Shared-secret check so only our database triggers can invoke this.
  const hookSecret = Deno.env.get('EMAIL_HOOK_SECRET')
  if (hookSecret && req.headers.get('x-email-hook-secret') !== hookSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  let payload: EventPayload
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    if (payload.type === 'purchase_created') {
      const { data: asset } = await supabase
        .from('assets')
        .select('title, seller_id')
        .eq('id', payload.asset_id)
        .maybeSingle()
      if (!asset) return new Response('Asset not found', { status: 200 })

      const buyer = await getUserContact(supabase, payload.user_id)
      if (buyer.email) {
        const c = COPY[buyer.locale]
        await sendEmail(
          buyer.email,
          c.purchaseBuyerSubject,
          template(buyer.locale, c.purchaseBuyerSubject, c.purchaseBuyerBody(asset.title)),
        )
      }

      const seller = await getUserContact(supabase, asset.seller_id)
      if (seller.email) {
        const c = COPY[seller.locale]
        await sendEmail(
          seller.email,
          c.purchaseSellerSubject,
          template(seller.locale, c.purchaseSellerSubject, c.purchaseSellerBody(asset.title)),
        )
      }
    } else if (payload.type === 'bounty_status_changed') {
      const { data: bounty } = await supabase
        .from('bounties')
        .select('title, user_id, assignee_id')
        .eq('id', payload.bounty_id)
        .maybeSingle()
      if (!bounty) return new Response('Bounty not found', { status: 200 })

      const recipients = [bounty.user_id, bounty.assignee_id].filter(
        (id): id is string => typeof id === 'string' && id.length > 0,
      )
      for (const userId of recipients) {
        const contact = await getUserContact(supabase, userId)
        if (!contact.email) continue
        const c = COPY[contact.locale]
        await sendEmail(
          contact.email,
          c.bountySubject(payload.new_status),
          template(
            contact.locale,
            c.bountySubject(payload.new_status),
            c.bountyBody(bounty.title, payload.new_status),
          ),
        )
      }
    } else if (payload.type === 'asset_review_changed') {
      if (payload.review_status !== 'approved' && payload.review_status !== 'rejected') {
        return new Response('Ignored', { status: 200 })
      }

      const { data: asset } = await supabase
        .from('assets')
        .select('title, seller_id')
        .eq('id', payload.asset_id)
        .maybeSingle()
      if (!asset) return new Response('Asset not found', { status: 200 })

      const seller = await getUserContact(supabase, asset.seller_id)
      if (seller.email) {
        const c = COPY[seller.locale]
        if (payload.review_status === 'approved') {
          await sendEmail(
            seller.email,
            c.assetApprovedSubject,
            template(seller.locale, c.assetApprovedSubject, c.assetApprovedBody(asset.title)),
          )
        } else {
          await sendEmail(
            seller.email,
            c.assetRejectedSubject,
            template(
              seller.locale,
              c.assetRejectedSubject,
              c.assetRejectedBody(asset.title, payload.rejection_reason ?? '-'),
            ),
          )
        }
      }
    }
  } catch (err) {
    console.error('send-email error:', err)
    return new Response('Internal error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
})

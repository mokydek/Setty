// Demo seed for reviewers: collections, ~40 assets with generated
// geometric preview images, 3 demo sellers, open bounties and a handful of
// purchases + reviews for social proof. Idempotent: sellers are keyed by
// email, assets by title, bounties by title.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
//
// The service role key must NEVER be committed or shipped to the client.
// Previews are sharp geometric SVG compositions per style; if `sharp` is
// installed (npm i -D sharp) they are rasterized to PNG, otherwise the SVG
// is uploaded directly (browsers render both identically in <img>).

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Required env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

let sharp = null
try {
  sharp = (await import('sharp')).default
  console.log('[seed] sharp found: previews will be PNG')
} catch {
  console.log('[seed] sharp not installed: previews will be SVG (still fine)')
}

// Deterministic PRNG so re-runs generate identical images.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SIZE = 600

function svgLowPoly(rand) {
  const palette = ['#4C6EF5', '#748FFC', '#91A7FF', '#3B5BDB', '#EDF2FF', '#BAC8FF']
  let shapes = ''
  for (let i = 0; i < 24; i++) {
    const x = rand() * SIZE
    const y = rand() * SIZE
    const s = 60 + rand() * 140
    const c = palette[Math.floor(rand() * palette.length)]
    shapes += `<polygon points="${x},${y} ${x + s},${y + s * 0.3} ${x + s * 0.3},${y + s}" fill="${c}" opacity="0.9"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="100%" height="100%" fill="#DBE4FF"/>${shapes}</svg>`
}

function svgCyberpunk(rand) {
  let lines = ''
  for (let i = 0; i < 14; i++) {
    const y = (i / 14) * SIZE
    lines += `<line x1="0" y1="${y}" x2="${SIZE}" y2="${y}" stroke="#FF2E88" stroke-width="1" opacity="0.5"/>`
    lines += `<line x1="${y}" y1="0" x2="${y}" y2="${SIZE}" stroke="#00F0FF" stroke-width="1" opacity="0.4"/>`
  }
  let glows = ''
  for (let i = 0; i < 6; i++) {
    const x = rand() * SIZE
    const h = 80 + rand() * 220
    glows += `<rect x="${x}" y="${SIZE - h}" width="${20 + rand() * 50}" height="${h}" fill="#12002E" stroke="#00F0FF" stroke-width="2"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="100%" height="100%" fill="#0A0014"/>${lines}${glows}</svg>`
}

function svgHandPainted(rand) {
  const palette = ['#FFB4A2', '#E5989B', '#B5838D', '#FFCDB2', '#6D6875']
  let blobs = ''
  for (let i = 0; i < 12; i++) {
    const cx = rand() * SIZE
    const cy = rand() * SIZE
    const rx = 60 + rand() * 120
    const ry = 40 + rand() * 100
    const c = palette[Math.floor(rand() * palette.length)]
    blobs += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" opacity="0.55"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="100%" height="100%" fill="#FFF1E6"/>${blobs}</svg>`
}

function svgRealistic(rand) {
  const stops = []
  for (let i = 0; i < 4; i++) {
    const g = Math.floor(80 + rand() * 120)
    stops.push(`<stop offset="${(i / 3) * 100}%" stop-color="rgb(${g},${g + 8},${g + 16})"/>`)
  }
  let rocks = ''
  for (let i = 0; i < 8; i++) {
    const x = rand() * SIZE
    const y = SIZE * 0.5 + rand() * SIZE * 0.4
    const s = 40 + rand() * 110
    const g = Math.floor(60 + rand() * 80)
    rocks += `<rect x="${x}" y="${y}" width="${s}" height="${s * 0.6}" fill="rgb(${g},${g},${g + 6})" transform="rotate(${rand() * 20 - 10} ${x} ${y})"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${stops.join('')}</linearGradient></defs><rect width="100%" height="100%" fill="url(#sky)"/>${rocks}</svg>`
}

const STYLE_SVG = {
  lowPoly: svgLowPoly,
  cyberpunk: svgCyberpunk,
  handPainted: svgHandPainted,
  realistic: svgRealistic,
}

const SELLERS = [
  { email: 'demo-seller-1@setty.demo', nickname: 'Mira Voss (demo)', style: 'artist' },
  { email: 'demo-seller-2@setty.demo', nickname: 'Kenji Aoki (demo)', style: 'artist' },
  { email: 'demo-seller-3@setty.demo', nickname: 'Lena Ortiz (demo)', style: 'artist' },
]

const ASSET_NAMES = {
  lowPoly: [
    ['Voxel Forest Pack', 'environment', 4.99], ['Faceted Fox', 'character', 3.5],
    ['Poly Crate Set', 'prop', 2.25], ['Prism Burst VFX', 'vfx', 3.75],
    ['Angular HUD Kit', 'ui', 5.5], ['Lowpoly Village', 'environment', 7.99],
    ['Origami Wolf', 'character', 4.25], ['Crystal Cluster Props', 'prop', 2.99],
    ['Shard Trail Effect', 'vfx', 3.25], ['Triangle Menu Pack', 'ui', 4.75],
  ],
  cyberpunk: [
    ['Neon Alley Tileset', 'environment', 6.5], ['Chrome Runner', 'character', 8.0],
    ['Holo Sign Bundle', 'prop', 3.99], ['Glitch Storm VFX', 'vfx', 4.5],
    ['Terminal UI Kit', 'ui', 6.25], ['Rooftop Megacity', 'environment', 9.99],
    ['Synth Samurai', 'character', 7.5], ['Vending Machine Set', 'prop', 2.75],
    ['Neon Rain Effect', 'vfx', 3.5], ['Cyberdeck Interface', 'ui', 5.99],
  ],
  handPainted: [
    ['Hand Drawn Foliage', 'environment', 3.25], ['Painted Sprite Knight', 'character', 5.25],
    ['Brushstroke Barrels', 'prop', 2.5], ['Watercolor Smoke', 'vfx', 3.0],
    ['Storybook Buttons', 'ui', 4.0], ['Painterly Meadow', 'environment', 6.75],
    ['Gouache Golem', 'character', 5.75], ['Market Stall Props', 'prop', 3.5],
    ['Ink Splash VFX', 'vfx', 2.75], ['Parchment UI Set', 'ui', 4.5],
  ],
  realistic: [
    ['Photoreal Rock Set', 'environment', 9.0], ['Scanned Ranger', 'character', 12.0],
    ['Industrial Pallets', 'prop', 4.25], ['Volumetric Dust', 'vfx', 5.0],
    ['Minimal HUD Pro', 'ui', 7.0], ['Scanned Cliff Pack', 'environment', 11.5],
    ['PBR Mercenary', 'character', 13.5], ['Warehouse Props', 'prop', 5.25],
    ['Rain Puddle Shader', 'vfx', 6.0], ['Tactical Interface', 'ui', 8.25],
  ],
}

const BOUNTIES = [
  ['Low poly watermill for a farming sim', 'lowPoly', 25, 'Need a stylized watermill matching the Voxel Forest palette: max 2k tris, flat shading, 3 LODs.'],
  ['Cyberpunk noodle stand', 'cyberpunk', 40, 'Street food stall with emissive signage, fits the Neon Alley tileset grid (2m modules).'],
  ['Hand painted potion shelf', 'handPainted', 15, 'A wall shelf with 6 potion bottles, soft brushwork, 1024px texture, matches Market Stall Props.'],
  ['Realistic mossy boulder set', 'realistic', 60, '4 scanned-look boulders with moss, 4k PBR maps, tileable with Photoreal Rock Set.'],
  ['Low poly delivery drone', 'lowPoly', 30, 'Small quadcopter drone, animated rotors, matches Angular HUD Kit accent colors.'],
  ['Cyberpunk hacker portrait set', 'cyberpunk', 45, '6 character portraits for dialogue UI, neon rim light, consistent with Terminal UI Kit.'],
]

async function ensureSeller({ email, nickname }) {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const existing = list?.users?.find((user) => user.email === email)
  if (existing) return existing.id

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: `demo-${Math.random().toString(36).slice(2, 12)}`,
    email_confirm: true,
  })
  if (error) throw new Error(`createUser ${email}: ${error.message}`)

  await supabase.from('profiles').upsert({
    id: data.user.id,
    nickname,
    description: 'Demo seller account seeded for review purposes.',
    avatar_url: '',
  })
  return data.user.id
}

async function uploadPreview(sellerId, slug, svg) {
  let body = Buffer.from(svg)
  let contentType = 'image/svg+xml'
  let ext = 'svg'

  if (sharp) {
    body = await sharp(Buffer.from(svg)).png().toBuffer()
    contentType = 'image/png'
    ext = 'png'
  }

  const path = `${sellerId}/seed-${slug}.${ext}`
  const { error } = await supabase.storage
    .from('asset-images')
    .upload(path, body, { contentType, upsert: true })
  if (error) throw new Error(`upload ${path}: ${error.message}`)

  return supabase.storage.from('asset-images').getPublicUrl(path).data.publicUrl
}

console.log('[seed] ensuring demo sellers...')
const sellerIds = []
for (const seller of SELLERS) {
  sellerIds.push(await ensureSeller(seller))
}

console.log('[seed] loading collections...')
const { data: collections, error: collectionsError } = await supabase
  .from('collections')
  .select('id, slug, style')
if (collectionsError) throw collectionsError
const collectionByStyle = Object.fromEntries(collections.map((c) => [c.style, c]))

console.log('[seed] seeding assets...')
const assetIds = []
let seedIndex = 1
for (const [style, entries] of Object.entries(ASSET_NAMES)) {
  const collection = collectionByStyle[style]
  for (const [title, category, price] of entries) {
    const sellerId = sellerIds[seedIndex % sellerIds.length]
    const sellerName = SELLERS[seedIndex % SELLERS.length].nickname

    const { data: existing } = await supabase
      .from('assets')
      .select('id')
      .eq('title', title)
      .maybeSingle()

    if (existing) {
      assetIds.push(existing.id)
      seedIndex++
      continue
    }

    const svg = STYLE_SVG[style](mulberry32(seedIndex * 1337))
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const imageUrl = await uploadPreview(sellerId, slug, svg)

    const { data: inserted, error } = await supabase
      .from('assets')
      .insert({
        title,
        author_name: sellerName,
        price,
        style,
        category,
        image_url: imageUrl,
        seller_id: sellerId,
        collection_id: collection?.id ?? null,
        review_status: 'approved',
        description: `${title} - part of the curated ${style} collection. Seeded demo asset.`,
      })
      .select('id')
      .single()
    if (error) throw new Error(`asset ${title}: ${error.message}`)

    assetIds.push(inserted.id)
    process.stdout.write('.')
    seedIndex++
  }
}
console.log(`\n[seed] ${assetIds.length} assets ready`)

console.log('[seed] seeding bounties...')
for (const [title, style, reward, description] of BOUNTIES) {
  const { data: existing } = await supabase
    .from('bounties')
    .select('id')
    .eq('title', title)
    .maybeSingle()
  if (existing) continue

  const { error } = await supabase.from('bounties').insert({
    title,
    description,
    style,
    reward,
    status: 'open',
    user_id: sellerIds[0],
  })
  if (error) throw new Error(`bounty ${title}: ${error.message}`)
}

console.log('[seed] seeding purchases and reviews for social proof...')
const REVIEW_TEXTS = [
  'Dropped straight into my project, style matches perfectly.',
  'Clean topology and exactly the palette promised. Instant buy.',
  'Saved me a week of work. The curation promise is real.',
  'Great value for a single asset, no bundle bloat.',
]
for (let i = 0; i < Math.min(8, assetIds.length); i++) {
  const buyerId = sellerIds[(i + 1) % sellerIds.length]
  const assetId = assetIds[i * 3 % assetIds.length]

  await supabase
    .from('purchases')
    .upsert({ user_id: buyerId, asset_id: assetId }, { onConflict: 'user_id,asset_id', ignoreDuplicates: true })

  await supabase
    .from('reviews')
    .upsert(
      {
        user_id: buyerId,
        asset_id: assetId,
        rating: 4 + (i % 2),
        text: REVIEW_TEXTS[i % REVIEW_TEXTS.length],
      },
      { onConflict: 'asset_id,user_id', ignoreDuplicates: true },
    )
}

console.log('[seed] done.')

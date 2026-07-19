// Backfill script: embeds every approved asset's preview image per
// collection (Replicate CLIP by default) and stores the centroid in
// collection_embeddings. Idempotent: re-running recomputes centroids.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... REPLICATE_API_TOKEN=... \
//     node scripts/embed-collections.mjs
//
// Cost note: Replicate CLIP is roughly $0.0002 per image; a catalogue of
// 1000 assets costs well under $1 to embed.

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN
const CLIP_VERSION =
  process.env.REPLICATE_CLIP_VERSION ??
  '75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a'

if (!SUPABASE_URL || !SERVICE_KEY || !REPLICATE_TOKEN) {
  console.error('Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REPLICATE_API_TOKEN')
  process.exit(1)
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
}

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers, ...init })
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

async function embedImage(imageUrl) {
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify({ version: CLIP_VERSION, input: { inputs: imageUrl } }),
  })
  if (!res.ok) throw new Error(`Replicate: ${res.status} ${await res.text()}`)
  const prediction = await res.json()
  const output = prediction?.output
  const embedding = Array.isArray(output) ? (output[0]?.embedding ?? output) : null
  if (!Array.isArray(embedding)) throw new Error('No embedding in Replicate output')
  return embedding
}

function centroidOf(embeddings) {
  const dim = embeddings[0].length
  const centroid = new Array(dim).fill(0)
  for (const embedding of embeddings) {
    for (let i = 0; i < dim; i++) centroid[i] += embedding[i]
  }
  for (let i = 0; i < dim; i++) centroid[i] /= embeddings.length
  return centroid
}

const collections = await rest('collections?select=id,slug')

for (const collection of collections) {
  const assets = await rest(
    `assets?select=id,image_url&collection_id=eq.${collection.id}&review_status=eq.approved&image_url=neq.`,
  )

  if (assets.length === 0) {
    console.log(`[${collection.slug}] no approved assets with images, skipping`)
    continue
  }

  console.log(`[${collection.slug}] embedding ${assets.length} assets...`)
  const embeddings = []
  for (const asset of assets) {
    try {
      embeddings.push(await embedImage(asset.image_url))
      process.stdout.write('.')
    } catch (err) {
      console.warn(`\n[${collection.slug}] failed for ${asset.id}: ${err.message}`)
    }
  }
  console.log()

  if (embeddings.length === 0) {
    console.log(`[${collection.slug}] no embeddings produced, skipping`)
    continue
  }

  await rest('collection_embeddings', {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      collection_id: collection.id,
      centroid: centroidOf(embeddings),
      sample_count: embeddings.length,
      updated_at: new Date().toISOString(),
    }),
  })

  console.log(`[${collection.slug}] centroid stored (${embeddings.length} samples)`)
}

console.log('Done.')

// Build-time sitemap generator. Queries Supabase for approved asset ids and
// collection slugs and writes public/sitemap.xml. Runs as part of
// `npm run build`; if Supabase credentials are absent (e.g. a cold CI
// checkout), it writes a sitemap with just the static routes and exits 0 so
// the build never breaks.
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const APP_URL = (process.env.APP_URL ?? 'https://setty.vercel.app').replace(/\/$/, '')

// Read VITE_ env from .env when not already in the environment (local builds).
function readDotEnv() {
  const envPath = resolve(root, '.env')
  if (!existsSync(envPath)) return {}
  const entries = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match) entries[match[1]] = match[2]
  }
  return entries
}

const dotEnv = readDotEnv()
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? dotEnv.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY ?? dotEnv.VITE_SUPABASE_ANON_KEY

const staticRoutes = ['/', '/app', '/bounties', '/license']

async function fetchRows(table, select, filter = '') {
  const url = `${supabaseUrl}/rest/v1/${table}?select=${select}${filter}`
  const res = await fetch(url, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  })
  if (!res.ok) throw new Error(`${table}: ${res.status}`)
  return res.json()
}

async function collectUrls() {
  const urls = staticRoutes.map((route) => `${APP_URL}${route}`)

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[sitemap] Supabase env missing, writing static routes only')
    return urls
  }

  try {
    const [assets, collections] = await Promise.all([
      fetchRows('assets', 'id', '&review_status=eq.approved'),
      fetchRows('collections', 'slug'),
    ])
    for (const collection of collections) urls.push(`${APP_URL}/collection/${collection.slug}`)
    for (const asset of assets) urls.push(`${APP_URL}/asset/${asset.id}`)
  } catch (err) {
    console.warn('[sitemap] Supabase query failed, writing static routes only:', err.message)
  }

  return urls
}

const urls = await collectUrls()
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`

writeFileSync(resolve(root, 'public', 'sitemap.xml'), xml)
console.log(`[sitemap] wrote ${urls.length} urls to public/sitemap.xml`)

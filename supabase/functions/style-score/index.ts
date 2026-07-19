// Supabase Edge Function: style-score
// v1 style-similarity scorer. Input: {image_url, collection_id}. Embeds the
// candidate image via a pluggable provider, compares cosine similarity to
// the collection centroid (collection_embeddings) and returns
// {score: 0..1, verdict: 'pass' | 'review' | 'fail'}.
//
// Providers (selected via EMBEDDINGS_PROVIDER env):
//   'replicate'  - Replicate CLIP (REPLICATE_API_TOKEN, ~$0.0002/image)
//   'selfhosted' - any endpoint accepting {image_url} and returning
//                  {embedding: number[]} (EMBEDDINGS_ENDPOINT_URL,
//                  optional EMBEDDINGS_ENDPOINT_TOKEN)
//
// Deploy: supabase functions deploy style-score
// Secrets: supabase secrets set EMBEDDINGS_PROVIDER=replicate REPLICATE_API_TOKEN=...

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PASS_THRESHOLD = 0.75
const REVIEW_THRESHOLD = 0.6

interface EmbeddingsProvider {
  embedImage(imageUrl: string): Promise<number[]>
}

// Replicate-hosted CLIP (andreasjansson/clip-features).
const replicateProvider: EmbeddingsProvider = {
  async embedImage(imageUrl: string): Promise<number[]> {
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        version: Deno.env.get('REPLICATE_CLIP_VERSION') ??
          '75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a',
        input: { inputs: imageUrl },
      }),
    })

    if (!startRes.ok) {
      throw new Error(`Replicate error ${startRes.status}: ${await startRes.text()}`)
    }

    const prediction = await startRes.json()
    const output = prediction?.output
    const embedding = Array.isArray(output) ? output[0]?.embedding ?? output : null
    if (!Array.isArray(embedding)) {
      throw new Error('Replicate returned no embedding')
    }
    return embedding as number[]
  },
}

// Any self-hosted endpoint: POST {image_url} -> {embedding: number[]}.
const selfHostedProvider: EmbeddingsProvider = {
  async embedImage(imageUrl: string): Promise<number[]> {
    const endpoint = Deno.env.get('EMBEDDINGS_ENDPOINT_URL')
    if (!endpoint) throw new Error('EMBEDDINGS_ENDPOINT_URL is not set')

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(Deno.env.get('EMBEDDINGS_ENDPOINT_TOKEN')
          ? { Authorization: `Bearer ${Deno.env.get('EMBEDDINGS_ENDPOINT_TOKEN')}` }
          : {}),
      },
      body: JSON.stringify({ image_url: imageUrl }),
    })

    if (!res.ok) throw new Error(`Embeddings endpoint error ${res.status}`)
    const body = await res.json()
    if (!Array.isArray(body?.embedding)) throw new Error('Endpoint returned no embedding')
    return body.embedding as number[]
  },
}

function getProvider(): EmbeddingsProvider {
  return Deno.env.get('EMBEDDINGS_PROVIDER') === 'selfhosted'
    ? selfHostedProvider
    : replicateProvider
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => null)
    const imageUrl: unknown = body?.image_url
    const collectionId: unknown = body?.collection_id

    if (typeof imageUrl !== 'string' || typeof collectionId !== 'string') {
      return json({ error: 'image_url and collection_id are required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: row } = await supabase
      .from('collection_embeddings')
      .select('centroid')
      .eq('collection_id', collectionId)
      .maybeSingle()

    if (!row?.centroid) {
      return json({ error: 'No centroid for this collection yet. Run scripts/embed-collections.mjs.' }, 404)
    }

    const embedding = await getProvider().embedImage(imageUrl)
    // CLIP cosine similarity ranges roughly [-1, 1]; clamp to [0, 1].
    const raw = cosineSimilarity(embedding, row.centroid as number[])
    const score = Math.max(0, Math.min(1, raw))

    const verdict = score >= PASS_THRESHOLD ? 'pass' : score >= REVIEW_THRESHOLD ? 'review' : 'fail'
    return json({ score, verdict })
  } catch (err) {
    console.error('style-score error:', err)
    return json({ error: 'Scoring failed' }, 500)
  }
})

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

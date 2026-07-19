// Pure math for the style-similarity scorer: cosine similarity plus the
// pass/review/fail thresholding. Shared shape with the style-score Edge
// Function (which re-implements the same two functions in Deno).

export function cosineSimilarity(a: number[], b: number[]): number {
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

export type StyleVerdict = 'pass' | 'review' | 'fail'

export const PASS_THRESHOLD = 0.75
export const REVIEW_THRESHOLD = 0.6

export function verdictForScore(score: number): StyleVerdict {
  if (score >= PASS_THRESHOLD) return 'pass'
  if (score >= REVIEW_THRESHOLD) return 'review'
  return 'fail'
}

import { describe, expect, it } from 'vitest'
import { cosineSimilarity, verdictForScore } from './styleScore'

describe('cosineSimilarity', () => {
  it('is 1 for identical vectors and 0 for orthogonal ones', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1)
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0)
  })

  it('is -1 for opposite vectors', () => {
    expect(cosineSimilarity([1, 1], [-1, -1])).toBeCloseTo(-1)
  })

  it('handles scale invariance', () => {
    expect(cosineSimilarity([1, 2], [10, 20])).toBeCloseTo(1)
  })

  it('returns 0 for mismatched lengths, empty and zero vectors', () => {
    expect(cosineSimilarity([], [])).toBe(0)
    expect(cosineSimilarity([1, 2], [1])).toBe(0)
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0)
  })
})

describe('verdictForScore', () => {
  it('applies the 0.75 / 0.6 thresholds', () => {
    expect(verdictForScore(0.9)).toBe('pass')
    expect(verdictForScore(0.75)).toBe('pass')
    expect(verdictForScore(0.74)).toBe('review')
    expect(verdictForScore(0.6)).toBe('review')
    expect(verdictForScore(0.59)).toBe('fail')
    expect(verdictForScore(0)).toBe('fail')
  })
})

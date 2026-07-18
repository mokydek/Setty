import { describe, expect, it } from 'vitest'
import { averageRating, filledSquares, formatRating } from './ratings'

describe('averageRating', () => {
  it('returns 0 for no reviews', () => {
    expect(averageRating([])).toBe(0)
  })

  it('averages and rounds to two decimals', () => {
    expect(averageRating([5])).toBe(5)
    expect(averageRating([4, 5])).toBe(4.5)
    expect(averageRating([3, 4, 4])).toBe(3.67)
    expect(averageRating([1, 2, 3, 4, 5])).toBe(3)
  })
})

describe('filledSquares', () => {
  it('rounds the average to the nearest marker and clamps to 0..5', () => {
    expect(filledSquares(0)).toBe(0)
    expect(filledSquares(3.4)).toBe(3)
    expect(filledSquares(3.5)).toBe(4)
    expect(filledSquares(5)).toBe(5)
    expect(filledSquares(7)).toBe(5)
    expect(filledSquares(-1)).toBe(0)
  })
})

describe('formatRating', () => {
  it('formats with one decimal', () => {
    expect(formatRating(4.5)).toBe('4.5')
    expect(formatRating(3)).toBe('3.0')
  })
})

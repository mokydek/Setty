import { describe, expect, it } from 'vitest'
import { formatDate, formatPrice } from './format'

describe('formatPrice', () => {
  it('formats USD for the English locale', () => {
    expect(formatPrice(4.99, 'en')).toBe('$4.99')
    expect(formatPrice(1250, 'en')).toBe('$1,250.00')
  })

  it('formats USD for the Russian locale', () => {
    const formatted = formatPrice(4.99, 'ru')
    expect(formatted).toContain('4,99')
    expect(formatted).toContain('$')
  })
})

describe('formatDate', () => {
  it('formats ISO strings per locale', () => {
    expect(formatDate('2026-07-19T12:00:00Z', 'en')).toMatch(/Jul/)
    expect(formatDate('2026-07-19T12:00:00Z', 'ru')).toMatch(/июл/)
  })
})

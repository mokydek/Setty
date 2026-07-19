import { describe, expect, it } from 'vitest'
import { translations } from './translations'

// The most common i18n bug: a key added to one language but not the other.
// This test asserts the EN and RU trees have identical key sets.

function collectKeys(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return [prefix]
  if (typeof node !== 'object' || node === null) return []

  return Object.entries(node).flatMap(([key, value]) =>
    collectKeys(value, prefix ? `${prefix}.${key}` : key),
  )
}

describe('translations key parity', () => {
  it('EN and RU have identical key sets', () => {
    const enKeys = collectKeys(translations.en).sort()
    const ruKeys = collectKeys(translations.ru).sort()

    const missingInRu = enKeys.filter((key) => !ruKeys.includes(key))
    const missingInEn = ruKeys.filter((key) => !enKeys.includes(key))

    expect(missingInRu, `keys missing in RU: ${missingInRu.join(', ')}`).toEqual([])
    expect(missingInEn, `keys missing in EN: ${missingInEn.join(', ')}`).toEqual([])
  })

  it('every leaf is a non-empty string', () => {
    for (const lang of ['en', 'ru'] as const) {
      const keys = collectKeys(translations[lang])
      expect(keys.length).toBeGreaterThan(50)
    }
  })
})

import { describe, expect, it } from 'vitest'
import { categoryLabelKey, computeCompleteness } from './collectionCompleteness'

describe('computeCompleteness', () => {
  it('reports zero coverage for an empty collection', () => {
    const result = computeCompleteness([])
    expect(result.coveredCategories).toBe(0)
    expect(result.totalCategories).toBe(5)
    expect(result.perCategory).toEqual({ environment: 0, character: 0, prop: 0, vfx: 0, ui: 0 })
  })

  it('counts assets per category and covered categories', () => {
    const result = computeCompleteness([
      { category: 'prop' },
      { category: 'prop' },
      { category: 'environment' },
      { category: 'vfx' },
    ])
    expect(result.coveredCategories).toBe(3)
    expect(result.perCategory.prop).toBe(2)
    expect(result.perCategory.environment).toBe(1)
    expect(result.perCategory.character).toBe(0)
  })

  it('ignores unknown and missing categories', () => {
    const result = computeCompleteness([
      { category: 'weapon' },
      { category: null },
      {},
      { category: 'ui' },
    ])
    expect(result.coveredCategories).toBe(1)
    expect(result.perCategory.ui).toBe(1)
  })
})

describe('categoryLabelKey', () => {
  it('maps ui to the uiKit i18n key and passes others through', () => {
    expect(categoryLabelKey('ui')).toBe('uiKit')
    expect(categoryLabelKey('prop')).toBe('prop')
  })
})

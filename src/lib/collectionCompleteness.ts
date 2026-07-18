// Completeness of a collection across asset categories: how many of the
// five canonical categories are covered, and how many assets are in each.

export const ASSET_CATEGORIES = ['environment', 'character', 'prop', 'vfx', 'ui'] as const

export type AssetCategory = (typeof ASSET_CATEGORIES)[number]

// Maps a category value to its i18n label key under marketplace.categories.
export function categoryLabelKey(category: string): string {
  return category === 'ui' ? 'uiKit' : category
}

export interface CollectionCompleteness {
  coveredCategories: number
  totalCategories: number
  perCategory: Record<AssetCategory, number>
}

export function computeCompleteness(
  assets: Array<{ category?: string | null }>,
): CollectionCompleteness {
  const perCategory = Object.fromEntries(
    ASSET_CATEGORIES.map((category) => [category, 0]),
  ) as Record<AssetCategory, number>

  for (const asset of assets) {
    const category = asset.category
    if (category && (ASSET_CATEGORIES as readonly string[]).includes(category)) {
      perCategory[category as AssetCategory] += 1
    }
  }

  const coveredCategories = ASSET_CATEGORIES.filter(
    (category) => perCategory[category] > 0,
  ).length

  return {
    coveredCategories,
    totalCategories: ASSET_CATEGORIES.length,
    perCategory,
  }
}

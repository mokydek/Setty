// Barrel that assembles the per-namespace translation files while
// preserving the original `translations` shape and t() key structure.
import { common } from './namespaces/common'
import { landing } from './namespaces/landing'
import { marketplace } from './namespaces/marketplace'
import { bounties } from './namespaces/bounties'
import { dashboard } from './namespaces/dashboard'

export type Language = 'en' | 'ru'

export const translations = {
  en: {
    ...common.en,
    ...landing.en,
    ...marketplace.en,
    ...bounties.en,
    ...dashboard.en,
  },
  ru: {
    ...common.ru,
    ...landing.ru,
    ...marketplace.ru,
    ...bounties.ru,
    ...dashboard.ru,
  },
} as const

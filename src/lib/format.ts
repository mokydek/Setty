import type { Language } from '../i18n/translations'

// Locale-aware price and date formatting. All user-facing prices and dates
// go through here instead of inline `$${x.toFixed(2)}` templates.

const LOCALE: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
}

export function formatPrice(value: number, language: Language = 'en'): string {
  return new Intl.NumberFormat(LOCALE[language], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value: string | Date, language: Language = 'en'): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(LOCALE[language], { dateStyle: 'medium' }).format(date)
}

export function formatDateTime(value: string | Date, language: Language = 'en'): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(LOCALE[language], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

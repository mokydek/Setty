import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageProvider, useLanguage } from './LanguageContext'

function TestHarness() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="signIn">{t('nav.signIn')}</span>
      <span data-testid="missing">{t('nav.doesNotExist')}</span>
      <button onClick={() => setLanguage('ru')}>Switch to RU</button>
    </div>
  )
}

describe('LanguageContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults to English and resolves a known key', () => {
    render(
      <LanguageProvider>
        <TestHarness />
      </LanguageProvider>,
    )

    expect(screen.getByTestId('language')).toHaveTextContent('en')
    expect(screen.getByTestId('signIn')).toHaveTextContent('Sign In')
  })

  it('falls back to the raw path when a key is missing', () => {
    render(
      <LanguageProvider>
        <TestHarness />
      </LanguageProvider>,
    )

    expect(screen.getByTestId('missing')).toHaveTextContent('nav.doesNotExist')
  })

  it('switches to Russian and re-resolves text', () => {
    render(
      <LanguageProvider>
        <TestHarness />
      </LanguageProvider>,
    )

    fireEvent.click(screen.getByText('Switch to RU'))

    expect(screen.getByTestId('language')).toHaveTextContent('ru')
    expect(screen.getByTestId('signIn')).toHaveTextContent('Войти')
  })
})

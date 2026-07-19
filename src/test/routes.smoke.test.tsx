import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../i18n/LanguageContext'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { WishlistProvider } from '../contexts/WishlistContext'
import Landing from '../landing/Landing'
import Marketplace from '../frontend/Marketplace'
import Bounties from '../frontend/Bounties'
import License from '../frontend/License'
import NotFound from '../frontend/NotFound'
import Auth from '../frontend/Auth'
import Wishlist from '../frontend/Wishlist'

// Smoke render per public route with a fully mocked Supabase client: the
// pages must mount without crashing and without touching the network.
vi.mock('../backend/supabase', async () =>
  (await import('../test/supabaseMock')).supabaseModuleMock(),
)

function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

const ROUTES: Array<[string, () => ReactNode]> = [
  ['Landing', () => <Landing />],
  ['Marketplace', () => <Marketplace />],
  ['Bounties', () => <Bounties />],
  ['License', () => <License />],
  ['NotFound', () => <NotFound />],
  ['Auth', () => <Auth />],
  ['Wishlist', () => <Wishlist />],
]

describe('route smoke tests', () => {
  for (const [name, element] of ROUTES) {
    it(`renders ${name} without crashing`, () => {
      const { container } = render(<Providers>{element()}</Providers>)
      expect(container.firstChild).not.toBeNull()
    })
  }
})

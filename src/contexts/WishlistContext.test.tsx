import { describe, expect, it, vi, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { WishlistProvider, useWishlist } from './WishlistContext'
import * as AuthContext from './AuthContext'

vi.mock('../backend/supabase', async () =>
  (await import('../test/supabaseMock')).supabaseModuleMock({
    tables: {
      wishlists: { data: [{ asset_id: 'asset-1' }, { asset_id: 'asset-2' }], error: null },
    },
  }),
)

function Harness() {
  const { assetIds, isWishlisted, toggleWishlist, isLoading } = useWishlist()
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="ids">{assetIds.join(',')}</span>
      <span data-testid="has-1">{String(isWishlisted('asset-1'))}</span>
      <button onClick={() => toggleWishlist('asset-1')}>toggle-1</button>
      <button onClick={() => toggleWishlist('asset-3')}>toggle-3</button>
    </div>
  )
}

function mockAuth(user: { id: string } | null) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user,
    session: null,
    isLoading: false,
  } as ReturnType<typeof AuthContext.useAuth>)
}

describe('WishlistContext', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is empty for signed-out visitors and toggling is a no-op', async () => {
    mockAuth(null)
    render(
      <WishlistProvider>
        <Harness />
      </WishlistProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('ids')).toHaveTextContent('')

    await act(async () => {
      screen.getByText('toggle-3').click()
    })
    expect(screen.getByTestId('ids')).toHaveTextContent('')
  })

  it('loads the wishlist for a signed-in user', async () => {
    mockAuth({ id: 'user-1' })
    render(
      <WishlistProvider>
        <Harness />
      </WishlistProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('ids')).toHaveTextContent('asset-1,asset-2')
    expect(screen.getByTestId('has-1')).toHaveTextContent('true')
  })

  it('toggles optimistically: removes an existing id and adds a new one', async () => {
    mockAuth({ id: 'user-1' })
    render(
      <WishlistProvider>
        <Harness />
      </WishlistProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('ids')).toHaveTextContent('asset-1,asset-2'))

    await act(async () => {
      screen.getByText('toggle-1').click()
    })
    expect(screen.getByTestId('has-1')).toHaveTextContent('false')

    await act(async () => {
      screen.getByText('toggle-3').click()
    })
    expect(screen.getByTestId('ids')).toHaveTextContent('asset-2,asset-3')
  })
})

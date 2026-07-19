import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

const session = { user: { id: 'user-42', email: 'dev@example.test' } }

vi.mock('../backend/supabase', async () =>
  (await import('../test/supabaseMock')).supabaseModuleMock({
    session: { user: { id: 'user-42', email: 'dev@example.test' } },
  }),
)

function Harness() {
  const { user, isLoading } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user?.id ?? 'none'}</span>
    </div>
  )
}

describe('AuthContext', () => {
  it('exposes the session user after loading', async () => {
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent(session.user.id)
  })

  it('useAuth outside the provider throws a clear error', () => {
    // Silence React's error boundary noise for the expected throw.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Harness />)).toThrow('useAuth must be used within an AuthProvider')
    spy.mockRestore()
  })
})

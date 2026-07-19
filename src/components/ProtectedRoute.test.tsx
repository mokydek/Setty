import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import * as AuthContext from '../contexts/AuthContext'

vi.mock('../backend/supabase', async () =>
  (await import('../test/supabaseMock')).supabaseModuleMock(),
)

function renderGuarded() {
  return render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <div>secret content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div>auth page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function mockAuth(value: { user: { id: string } | null; isLoading: boolean }) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: value.user,
    session: null,
    isLoading: value.isLoading,
  } as ReturnType<typeof AuthContext.useAuth>)
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading state while auth is resolving', () => {
    mockAuth({ user: null, isLoading: true })
    renderGuarded()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('redirects signed-out visitors to /auth', () => {
    mockAuth({ user: null, isLoading: false })
    renderGuarded()
    expect(screen.getByText('auth page')).toBeInTheDocument()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('renders children for a signed-in user', () => {
    mockAuth({ user: { id: 'user-1' }, isLoading: false })
    renderGuarded()
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })
})

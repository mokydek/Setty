import { describe, expect, it } from 'vitest'
import { resolveCuratorAccess } from './roleGuard'

describe('resolveCuratorAccess', () => {
  it('waits while auth is still loading', () => {
    expect(
      resolveCuratorAccess({ isAuthLoading: true, isRoleLoading: false, isSignedIn: false, role: null }),
    ).toBe('wait')
  })

  it('denies signed-out visitors without waiting for a role fetch', () => {
    expect(
      resolveCuratorAccess({ isAuthLoading: false, isRoleLoading: true, isSignedIn: false, role: null }),
    ).toBe('deny')
  })

  it('waits for the role while signed in and the profile is loading', () => {
    expect(
      resolveCuratorAccess({ isAuthLoading: false, isRoleLoading: true, isSignedIn: true, role: null }),
    ).toBe('wait')
  })

  it('allows curators and denies everyone else', () => {
    expect(
      resolveCuratorAccess({ isAuthLoading: false, isRoleLoading: false, isSignedIn: true, role: 'curator' }),
    ).toBe('allow')
    expect(
      resolveCuratorAccess({ isAuthLoading: false, isRoleLoading: false, isSignedIn: true, role: 'user' }),
    ).toBe('deny')
    expect(
      resolveCuratorAccess({ isAuthLoading: false, isRoleLoading: false, isSignedIn: true, role: null }),
    ).toBe('deny')
  })
})

// Pure decision logic for role-gated routes, kept out of React so it can be
// unit-tested directly.

export type RouteAccess = 'wait' | 'deny' | 'allow'

export interface RoleGuardInput {
  isAuthLoading: boolean
  isRoleLoading: boolean
  isSignedIn: boolean
  role: string | null | undefined
}

export function resolveCuratorAccess({
  isAuthLoading,
  isRoleLoading,
  isSignedIn,
  role,
}: RoleGuardInput): RouteAccess {
  if (isAuthLoading) return 'wait'
  if (!isSignedIn) return 'deny'
  if (isRoleLoading) return 'wait'
  return role === 'curator' ? 'allow' : 'deny'
}

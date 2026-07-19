import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getProfileRole } from '../lib/api/profiles'
import { resolveCuratorAccess } from '../lib/roleGuard'

export default function CuratorRoute({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [role, setRole] = useState<string | null>(null)
  const [isRoleLoading, setIsRoleLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsRoleLoading(false)
      return
    }

    setIsRoleLoading(true)
    getProfileRole(user.id).then((result) => {
      setRole(result.ok ? result.data : null)
      setIsRoleLoading(false)
    })
  }, [user])

  const access = resolveCuratorAccess({
    isAuthLoading,
    isRoleLoading,
    isSignedIn: !!user,
    role,
  })

  if (access === 'wait') {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black/40">Loading...</span>
      </div>
    )
  }

  if (access === 'deny') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

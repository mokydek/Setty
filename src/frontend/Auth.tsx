import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, Globe } from 'lucide-react'
import { supabase } from '../backend/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

type OAuthProvider = 'github' | 'google'
type AuthMode = 'sign-in' | 'sign-up'

export default function Auth() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // AuthContext updates `user` asynchronously via onAuthStateChange, which can
  // land a tick after signIn/signUp resolves. Navigating from this effect
  // (instead of right after the await) avoids racing ProtectedRoute, which
  // would otherwise read a still-null user and bounce back to /auth.
  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, isAuthLoading, navigate])

  if (isAuthLoading) {
    return (
      <div className="min-h-full flex items-center justify-center px-8 py-24">
        <span className="text-sm font-medium text-[#0000FF] tracking-widest uppercase">
          Loading...
        </span>
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'sign-in') {
      const result = await supabase.auth.signInWithPassword({ email, password })
      console.log('[Auth] signInWithPassword response:', result)
      const { error: authError } = result
      setLoading(false)

      if (authError) {
        setError(authError.message)
        return
      }

      // signInWithPassword awaits _notifyAllSubscribers('SIGNED_IN', ...)
      // internally before resolving, so AuthContext's user is already
      // updated by this point. Navigate directly; the effect above still
      // covers OAuth and any other path that reaches this page with a
      // session already established.
      navigate('/dashboard', { replace: true })
      return
    }

    const result = await supabase.auth.signUp({ email, password })
    console.log('[Auth] signUp response:', result)
    const { data, error: authError } = result
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (data.session) {
      navigate('/dashboard', { replace: true })
      return
    }

    setMessage('Registration successful. Please check your email or sign in.')
    setMode('sign-in')
  }

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    setError(null)
    setMessage(null)
    setLoadingProvider(provider)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoadingProvider(null)
    }
  }

  const isBusy = loading || loadingProvider !== null

  return (
    <div className="min-h-full flex items-center justify-center px-8 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">
          {mode === 'sign-in' ? t('auth.signIn') : t('auth.signUp')}
        </h1>
        <p className="text-sm text-black/60 mb-8">
          {mode === 'sign-in' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
        </p>

        {message && (
          <div className="rounded-none border border-black bg-white px-4 py-3 mb-6">
            <span className="text-sm font-medium text-black">{message}</span>
          </div>
        )}

        {error && (
          <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6">
            <span className="text-sm font-medium text-red-600">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-medium text-black/60">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-medium text-black/60">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            />
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? t('auth.pleaseWait') : mode === 'sign-in' ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null)
            setMessage(null)
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
          }}
          className="text-sm text-black/60 hover:text-[#0000FF] transition-colors mb-8"
        >
          {mode === 'sign-in' ? t('auth.noAccount') : t('auth.hasAccount')}
        </button>

        <div className="flex items-center gap-4 mb-6">
          <span className="flex-1 h-px bg-black/10" />
          <span className="text-xs font-medium text-black/40 uppercase tracking-widest">Or</span>
          <span className="flex-1 h-px bg-black/10" />
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isBusy}
            className="rounded-none border border-black bg-white px-6 py-4 flex items-center justify-center gap-3 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            <GitBranch size={20} strokeWidth={1.5} />
            {loadingProvider === 'github' ? t('auth.pleaseWait') : 'Sign in with GitHub'}
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isBusy}
            className="rounded-none border border-black bg-white px-6 py-4 flex items-center justify-center gap-3 text-sm font-semibold text-black hover:bg-[#0000FF] hover:text-white hover:border-[#0000FF] transition-colors disabled:opacity-50"
          >
            <Globe size={20} strokeWidth={1.5} />
            {loadingProvider === 'google' ? t('auth.pleaseWait') : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  )
}

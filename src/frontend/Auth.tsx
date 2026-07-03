import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../backend/supabase'
import { useLanguage } from '../i18n/LanguageContext'

type AuthMode = 'sign-in' | 'sign-up'

export default function Auth() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (mode === 'sign-in') {
      navigate('/app')
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-8 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">
          {mode === 'sign-in' ? t('auth.signIn') : t('auth.signUp')}
        </h1>
        <p className="text-sm text-black/60 mb-8">
          {mode === 'sign-in' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
        </p>

        {error && (
          <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6">
            <span className="text-sm font-medium text-red-600">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            disabled={loading}
            className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? t('auth.pleaseWait') : mode === 'sign-in' ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null)
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
          }}
          className="text-sm text-black/60 hover:text-[#0000FF] transition-colors mt-6"
        >
          {mode === 'sign-in' ? t('auth.noAccount') : t('auth.hasAccount')}
        </button>
      </div>
    </div>
  )
}

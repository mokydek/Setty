import { useState } from 'react'
import { GitBranch, Globe } from 'lucide-react'
import { supabase } from '../backend/supabase'
import { useLanguage } from '../i18n/LanguageContext'

type Provider = 'github' | 'google'

export default function Auth() {
  const { t } = useLanguage()
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthSignIn = async (provider: Provider) => {
    setError(null)
    setLoadingProvider(provider)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-8 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">
          {t('auth.signIn')}
        </h1>
        <p className="text-sm text-black/60 mb-8">{t('auth.signInSubtitle')}</p>

        {error && (
          <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6">
            <span className="text-sm font-medium text-red-600">{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('github')}
            disabled={loadingProvider !== null}
            className="rounded-none border border-black bg-white px-6 py-4 flex items-center justify-center gap-3 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            <GitBranch size={20} strokeWidth={1.5} />
            {loadingProvider === 'github' ? t('auth.pleaseWait') : 'Sign in with GitHub'}
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={loadingProvider !== null}
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

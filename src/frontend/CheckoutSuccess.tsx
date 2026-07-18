import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../backend/supabase'
import { clearPendingCheckout, readPendingCheckout } from '../lib/payments'

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 40 // ~2 minutes: webhooks are usually delivered in seconds

type Status = 'waiting' | 'confirmed' | 'timeout'

export default function CheckoutSuccess() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { removeFromCart } = useCart()
  const [status, setStatus] = useState<Status>('waiting')
  const pollCount = useRef(0)

  useEffect(() => {
    if (!user) return

    const pendingIds = readPendingCheckout()
    if (pendingIds.length === 0) {
      // Nothing to poll for: treat as confirmed so a refresh does not hang.
      setStatus('confirmed')
      return
    }

    let cancelled = false

    const poll = async () => {
      const { data } = await supabase
        .from('purchases')
        .select('asset_id')
        .eq('user_id', user.id)
        .in('asset_id', pendingIds)

      if (cancelled) return

      const ownedCount = data?.length ?? 0
      if (ownedCount >= pendingIds.length) {
        pendingIds.forEach((id) => removeFromCart(id))
        clearPendingCheckout()
        setStatus('confirmed')
        return
      }

      pollCount.current += 1
      if (pollCount.current >= MAX_POLLS) {
        setStatus('timeout')
        return
      }

      window.setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="px-8 py-24 flex justify-center">
      <div className="w-full max-w-md text-center">
        {status === 'waiting' && (
          <>
            <div className="mx-auto mb-6 h-12 w-12 border border-black flex items-center justify-center">
              <span className="h-3 w-3 bg-[#0000FF] animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black mb-2">
              {t('checkout.waitingTitle')}
            </h1>
            <p className="text-sm text-black/60">{t('checkout.waitingText')}</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="mx-auto mb-6 h-12 w-12 bg-[#0000FF] flex items-center justify-center">
              <Check size={24} strokeWidth={2} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black mb-2">
              {t('checkout.successTitle')}
            </h1>
            <p className="text-sm text-black/60 mb-8">{t('checkout.successText')}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors"
            >
              <Download size={16} strokeWidth={1.5} />
              {t('checkout.goToDownloads')}
            </Link>
          </>
        )}

        {status === 'timeout' && (
          <>
            <div className="mx-auto mb-6 h-12 w-12 border border-black flex items-center justify-center">
              <span className="text-lg font-bold text-black">!</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black mb-2">
              {t('checkout.timeoutTitle')}
            </h1>
            <p className="text-sm text-black/60 mb-8">{t('checkout.timeoutText')}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-none border border-black text-black px-6 py-3 text-sm font-semibold hover:bg-black hover:text-white transition-colors"
            >
              {t('checkout.goToDashboard')}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

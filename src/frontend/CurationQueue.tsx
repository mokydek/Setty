import { useCallback, useEffect, useState } from 'react'
import { Check, ImageOff, X } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatPrice } from '../lib/format'
import { supabase } from '../backend/supabase'
import type { Asset } from '../types/database.types'

function PendingAssetCard({
  asset,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  isActing,
}: {
  asset: Asset
  isSelected: boolean
  onSelect: () => void
  onApprove: (asset: Asset) => void
  onReject: (asset: Asset, reason: string) => void
  isActing: boolean
}) {
  const { t, language } = useLanguage()
  const [imageFailed, setImageFailed] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <div
      onClick={onSelect}
      className={`bg-white p-4 flex flex-col gap-4 cursor-pointer border ${
        isSelected ? 'border-[#0000FF] border-2' : 'border-black'
      }`}
    >
      <div className="bg-gray-100 aspect-video flex items-center justify-center overflow-hidden">
        {asset.image_url && !imageFailed ? (
          <img
            src={asset.image_url}
            alt={asset.title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageOff size={40} strokeWidth={1.5} className="text-black/30" />
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold tracking-tight text-black">{asset.title}</h3>
          <span className="text-xs text-black/50">
            {t('marketplace.by')} {asset.author_name} &middot; {formatPrice(asset.price, language)}
          </span>
        </div>
        <span className="text-xs font-medium text-[#0000FF] uppercase tracking-widest whitespace-nowrap">
          {t(`marketplace.styles.${asset.style}`)}
        </span>
      </div>

      {typeof asset.style_score === 'number' && (
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 border border-black">
            <div
              className="h-full bg-[#0000FF]"
              style={{ width: `${Math.round(asset.style_score * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-black whitespace-nowrap">
            {t('styleCheck.match')}: {Math.round(asset.style_score * 100)}%
          </span>
        </div>
      )}

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onApprove(asset)}
          disabled={isActing}
          className="rounded-none bg-[#0000FF] text-white px-4 py-2 flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
        >
          <Check size={14} strokeWidth={1.5} />
          {t('curation.approve')}
        </button>
        <button
          onClick={() => setShowRejectForm((v) => !v)}
          disabled={isActing}
          className="rounded-none border border-black text-black px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          <X size={14} strokeWidth={1.5} />
          {t('curation.reject')}
        </button>
        <span className="text-xs text-black/30 ml-auto uppercase tracking-widest hidden sm:block">
          {t('curation.shortcuts')}
        </span>
      </div>

      {showRejectForm && (
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={(event) => {
            event.preventDefault()
            onReject(asset, reason)
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            required
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('curation.rejectPlaceholder')}
            className="rounded-none border border-black bg-white px-3 py-2 text-sm text-black outline-none focus:border-[#0000FF] resize-none"
          />
          <button
            type="submit"
            disabled={isActing}
            className="rounded-none border border-black text-black px-3 py-2 text-xs font-medium hover:bg-black hover:text-white transition-colors w-fit disabled:opacity-50"
          >
            {t('curation.confirmReject')}
          </button>
        </form>
      )}
    </div>
  )
}

export default function CurationQueue() {
  const { t } = useLanguage()
  const [pending, setPending] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActing, setIsActing] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchPending = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('review_status', 'pending')
      .order('created_at', { ascending: true })

    if (!fetchError && data) {
      // Lowest style score first: the most suspicious submissions surface
      // at the top of the queue. Unscored assets sort last.
      const rows = (data as Asset[]).slice().sort((a, b) => {
        const scoreA = a.style_score ?? Number.POSITIVE_INFINITY
        const scoreB = b.style_score ?? Number.POSITIVE_INFINITY
        return scoreA - scoreB
      })
      setPending(rows)
      setSelectedIndex(0)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const review = useCallback(
    async (asset: Asset, status: 'approved' | 'rejected', reason?: string) => {
      setIsActing(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('assets')
        .update({
          review_status: status,
          rejection_reason: status === 'rejected' ? (reason ?? '') : null,
        })
        .eq('id', asset.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        setPending((prev) => prev.filter((item) => item.id !== asset.id))
      }
      setIsActing(false)
    },
    [],
  )

  const handleApprove = useCallback((asset: Asset) => review(asset, 'approved'), [review])
  const handleReject = useCallback(
    (asset: Asset, reason: string) => review(asset, 'rejected', reason),
    [review],
  )

  // Keyboard shortcuts: A approves the selected asset, R rejects it with a
  // generic reason prompt.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const selected = pending[selectedIndex]
      if (!selected || isActing) return

      if (event.key === 'a' || event.key === 'A') {
        event.preventDefault()
        handleApprove(selected)
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        const reason = window.prompt(t('curation.rejectPlaceholder'))
        if (reason) handleReject(selected, reason)
      } else if (event.key === 'ArrowDown' || event.key === 'j') {
        event.preventDefault()
        setSelectedIndex((i) => Math.min(pending.length - 1, i + 1))
      } else if (event.key === 'ArrowUp' || event.key === 'k') {
        event.preventDefault()
        setSelectedIndex((i) => Math.max(0, i - 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pending, selectedIndex, isActing, handleApprove, handleReject, t])

  return (
    <div className="px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">{t('curation.title')}</h1>
        <p className="text-sm text-black/60">{t('curation.subtitle')}</p>
      </div>

      {error && (
        <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6 max-w-3xl">
          <span className="text-sm font-medium text-red-600">{error}</span>
        </div>
      )}

      {isLoading ? (
        <span className="text-sm font-medium text-black/40">{t('curation.loading')}</span>
      ) : pending.length === 0 ? (
        <div className="border border-black/10 py-24 flex items-center justify-center max-w-3xl">
          <span className="text-sm font-medium text-black/40">{t('curation.empty')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
          {pending.map((asset, index) => (
            <PendingAssetCard
              key={asset.id}
              asset={asset}
              isSelected={index === selectedIndex}
              onSelect={() => setSelectedIndex(index)}
              onApprove={handleApprove}
              onReject={handleReject}
              isActing={isActing}
            />
          ))}
        </div>
      )}
    </div>
  )
}

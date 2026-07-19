import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../backend/supabase'
import { isBountyStatus } from '../lib/bountyMachine'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { track } from '../lib/analytics'
import type { Bounty } from '../types/database.types'

const STYLE_KEYS = ['lowPoly', 'cyberpunk', 'handPainted', 'realistic'] as const

type FilterTab = 'all' | 'open' | 'mineCreated' | 'mineAssigned'

export function statusKey(status: string): string {
  return status === 'in_progress' ? 'inProgress' : status
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage()
  if (!isBountyStatus(status)) return null

  return (
    <span
      className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 border w-fit whitespace-nowrap ${
        status === 'open'
          ? 'border-[#0000FF] text-[#0000FF]'
          : status === 'approved' || status === 'paid'
            ? 'border-black bg-black text-white'
            : status === 'cancelled'
              ? 'border-black/30 text-black/40'
              : 'border-black text-black'
      }`}
    >
      {t(`bountyStatus.${statusKey(status)}`)}
    </span>
  )
}

function BountyCard({ bounty, onAccept, canAccept }: { bounty: Bounty; onAccept: (id: string) => void; canAccept: boolean }) {
  const { t } = useLanguage()

  return (
    <div className="rounded-none border border-black bg-white p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <Link
          to={`/bounty/${bounty.id}`}
          className="text-lg font-bold tracking-tight text-black hover:text-[#0000FF] transition-colors"
        >
          {bounty.title}
        </Link>
        <span className="text-xs font-medium text-black/50 uppercase tracking-widest whitespace-nowrap pt-1">
          {t(`marketplace.styles.${bounty.style}`)}
        </span>
      </div>

      <StatusBadge status={bounty.status} />

      <p className="text-sm text-black/60 leading-relaxed line-clamp-3">{bounty.description}</p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-lg font-semibold text-[#0000FF]">${bounty.reward.toFixed(2)}</span>
        <div className="flex items-center gap-2">
          <Link
            to={`/bounty/${bounty.id}`}
            className="rounded-none border border-black text-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors"
          >
            {t('bounties.details')}
          </Link>
          {bounty.status === 'open' && canAccept && (
            <button
              onClick={() => onAccept(bounty.id)}
              className="rounded-none border border-black text-black px-4 py-2 text-sm font-medium hover:bg-[#0000FF] hover:text-white hover:border-[#0000FF] transition-colors"
            >
              {t('bounties.acceptTask')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Bounties() {
  const { t } = useLanguage()
  useDocumentMeta(t('bounties.title'), t('landing.features.bounty.description'))
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<FilterTab>('all')
  const [searchParams] = useSearchParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // Collection pages link here with ?style=<key> to pre-fill the form.
  const [style, setStyle] = useState<string>(() => {
    const fromUrl = searchParams.get('style')
    return fromUrl && (STYLE_KEYS as readonly string[]).includes(fromUrl) ? fromUrl : STYLE_KEYS[0]
  })
  const [reward, setReward] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchBounties = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('bounties')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBounties(data as Bounty[])
    }

    setIsLoading(false)
  }

  const visibleBounties = bounties.filter((bounty) => {
    switch (tab) {
      case 'open':
        return bounty.status === 'open'
      case 'mineCreated':
        return !!user && bounty.user_id === user.id
      case 'mineAssigned':
        return !!user && bounty.assignee_id === user.id
      default:
        return true
    }
  })

  useEffect(() => {
    fetchBounties()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!user) {
      setFormError('You must be signed in to post a bounty.')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from('bounties').insert([
      {
        title,
        description,
        style,
        reward: parseFloat(reward),
        status: 'open',
        user_id: user.id,
      },
    ])

    setSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    track({ name: 'bounty_posted', props: { style, reward: parseFloat(reward) } })
    setTitle('')
    setDescription('')
    setStyle(STYLE_KEYS[0])
    setReward('')
    await fetchBounties()
  }

  const handleAccept = async (bountyId: string) => {
    if (!user) {
      navigate('/auth')
      return
    }

    const { error } = await supabase
      .from('bounties')
      .update({ status: 'in_progress', assignee_id: user.id })
      .eq('id', bountyId)

    if (!error) {
      track({ name: 'bounty_accepted', props: { bounty_id: bountyId } })
      await fetchBounties()
    }
  }

  return (
    <div className="px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black">{t('bounties.title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="rounded-none border border-black bg-white p-8">
            <h2 className="text-xl font-bold tracking-tight text-black mb-6">
              {t('bounties.postTitle')}
            </h2>

            {formError && (
              <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6">
                <span className="text-sm font-medium text-red-600">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-xs font-medium text-black/60">
                  {t('bounties.taskTitle')}
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="text-xs font-medium text-black/60">
                  {t('bounties.description')}
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="style" className="text-xs font-medium text-black/60">
                  {t('bounties.requiredStyle')}
                </label>
                <select
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
                >
                  {STYLE_KEYS.map((s) => (
                    <option key={s} value={s}>
                      {t(`marketplace.styles.${s}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="reward" className="text-xs font-medium text-black/60">
                  {t('bounties.reward')}
                </label>
                <input
                  id="reward"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors mt-2 disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : t('bounties.publish')}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
            {(['all', 'open', 'mineCreated', 'mineAssigned'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`pb-3 text-sm transition-colors ${
                  tab === key
                    ? 'border-b-2 border-black text-black font-bold'
                    : 'text-black/40 hover:text-black'
                }`}
              >
                {t(`bounties.tabs.${key}`)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/40">Loading bounties...</span>
            </div>
          ) : visibleBounties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleBounties.map((bounty) => (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  onAccept={handleAccept}
                  canAccept={!user || bounty.user_id !== user.id}
                />
              ))}
            </div>
          ) : (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/40">{t('bounties.emptyTab')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

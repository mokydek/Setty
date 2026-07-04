import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../backend/supabase'

interface Bounty {
  id: string
  title: string
  description: string
  style_key: string
  reward: number
  status: string
  user_id: string
}

const STYLE_KEYS = ['lowPoly', 'cyberpunk', 'handPainted', 'realistic'] as const

function BountyCard({ bounty, onAccept }: { bounty: Bounty; onAccept: (id: string) => void }) {
  const { t } = useLanguage()

  return (
    <div className="rounded-none border border-black bg-white p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-bold tracking-tight text-black">{bounty.title}</h3>
        <span className="text-xs font-medium text-black/50 uppercase tracking-widest whitespace-nowrap pt-1">
          {t(`marketplace.styles.${bounty.style_key}`)}
        </span>
      </div>

      <p className="text-sm text-black/60 leading-relaxed">{bounty.description}</p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-lg font-semibold text-[#0000FF]">${bounty.reward.toFixed(2)}</span>
        <button
          onClick={() => onAccept(bounty.id)}
          className="rounded-none border border-black text-black px-4 py-2 text-sm font-medium hover:bg-[#0000FF] hover:text-white hover:border-[#0000FF] transition-colors"
        >
          {t('bounties.acceptTask')}
        </button>
      </div>
    </div>
  )
}

export default function Bounties() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState<string>(STYLE_KEYS[0])
  const [reward, setReward] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchBounties = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from('bounties').select('*').eq('status', 'open')

    if (!error && data) {
      setBounties(data as Bounty[])
    }

    setIsLoading(false)
  }

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
        style_key: style,
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

    setTitle('')
    setDescription('')
    setStyle(STYLE_KEYS[0])
    setReward('')
    await fetchBounties()
  }

  const handleAccept = async (bountyId: string) => {
    const { error } = await supabase
      .from('bounties')
      .update({ status: 'in_progress' })
      .eq('id', bountyId)

    if (!error) {
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
          <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-4 block">
            {t('bounties.openBounties')}
          </span>

          {isLoading ? (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/40">Loading bounties...</span>
            </div>
          ) : bounties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} onAccept={handleAccept} />
              ))}
            </div>
          ) : (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/40">No open bounties yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

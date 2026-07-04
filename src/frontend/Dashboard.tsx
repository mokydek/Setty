import { useEffect, useState } from 'react'
import { Download, ImageOff } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../backend/supabase'
import type { Asset, Bounty, Purchase } from '../types/database.types'

type Tab = 'assets' | 'bounties'

function OwnedAssetCard({ asset }: { asset: Asset }) {
  const { t } = useLanguage()

  return (
    <div className="rounded-none border border-black bg-white p-4 flex flex-col">
      <div className="rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4 overflow-hidden">
        {asset.image_url ? (
          <img src={asset.image_url} alt={asset.title} className="w-full h-full object-cover" />
        ) : (
          <ImageOff size={32} strokeWidth={1.5} className="text-black/30" />
        )}
      </div>

      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 mb-4">{asset.author_name}</span>

      <button className="rounded-none bg-[#0000FF] text-white px-3 py-2 flex items-center justify-center gap-2 text-xs font-medium hover:bg-black transition-colors mt-auto">
        <Download size={14} strokeWidth={1.5} />
        {t('dashboard.download')}
      </button>
    </div>
  )
}

function MyBountyRow({ bounty, onMarkDone }: { bounty: Bounty; onMarkDone: (id: string) => void }) {
  const { t } = useLanguage()
  const isCompleted = bounty.status === 'completed'

  return (
    <div className="rounded-none border border-black bg-white p-6 flex items-center justify-between gap-4">
      <span className="text-sm font-bold text-black tracking-tight">{bounty.title}</span>

      <div className="flex items-center gap-6">
        <span
          className={`text-xs font-medium uppercase tracking-widest ${
            isCompleted ? 'text-black' : 'text-black/40'
          }`}
        >
          {isCompleted ? t('dashboard.statusCompleted') : t('dashboard.statusInProgress')}
        </span>

        <button
          onClick={() => !isCompleted && onMarkDone(bounty.id)}
          className="rounded-none border border-black text-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors"
        >
          {isCompleted ? t('dashboard.viewFiles') : t('dashboard.markDone')}
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('assets')
  const [ownedAssets, setOwnedAssets] = useState<Asset[]>([])
  const [myBounties, setMyBounties] = useState<Bounty[]>([])
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [bountiesLoading, setBountiesLoading] = useState(true)

  const fetchOwnedAssets = async () => {
    if (!user) return
    setAssetsLoading(true)

    const { data, error } = await supabase
      .from('purchases')
      .select('*, assets(*)')
      .eq('user_id', user.id)

    if (!error && data) {
      setOwnedAssets((data as Purchase[]).map((purchase) => purchase.assets))
    }

    setAssetsLoading(false)
  }

  const fetchMyBounties = async () => {
    if (!user) return
    setBountiesLoading(true)

    const { data, error } = await supabase.from('bounties').select('*').eq('user_id', user.id)

    if (!error && data) {
      setMyBounties(data as Bounty[])
    }

    setBountiesLoading(false)
  }

  useEffect(() => {
    fetchOwnedAssets()
    fetchMyBounties()
  }, [user])

  const handleMarkDone = async (bountyId: string) => {
    const { error } = await supabase
      .from('bounties')
      .update({ status: 'completed' })
      .eq('id', bountyId)

    if (!error) {
      await fetchMyBounties()
    }
  }

  return (
    <div className="px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-6">{t('dashboard.title')}</h1>

        <div className="flex items-center gap-8 border-b border-gray-200">
          <button
            onClick={() => setTab('assets')}
            className={`pb-3 text-sm transition-colors ${
              tab === 'assets'
                ? 'border-b-2 border-black text-black font-bold'
                : 'text-black/40 hover:text-black'
            }`}
          >
            {t('dashboard.myAssets')}
          </button>
          <button
            onClick={() => setTab('bounties')}
            className={`pb-3 text-sm transition-colors ${
              tab === 'bounties'
                ? 'border-b-2 border-black text-black font-bold'
                : 'text-black/40 hover:text-black'
            }`}
          >
            {t('dashboard.myBounties')}
          </button>
        </div>
      </div>

      {tab === 'assets' &&
        (assetsLoading ? (
          <span className="text-sm font-medium text-black/40">Loading assets...</span>
        ) : ownedAssets.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ownedAssets.map((asset) => (
              <OwnedAssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <span className="text-sm font-medium text-black">No assets purchased yet.</span>
        ))}

      {tab === 'bounties' &&
        (bountiesLoading ? (
          <span className="text-sm font-medium text-black/40">Loading bounties...</span>
        ) : myBounties.length > 0 ? (
          <div className="flex flex-col gap-4">
            {myBounties.map((bounty) => (
              <MyBountyRow key={bounty.id} bounty={bounty} onMarkDone={handleMarkDone} />
            ))}
          </div>
        ) : (
          <span className="text-sm font-medium text-black">No bounties posted yet.</span>
        ))}
    </div>
  )
}

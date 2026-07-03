import { useState } from 'react'
import { Box, Image, Download } from 'lucide-react'

interface OwnedAsset {
  id: number
  title: string
  author: string
  kind: 'model' | 'sprite'
}

interface MyBounty {
  id: number
  title: string
  status: 'In Progress' | 'Completed'
}

type Tab = 'assets' | 'bounties'

const OWNED_ASSETS: OwnedAsset[] = [
  { id: 1, title: 'Voxel Forest Pack', author: 'Mira Voss', kind: 'model' },
  { id: 2, title: 'Neon Alley Tileset', author: 'Kaito Renn', kind: 'sprite' },
  { id: 3, title: 'Hand Drawn Foliage', author: 'Elin Marsh', kind: 'sprite' },
  { id: 4, title: 'Photoreal Rock Set', author: 'Dorian Kell', kind: 'model' },
  { id: 5, title: 'Low Poly Vehicle Set', author: 'Sana Ito', kind: 'model' },
  { id: 6, title: 'Cyberpunk HUD Icons', author: 'Kaito Renn', kind: 'sprite' },
  { id: 7, title: 'Painted Sky Backdrops', author: 'Elin Marsh', kind: 'sprite' },
  { id: 8, title: 'Realistic Foliage Scan', author: 'Sana Ito', kind: 'model' },
]

const MY_BOUNTIES: MyBounty[] = [
  { id: 1, title: 'Low Poly Watchtower', status: 'In Progress' },
  { id: 2, title: 'Cyberpunk Vending Machine', status: 'Completed' },
  { id: 3, title: 'Hand Painted Bridge Tile', status: 'In Progress' },
  { id: 4, title: 'Realistic Barrel Cluster', status: 'Completed' },
]

function OwnedAssetCard({ asset }: { asset: OwnedAsset }) {
  const Icon = asset.kind === 'model' ? Box : Image

  return (
    <div className="rounded-none border border-black bg-white p-4 flex flex-col">
      <div className="rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4">
        <Icon size={32} strokeWidth={1.5} className="text-black/30" />
      </div>

      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 mb-4">{asset.author}</span>

      <button className="rounded-none bg-[#0000FF] text-white px-3 py-2 flex items-center justify-center gap-2 text-xs font-medium hover:bg-black transition-colors mt-auto">
        <Download size={14} strokeWidth={1.5} />
        Download
      </button>
    </div>
  )
}

function MyBountyRow({ bounty }: { bounty: MyBounty }) {
  return (
    <div className="rounded-none border border-black bg-white p-6 flex items-center justify-between gap-4">
      <span className="text-sm font-bold text-black tracking-tight">{bounty.title}</span>

      <div className="flex items-center gap-6">
        <span
          className={`text-xs font-medium px-3 py-1 rounded-none ${
            bounty.status === 'Completed' ? 'bg-black text-white' : 'border border-black text-black'
          }`}
        >
          {bounty.status}
        </span>

        <button className="rounded-none border border-black text-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors">
          {bounty.status === 'Completed' ? 'View Files' : 'Mark Done'}
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('assets')

  return (
    <div className="px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-6">Dashboard</h1>

        <div className="flex items-center gap-8 border-b border-gray-200">
          <button
            onClick={() => setTab('assets')}
            className={`pb-3 text-sm transition-colors ${
              tab === 'assets'
                ? 'border-b-2 border-black text-black font-bold'
                : 'text-black/40 hover:text-black'
            }`}
          >
            My Assets
          </button>
          <button
            onClick={() => setTab('bounties')}
            className={`pb-3 text-sm transition-colors ${
              tab === 'bounties'
                ? 'border-b-2 border-black text-black font-bold'
                : 'text-black/40 hover:text-black'
            }`}
          >
            My Bounties
          </button>
        </div>
      </div>

      {tab === 'assets' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {OWNED_ASSETS.map((asset) => (
            <OwnedAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {tab === 'bounties' && (
        <div className="flex flex-col gap-4">
          {MY_BOUNTIES.map((bounty) => (
            <MyBountyRow key={bounty.id} bounty={bounty} />
          ))}
        </div>
      )}
    </div>
  )
}

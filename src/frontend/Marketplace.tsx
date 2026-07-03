import { useState } from 'react'
import { Box, Image, ShoppingCart } from 'lucide-react'

interface Asset {
  id: number
  title: string
  author: string
  price: string
  style: string
  kind: 'model' | 'sprite'
}

const STYLES = ['All Styles', 'Low Poly', 'Cyberpunk', 'Hand painted', 'Realistic'] as const

const ASSETS: Asset[] = [
  { id: 1, title: 'Voxel Forest Pack', author: 'Mira Voss', price: '$4.99', style: 'Low Poly', kind: 'model' },
  { id: 2, title: 'Neon Alley Tileset', author: 'Kaito Renn', price: '$6.50', style: 'Cyberpunk', kind: 'sprite' },
  { id: 3, title: 'Hand Drawn Foliage', author: 'Elin Marsh', price: '$3.25', style: 'Hand painted', kind: 'sprite' },
  { id: 4, title: 'Photoreal Rock Set', author: 'Dorian Kell', price: '$9.00', style: 'Realistic', kind: 'model' },
  { id: 5, title: 'Low Poly Character Rig', author: 'Mira Voss', price: '$7.75', style: 'Low Poly', kind: 'model' },
  { id: 6, title: 'Chrome Signage Kit', author: 'Kaito Renn', price: '$5.20', style: 'Cyberpunk', kind: 'sprite' },
  { id: 7, title: 'Watercolor Terrain Tiles', author: 'Elin Marsh', price: '$4.00', style: 'Hand painted', kind: 'sprite' },
  { id: 8, title: 'Realistic Prop Bundle', author: 'Dorian Kell', price: '$11.99', style: 'Realistic', kind: 'model' },
  { id: 9, title: 'Low Poly Vehicle Set', author: 'Sana Ito', price: '$8.40', style: 'Low Poly', kind: 'model' },
  { id: 10, title: 'Cyberpunk HUD Icons', author: 'Kaito Renn', price: '$2.99', style: 'Cyberpunk', kind: 'sprite' },
  { id: 11, title: 'Painted Sky Backdrops', author: 'Elin Marsh', price: '$3.75', style: 'Hand painted', kind: 'sprite' },
  { id: 12, title: 'Realistic Foliage Scan', author: 'Sana Ito', price: '$6.99', style: 'Realistic', kind: 'model' },
]

function AssetCard({ asset }: { asset: Asset }) {
  const Icon = asset.kind === 'model' ? Box : Image

  return (
    <div className="rounded-none border border-black bg-white p-4 flex flex-col">
      <div className="rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4">
        <Icon size={32} strokeWidth={1.5} className="text-black/30" />
      </div>

      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 mb-4">{asset.author}</span>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-semibold text-black">{asset.price}</span>
        <button className="rounded-none border border-black bg-black text-white px-3 py-2 flex items-center gap-2 text-xs font-medium hover:bg-white hover:text-black transition-colors">
          <ShoppingCart size={14} strokeWidth={1.5} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default function Marketplace() {
  const [activeStyle, setActiveStyle] = useState<string>('All Styles')

  const filteredAssets =
    activeStyle === 'All Styles' ? ASSETS : ASSETS.filter((asset) => asset.style === activeStyle)

  return (
    <div className="px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black">Marketplace</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <aside className="md:w-48 flex-shrink-0">
          <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-3 block">
            Visual Styles
          </span>
          <nav className="flex flex-row md:flex-col gap-2 flex-wrap">
            {STYLES.map((style) => {
              const isActive = style === activeStyle
              return (
                <button
                  key={style}
                  onClick={() => setActiveStyle(style)}
                  className={`rounded-none px-4 py-2 text-sm font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white text-black border border-black/10 hover:border-black'
                  }`}
                >
                  {style}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

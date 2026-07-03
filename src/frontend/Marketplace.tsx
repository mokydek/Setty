import { useMemo, useState } from 'react'
import { Box, Image, ShoppingCart, Search, Star, ChevronDown } from 'lucide-react'

interface Asset {
  id: number
  title: string
  author: string
  price: string
  numericPrice: number
  style: string
  category: string
  format: string
  kind: 'model' | 'sprite'
  rating: number
  reviews: number
}

const STYLES = ['All Styles', 'Low Poly', 'Cyberpunk', 'Hand painted', 'Realistic'] as const
const CATEGORIES = ['All Categories', 'Environment', 'Character', 'Prop', 'VFX', 'UI Kit'] as const

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const

const ASSETS: Asset[] = [
  { id: 1, title: 'Voxel Forest Pack', author: 'Mira Voss', price: '$4.99', numericPrice: 4.99, style: 'Low Poly', category: 'Environment', format: 'Unity Package', kind: 'model', rating: 4.8, reviews: 214 },
  { id: 2, title: 'Neon Alley Tileset', author: 'Kaito Renn', price: '$6.50', numericPrice: 6.5, style: 'Cyberpunk', category: 'Environment', format: 'PNG Sprite Sheet', kind: 'sprite', rating: 4.6, reviews: 98 },
  { id: 3, title: 'Hand Drawn Foliage', author: 'Elin Marsh', price: '$3.25', numericPrice: 3.25, style: 'Hand painted', category: 'Environment', format: 'PNG Sprite Sheet', kind: 'sprite', rating: 4.9, reviews: 152 },
  { id: 4, title: 'Photoreal Rock Set', author: 'Dorian Kell', price: '$9.00', numericPrice: 9.0, style: 'Realistic', category: 'Prop', format: 'FBX / OBJ', kind: 'model', rating: 4.7, reviews: 76 },
  { id: 5, title: 'Low Poly Character Rig', author: 'Mira Voss', price: '$7.75', numericPrice: 7.75, style: 'Low Poly', category: 'Character', format: 'FBX / Unity Package', kind: 'model', rating: 4.5, reviews: 133 },
  { id: 6, title: 'Chrome Signage Kit', author: 'Kaito Renn', price: '$5.20', numericPrice: 5.2, style: 'Cyberpunk', category: 'Prop', format: 'FBX / OBJ', kind: 'sprite', rating: 4.3, reviews: 54 },
  { id: 7, title: 'Watercolor Terrain Tiles', author: 'Elin Marsh', price: '$4.00', numericPrice: 4.0, style: 'Hand painted', category: 'Environment', format: 'PNG Sprite Sheet', kind: 'sprite', rating: 4.8, reviews: 189 },
  { id: 8, title: 'Realistic Prop Bundle', author: 'Dorian Kell', price: '$11.99', numericPrice: 11.99, style: 'Realistic', category: 'Prop', format: 'FBX / OBJ', kind: 'model', rating: 4.6, reviews: 61 },
  { id: 9, title: 'Low Poly Vehicle Set', author: 'Sana Ito', price: '$8.40', numericPrice: 8.4, style: 'Low Poly', category: 'Prop', format: 'Unity Package', kind: 'model', rating: 4.4, reviews: 87 },
  { id: 10, title: 'Cyberpunk HUD Icons', author: 'Kaito Renn', price: '$2.99', numericPrice: 2.99, style: 'Cyberpunk', category: 'UI Kit', format: 'PNG Sprite Sheet', kind: 'sprite', rating: 4.2, reviews: 43 },
  { id: 11, title: 'Painted Sky Backdrops', author: 'Elin Marsh', price: '$3.75', numericPrice: 3.75, style: 'Hand painted', category: 'Environment', format: 'PNG Sprite Sheet', kind: 'sprite', rating: 4.9, reviews: 201 },
  { id: 12, title: 'Realistic Foliage Scan', author: 'Sana Ito', price: '$6.99', numericPrice: 6.99, style: 'Realistic', category: 'Environment', format: 'FBX / OBJ', kind: 'model', rating: 4.7, reviews: 112 },
]

function RatingStars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            strokeWidth={1.5}
            className={i < Math.round(rating) ? 'fill-black text-black' : 'text-black/15'}
          />
        ))}
      </div>
      <span className="text-xs text-black/40">
        {rating.toFixed(1)} ({reviews})
      </span>
    </div>
  )
}

function AssetCard({ asset }: { asset: Asset }) {
  const Icon = asset.kind === 'model' ? Box : Image

  return (
    <div className="rounded-none border border-black bg-white p-4 flex flex-col">
      <div className="relative rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4">
        <Icon size={32} strokeWidth={1.5} className="text-black/30" />
        <span className="absolute top-2 left-2 text-[10px] font-medium text-black/50 uppercase tracking-widest">
          {asset.format}
        </span>
      </div>

      <span className="text-[10px] font-medium text-[#0000FF] uppercase tracking-widest mb-1">
        {asset.category}
      </span>
      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 mb-2">by {asset.author}</span>
      <div className="mb-4">
        <RatingStars rating={asset.rating} reviews={asset.reviews} />
      </div>

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
  const [activeCategory, setActiveCategory] = useState<string>('All Categories')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('popular')

  const filteredAssets = useMemo(() => {
    let result = ASSETS

    if (activeStyle !== 'All Styles') {
      result = result.filter((asset) => asset.style === activeStyle)
    }

    if (activeCategory !== 'All Categories') {
      result = result.filter((asset) => asset.category === activeCategory)
    }

    if (query.trim() !== '') {
      const q = query.trim().toLowerCase()
      result = result.filter(
        (asset) =>
          asset.title.toLowerCase().includes(q) || asset.author.toLowerCase().includes(q),
      )
    }

    const sorted = [...result]
    if (sort === 'price-asc') {
      sorted.sort((a, b) => a.numericPrice - b.numericPrice)
    } else if (sort === 'price-desc') {
      sorted.sort((a, b) => b.numericPrice - a.numericPrice)
    } else if (sort === 'newest') {
      sorted.sort((a, b) => b.id - a.id)
    } else {
      sorted.sort((a, b) => b.reviews - a.reviews)
    }

    return sorted
  }, [activeStyle, activeCategory, query, sort])

  return (
    <div className="px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-2 block">
          {activeCategory} / {activeStyle}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-black">Marketplace</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
        <div className="flex items-center border border-black px-3 py-2.5 gap-2 flex-1">
          <Search size={16} strokeWidth={1.5} className="text-black/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets or creators..."
            className="text-sm outline-none bg-transparent w-full placeholder:text-black/30"
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-none border border-black bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-black outline-none appearance-none w-full sm:w-56"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <aside className="md:w-52 flex-shrink-0 flex flex-col gap-8">
          <div>
            <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-3 block">
              Category
            </span>
            <nav className="flex flex-row md:flex-col gap-2 flex-wrap">
              {CATEGORIES.map((category) => {
                const isActive = category === activeCategory
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-none px-4 py-2 text-sm font-medium text-left transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'bg-white text-black border border-black/10 hover:border-black'
                    }`}
                  >
                    {category}
                  </button>
                )
              })}
            </nav>
          </div>

          <div>
            <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-3 block">
              Visual Style
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
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-black/40">{filteredAssets.length} results</span>
          </div>

          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/40">No assets match your filters.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

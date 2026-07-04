import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, ChevronDown, Check, ImageOff } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../backend/supabase'
import { useCart } from '../contexts/CartContext'
import type { Asset } from '../types/database.types'

const STYLE_KEYS = ['all', 'lowPoly', 'cyberpunk', 'handPainted', 'realistic'] as const

const SORT_OPTIONS = ['newest', 'priceAsc', 'priceDesc'] as const
type SortOption = (typeof SORT_OPTIONS)[number]

function AssetCard({ asset }: { asset: Asset }) {
  const { t } = useLanguage()
  const { items, addToCart } = useCart()
  const navigate = useNavigate()
  const [imageFailed, setImageFailed] = useState(false)
  const inCart = items.some((item) => item.id === asset.id)

  return (
    <div
      onClick={() => navigate(`/asset/${asset.id}`)}
      className="rounded-none border border-black bg-white p-4 flex flex-col cursor-pointer"
    >
      <div className="relative rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4 overflow-hidden">
        {asset.image_url && !imageFailed ? (
          <img
            src={asset.image_url}
            alt={asset.title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageOff size={32} strokeWidth={1.5} className="text-black/30" />
        )}
      </div>

      <span className="text-[10px] font-medium text-[#0000FF] uppercase tracking-widest mb-1">
        {t(`marketplace.styles.${asset.style}`)}
      </span>
      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 mb-4">
        {t('marketplace.by')} {asset.author_name}
      </span>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-semibold text-black">${asset.price.toFixed(2)}</span>
        <button
          onClick={(event) => {
            event.stopPropagation()
            addToCart(asset)
          }}
          disabled={inCart}
          className="rounded-none border border-black bg-black text-white px-3 py-2 flex items-center gap-2 text-xs font-medium hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {inCart ? <Check size={14} strokeWidth={1.5} /> : <ShoppingCart size={14} strokeWidth={1.5} />}
          {inCart ? 'In Cart' : t('marketplace.addToCart')}
        </button>
      </div>
    </div>
  )
}

export default function Marketplace() {
  const { t } = useLanguage()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStyle, setActiveStyle] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true)
      const { data, error } = await supabase.from('assets').select('*')

      if (!error && data) {
        setAssets(data as Asset[])
      }

      setIsLoading(false)
    }

    fetchAssets()
  }, [])

  const filteredAssets = useMemo(() => {
    let result = assets

    if (activeStyle !== 'all') {
      result = result.filter((asset) => asset.style === activeStyle)
    }

    if (query.trim() !== '') {
      const q = query.trim().toLowerCase()
      result = result.filter(
        (asset) =>
          asset.title.toLowerCase().includes(q) || asset.author_name.toLowerCase().includes(q),
      )
    }

    const sorted = [...result]
    if (sort === 'priceAsc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sort === 'priceDesc') {
      sorted.sort((a, b) => b.price - a.price)
    } else {
      sorted.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    }

    return sorted
  }, [assets, activeStyle, query, sort])

  return (
    <div className="px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-2 block">
          {t(`marketplace.styles.${activeStyle}`)}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-black">{t('marketplace.title')}</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
        <div className="flex items-center border border-black px-3 py-2.5 gap-2 flex-1">
          <Search size={16} strokeWidth={1.5} className="text-black/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('marketplace.searchPlaceholder')}
            className="text-sm outline-none bg-transparent w-full placeholder:text-black/30"
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-none border border-black bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-black outline-none appearance-none w-full sm:w-56"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`marketplace.sort.${option}`)}
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
        <aside className="md:w-52 flex-shrink-0">
          <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-3 block">
            {t('marketplace.visualStyle')}
          </span>
          <nav className="flex flex-row md:flex-col gap-2 flex-wrap">
            {STYLE_KEYS.map((style) => {
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
                  {t(`marketplace.styles.${style}`)}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-black/40">
              {filteredAssets.length} {t('marketplace.results')}
            </span>
          </div>

          {isLoading ? (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/40">Loading assets...</span>
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/40">{t('marketplace.noResults')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

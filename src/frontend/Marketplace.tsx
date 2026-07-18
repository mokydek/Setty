import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ShoppingCart,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  ImageOff,
  Heart,
} from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../backend/supabase'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useAuth } from '../contexts/AuthContext'
import type { Asset } from '../types/database.types'

const STYLE_KEYS = ['all', 'lowPoly', 'cyberpunk', 'handPainted', 'realistic'] as const

const SORT_OPTIONS = ['newest', 'priceAsc', 'priceDesc'] as const
type SortOption = (typeof SORT_OPTIONS)[number]

const PAGE_SIZE = 12

function AssetCard({ asset }: { asset: Asset }) {
  const { t } = useLanguage()
  const { items, addToCart } = useCart()
  const { user } = useAuth()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const navigate = useNavigate()
  const [imageFailed, setImageFailed] = useState(false)
  const inCart = items.some((item) => item.id === asset.id)
  const wishlisted = isWishlisted(asset.id)

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
        {user && (
          <button
            onClick={(event) => {
              event.stopPropagation()
              toggleWishlist(asset.id)
            }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2 right-2 p-1.5 bg-white border border-black text-black hover:text-[#0000FF] transition-colors"
          >
            <Heart size={14} strokeWidth={1.5} className={wishlisted ? 'fill-[#0000FF] text-[#0000FF]' : ''} />
          </button>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [assets, setAssets] = useState<Asset[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeStyle, setActiveStyle] = useState<string>('all')
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState(() => (searchParams.get('q') ?? '').trim())
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timeout)
  }, [query])

  // The header search navigates here with ?q=term; pick up external changes.
  useEffect(() => {
    const urlQuery = searchParams.get('q') ?? ''
    setQuery(urlQuery)
    setDebouncedQuery(urlQuery.trim())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Keep the URL shareable as the user types.
  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (current === debouncedQuery) return
    const next = new URLSearchParams(searchParams)
    if (debouncedQuery) {
      next.set('q', debouncedQuery)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  useEffect(() => {
    setPage(1)
  }, [activeStyle, debouncedQuery, sort])

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true)

      // With a search term, go through the ranked search_assets RPC (FTS
      // with an ilike fallback for short/partial terms); otherwise browse
      // the approved catalogue directly. Both return asset rows, so the
      // same filters, sort and pagination apply.
      let request =
        debouncedQuery !== ''
          ? supabase.rpc('search_assets', { term: debouncedQuery }, { count: 'exact' })
          : supabase.from('assets').select('*', { count: 'exact' }).eq('review_status', 'approved')

      if (activeStyle !== 'all') {
        request = request.eq('style', activeStyle)
      }

      if (sort === 'priceAsc') {
        request = request.order('price', { ascending: true })
      } else if (sort === 'priceDesc') {
        request = request.order('price', { ascending: false })
      } else if (debouncedQuery === '') {
        // 'newest' while searching keeps the RPC's relevance ranking.
        request = request.order('created_at', { ascending: false })
      }

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      request = request.range(from, to)

      const { data, error, count } = await request

      if (!error && data) {
        setAssets(data as Asset[])
        setTotalCount(count ?? 0)
      }

      setIsLoading(false)
    }

    fetchAssets()
  }, [activeStyle, debouncedQuery, sort, page])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

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
              {totalCount} {t('marketplace.results')}
            </span>
          </div>

          {isLoading ? (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-medium text-black/40">Loading assets...</span>
            </div>
          ) : assets.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="rounded-none border border-black text-black px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={14} strokeWidth={1.5} />
                    Previous
                  </button>

                  <span className="text-sm text-black/40">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="rounded-none border border-black text-black px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next
                    <ChevronRight size={14} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <span className="text-sm font-medium text-black/40">{t('marketplace.noResults')}</span>
              {debouncedQuery !== '' && (
                <>
                  <p className="text-sm text-black/60 max-w-md">
                    {t('marketplace.emptySearchBounty')}
                  </p>
                  <Link
                    to="/bounties"
                    className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors"
                  >
                    {t('landing.hero.postBounty')}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

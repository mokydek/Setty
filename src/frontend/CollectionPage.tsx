import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, ImageOff } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../backend/supabase'
import {
  ASSET_CATEGORIES,
  categoryLabelKey,
  computeCompleteness,
} from '../lib/collectionCompleteness'
import { useAssetRatings } from '../lib/useAssetRatings'
import RatingSquares from '../components/RatingSquares'
import type { Asset, Collection } from '../types/database.types'

function CollectionAssetCard({ asset, rating }: { asset: Asset; rating?: { avg_rating: number; review_count: number } }) {
  const { t } = useLanguage()
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      to={`/asset/${asset.id}`}
      className="rounded-none border border-black bg-white p-4 flex flex-col"
    >
      <div className="rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4 overflow-hidden">
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
        {t(`marketplace.categories.${categoryLabelKey(asset.category ?? 'prop')}`)}
      </span>
      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 mb-2">
        {t('marketplace.by')} {asset.author_name}
      </span>
      {rating && rating.review_count > 0 && (
        <span className="mb-2">
          <RatingSquares average={rating.avg_rating} count={rating.review_count} size={8} />
        </span>
      )}
      <span className="text-sm font-semibold text-black mt-auto">${asset.price.toFixed(2)}</span>
    </Link>
  )
}

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, language } = useLanguage()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchCollection = async () => {
      if (!slug) return
      setIsLoading(true)

      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      const found = data as Collection
      setCollection(found)

      const { data: assetRows } = await supabase
        .from('assets')
        .select('*')
        .eq('review_status', 'approved')
        .or(`collection_id.eq.${found.id},style.eq.${found.style}`)
        .order('created_at', { ascending: false })

      setAssets((assetRows as Asset[]) ?? [])
      setIsLoading(false)
    }

    fetchCollection()
  }, [slug])

  const ratings = useAssetRatings(assets.map((asset) => asset.id))

  if (isLoading) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black/40">{t('collections.loading')}</span>
      </div>
    )
  }

  if (notFound || !collection) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black">{t('collections.notFound')}</span>
      </div>
    )
  }

  const name = language === 'ru' ? collection.name_ru : collection.name_en
  const description = language === 'ru' ? collection.description_ru : collection.description_en
  const completeness = computeCompleteness(assets)

  return (
    <div>
      <section className="px-8 py-16 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-3 block">
            {t('collections.label')}
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-black mb-4">{name}</h1>
          <p className="text-sm text-black/60 leading-relaxed max-w-2xl mb-4">{description}</p>
          <div className="flex items-center gap-2 text-sm font-medium text-[#0000FF]">
            <Check size={16} strokeWidth={2} />
            {t('collections.guarantee')}
          </div>
        </div>
      </section>

      <section className="px-8 py-10 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-black/40 uppercase tracking-widest">
              {t('collections.completeness')}
            </span>
            <span className="text-sm font-bold text-black">
              {completeness.coveredCategories}/{completeness.totalCategories}{' '}
              {t('collections.categoriesCovered')}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 border border-black divide-x divide-y md:divide-y-0 divide-black">
            {ASSET_CATEGORIES.map((category) => {
              const count = completeness.perCategory[category]
              const covered = count > 0
              return (
                <div
                  key={category}
                  className={`flex flex-col items-center gap-1 py-6 px-4 ${covered ? 'bg-white' : 'bg-gray-100'}`}
                >
                  <span className={`text-2xl font-bold tracking-tight ${covered ? 'text-[#0000FF]' : 'text-black/30'}`}>
                    {count}
                  </span>
                  <span className="text-xs font-medium text-black/60 text-center">
                    {t(`marketplace.categories.${categoryLabelKey(category)}`)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm text-black/40">
              {assets.length} {t('marketplace.results')}
            </span>
          </div>

          {assets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {assets.map((asset) => (
                <CollectionAssetCard key={asset.id} asset={asset} rating={ratings[asset.id]} />
              ))}
            </div>
          ) : (
            <div className="border border-black/10 py-24 flex items-center justify-center mb-12">
              <span className="text-sm font-medium text-black/40">{t('collections.empty')}</span>
            </div>
          )}

          <div className="border border-black bg-black text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1">
                {t('collections.missingTitle')}
              </h2>
              <p className="text-sm text-white/70">{t('collections.missingText')}</p>
            </div>
            <Link
              to={`/bounties?style=${collection.style}`}
              className="rounded-none bg-[#0000FF] text-white px-6 py-3 flex items-center gap-2 text-sm font-semibold hover:bg-white hover:text-black transition-colors whitespace-nowrap"
            >
              {t('landing.hero.postBounty')}
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Image,
  ArrowRight,
  Triangle,
  Zap,
  Paintbrush,
  Camera,
  Target,
} from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

interface PreviewAsset {
  id: number
  title: string
  styleKey: string
  price: string
  kind: 'model' | 'sprite'
}

const PREVIEW_ASSETS: PreviewAsset[] = [
  { id: 1, title: 'Voxel Forest Pack', styleKey: 'lowPoly', price: '$4.99', kind: 'model' },
  { id: 2, title: 'Neon Alley Tileset', styleKey: 'cyberpunk', price: '$6.50', kind: 'sprite' },
  { id: 3, title: 'Hand Drawn Foliage', styleKey: 'handPainted', price: '$3.25', kind: 'sprite' },
  { id: 4, title: 'Photoreal Rock Set', styleKey: 'realistic', price: '$9.00', kind: 'model' },
]

// Collection tiles: each links to a curated, style-guaranteed collection.
const COLLECTION_TILES = [
  { styleKey: 'lowPoly', slug: 'low-poly', icon: Triangle },
  { styleKey: 'cyberpunk', slug: 'cyberpunk', icon: Zap },
  { styleKey: 'handPainted', slug: 'hand-painted', icon: Paintbrush },
  { styleKey: 'realistic', slug: 'realistic', icon: Camera },
]

function PreviewCard({ asset }: { asset: PreviewAsset }) {
  const { t } = useLanguage()
  const Icon = asset.kind === 'model' ? Box : Image

  return (
    <Link
      to="/app"
      className="rounded-none border border-black bg-white p-4 flex flex-col hover:border-[#0000FF] transition-colors"
    >
      <div className="rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4">
        <Icon size={28} strokeWidth={1.5} className="text-black/30" />
      </div>
      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 uppercase tracking-widest mb-4">
        {t(`marketplace.styles.${asset.styleKey}`)}
      </span>
      <span className="text-sm font-semibold text-black mt-auto">{asset.price}</span>
    </Link>
  )
}

export default function Landing() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handlePostBounty = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      event.preventDefault()
      navigate('/auth')
    }
  }

  return (
    <div className="bg-white">
      <section className="px-8 py-20 md:py-28 flex flex-col items-center text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black leading-none mb-8">
          {t('landing.hero.title')}
        </h1>
        <p className="text-base md:text-lg text-black/60 max-w-2xl mb-12 leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/app"
            className="rounded-none bg-[#0000FF] text-white px-8 py-4 text-sm font-semibold hover:bg-black transition-colors w-full sm:w-auto text-center"
          >
            {t('landing.hero.exploreAssets')}
          </Link>
          <Link
            to="/bounties"
            onClick={handlePostBounty}
            className="rounded-none border border-black text-black px-8 py-4 text-sm font-semibold hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-center"
          >
            {t('landing.hero.postBounty')}
          </Link>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-6 block">
            {t('collections.label')}
          </span>

          <div className="grid grid-cols-2 md:grid-cols-4 border border-black divide-x divide-y md:divide-y-0 divide-black">
            {COLLECTION_TILES.map(({ styleKey, slug, icon: Icon }) => (
              <Link
                key={slug}
                to={`/collection/${slug}`}
                className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center hover:bg-black hover:text-white transition-colors group"
              >
                <Icon size={28} strokeWidth={1.5} className="text-[#0000FF] group-hover:text-white transition-colors" />
                <span className="text-sm font-semibold tracking-tight">
                  {t(`marketplace.styles.${styleKey}`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-2 block">
                {t('landing.preview.label')}
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-black">
                {t('landing.preview.title')}
              </h2>
            </div>
            <Link
              to="/app"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-black hover:text-[#0000FF] transition-colors"
            >
              {t('landing.preview.viewAll')}
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PREVIEW_ASSETS.map((asset) => (
              <PreviewCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto border border-black flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-14">
          <div className="flex items-start gap-4 max-w-xl">
            <Target size={28} strokeWidth={1.5} className="text-[#0000FF] shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-black mb-2">
                {t('landing.features.bounty.title')}
              </h2>
              <p className="text-sm text-black/60 leading-relaxed">
                {t('landing.features.bounty.description')}
              </p>
            </div>
          </div>
          <Link
            to="/bounties"
            onClick={handlePostBounty}
            className="rounded-none bg-[#0000FF] text-white px-8 py-4 text-sm font-semibold hover:bg-black transition-colors w-full md:w-auto text-center shrink-0"
          >
            {t('landing.hero.postBounty')}
          </Link>
        </div>
      </section>

      <section className="px-8 py-24 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">
            {t('landing.cta.title')}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/app"
              className="rounded-none bg-[#0000FF] text-white px-8 py-4 text-sm font-semibold hover:bg-black transition-colors w-full sm:w-auto text-center"
            >
              {t('landing.cta.startBrowsing')}
            </Link>
            <Link
              to="/auth"
              className="rounded-none border border-black text-black px-8 py-4 text-sm font-semibold hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-center"
            >
              {t('landing.cta.createAccount')}
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-8 py-8 border-t border-gray-200 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-lg tracking-tight text-black">{t('footer.brand')}</span>
        <span className="text-sm text-black/40">{new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

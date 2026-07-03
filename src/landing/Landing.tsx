import { Link } from 'react-router-dom'
import {
  Layers,
  ShoppingBag,
  Target,
  Box,
  Image,
  ArrowRight,
  Search,
  UploadCloud,
  Wallet,
} from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

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

const STAT_KEYS = ['assets', 'artists', 'matchRate', 'paidOut'] as const
const STAT_VALUES = ['1,200+', '340+', '95%', '$180K+']

const STEP_ICONS = [Search, Wallet, UploadCloud]
const STEP_KEYS = ['browse', 'buy', 'bounty'] as const

function PreviewCard({ asset }: { asset: PreviewAsset }) {
  const { t } = useLanguage()
  const Icon = asset.kind === 'model' ? Box : Image

  return (
    <div className="rounded-none border border-black bg-white p-4 flex flex-col">
      <div className="rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4">
        <Icon size={28} strokeWidth={1.5} className="text-black/30" />
      </div>
      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 uppercase tracking-widest mb-4">
        {t(`marketplace.styles.${asset.styleKey}`)}
      </span>
      <span className="text-sm font-semibold text-black mt-auto">{asset.price}</span>
    </div>
  )
}

export default function Landing() {
  const { t } = useLanguage()

  return (
    <div className="bg-white">
      <section className="stack-section bg-white px-8 py-24 md:py-32 flex flex-col items-center text-center" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center">
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
              className="rounded-none border border-black text-black px-8 py-4 text-sm font-semibold hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-center"
            >
              {t('landing.hero.postBounty')}
            </Link>
          </div>
        </div>
      </section>

      <section className="stack-section bg-white px-8 py-16 border-t border-gray-200" style={{ zIndex: 20 }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STAT_KEYS.map((key, index) => (
            <div key={key} className="flex flex-col items-center text-center">
              <span className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2">
                {STAT_VALUES[index]}
              </span>
              <span className="text-xs text-black/50 uppercase tracking-widest">
                {t(`landing.stats.${key}`)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="stack-section bg-white px-8 py-24 border-t border-gray-200" style={{ zIndex: 30 }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="flex flex-col gap-4">
            <Layers size={28} strokeWidth={1.5} className="text-black" />
            <h3 className="text-xl font-bold tracking-tight text-black">
              {t('landing.features.curated.title')}
            </h3>
            <p className="text-sm text-black/60 leading-relaxed">
              {t('landing.features.curated.description')}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <ShoppingBag size={28} strokeWidth={1.5} className="text-[#0000FF]" />
            <h3 className="text-xl font-bold tracking-tight text-black">
              {t('landing.features.alaCarte.title')}
            </h3>
            <p className="text-sm text-black/60 leading-relaxed">
              {t('landing.features.alaCarte.description')}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Target size={28} strokeWidth={1.5} className="text-black" />
            <h3 className="text-xl font-bold tracking-tight text-black">
              {t('landing.features.bounty.title')}
            </h3>
            <p className="text-sm text-black/60 leading-relaxed">
              {t('landing.features.bounty.description')}
            </p>
          </div>
        </div>
      </section>

      <section className="stack-section bg-white px-8 py-24 border-t border-gray-200" style={{ zIndex: 40 }}>
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

      <section className="stack-section bg-white px-8 py-24 border-t border-gray-200" style={{ zIndex: 50 }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-black mb-16 text-center">
            {t('landing.steps.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {STEP_KEYS.map((key, index) => {
              const Icon = STEP_ICONS[index]
              return (
                <div key={key} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-black/30">{`0${index + 1}`}</span>
                    <Icon size={24} strokeWidth={1.5} className="text-[#0000FF]" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-black">
                    {t(`landing.steps.${key}.title`)}
                  </h3>
                  <p className="text-sm text-black/60 leading-relaxed">
                    {t(`landing.steps.${key}.description`)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="stack-section px-8 py-24 border-t border-gray-200 bg-white" style={{ zIndex: 60 }}>
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

      <footer className="stack-section bg-white px-8 py-8 border-t border-gray-200" style={{ zIndex: 70 }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-black">{t('footer.brand')}</span>
          <span className="text-sm text-black/40">{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}

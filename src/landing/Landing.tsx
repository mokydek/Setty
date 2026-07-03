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

interface PreviewAsset {
  id: number
  title: string
  style: string
  price: string
  kind: 'model' | 'sprite'
}

const PREVIEW_ASSETS: PreviewAsset[] = [
  { id: 1, title: 'Voxel Forest Pack', style: 'Low Poly', price: '$4.99', kind: 'model' },
  { id: 2, title: 'Neon Alley Tileset', style: 'Cyberpunk', price: '$6.50', kind: 'sprite' },
  { id: 3, title: 'Hand Drawn Foliage', style: 'Hand painted', price: '$3.25', kind: 'sprite' },
  { id: 4, title: 'Photoreal Rock Set', style: 'Realistic', price: '$9.00', kind: 'model' },
]

const STATS = [
  { value: '1,200+', label: 'Curated assets' },
  { value: '340+', label: 'Verified artists' },
  { value: '95%', label: 'Style match rate' },
  { value: '$180K+', label: 'Paid to creators' },
]

const STEPS = [
  {
    icon: Search,
    title: 'Browse by style',
    description: 'Filter the entire catalog by strict visual style, so every result already fits your project.',
  },
  {
    icon: Wallet,
    title: 'Buy what you need',
    description: 'Purchase single assets at a fair price instead of committing to oversized bundles.',
  },
  {
    icon: UploadCloud,
    title: 'Fill the gaps with bounties',
    description: 'Missing a piece. Post a bounty and receive a matching asset from a verified artist.',
  },
]

function PreviewCard({ asset }: { asset: PreviewAsset }) {
  const Icon = asset.kind === 'model' ? Box : Image

  return (
    <div className="rounded-none border border-black bg-white p-4 flex flex-col">
      <div className="rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4">
        <Icon size={28} strokeWidth={1.5} className="text-black/30" />
      </div>
      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 uppercase tracking-widest mb-4">{asset.style}</span>
      <span className="text-sm font-semibold text-black mt-auto">{asset.price}</span>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="bg-white">
      <section className="px-8 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black leading-none mb-8">
          End the Frankenstein Effect in Your Games
        </h1>
        <p className="text-base md:text-lg text-black/60 max-w-2xl mb-12 leading-relaxed">
          Setty is a curated marketplace for 2D and 3D digital assets with strict style
          synchronization, so every piece you buy fits together by design.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/app"
            className="rounded-none bg-[#0000FF] text-white px-8 py-4 text-sm font-semibold hover:bg-black transition-colors w-full sm:w-auto text-center"
          >
            Explore Assets
          </Link>
          <Link
            to="/bounties"
            className="rounded-none border border-black text-black px-8 py-4 text-sm font-semibold hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-center"
          >
            Post a Bounty
          </Link>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <span className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2">
                {stat.value}
              </span>
              <span className="text-xs text-black/50 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="flex flex-col gap-4">
            <Layers size={28} strokeWidth={1.5} className="text-black" />
            <h3 className="text-xl font-bold tracking-tight text-black">Curated Collections</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Every asset is strictly organized by visual style, so anything you pick from a
              collection is guaranteed to be compatible with the rest.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <ShoppingBag size={28} strokeWidth={1.5} className="text-[#0000FF]" />
            <h3 className="text-xl font-bold tracking-tight text-black">A La Carte Buying</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Buy exactly the single item you need, without paying for massive bundles full of
              assets you will never use.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Target size={28} strokeWidth={1.5} className="text-black" />
            <h3 className="text-xl font-bold tracking-tight text-black">The Bounty System</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Missing a specific asset in your style. Post a micro task and let 3D and 2D artists
              deliver exactly what your project needs.
            </p>
          </div>
        </div>
      </section>

      <section className="px-8 py-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-2 block">
                From the marketplace
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-black">Recently added assets</h2>
            </div>
            <Link
              to="/app"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-black hover:text-[#0000FF] transition-colors"
            >
              View all
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

      <section className="px-8 py-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-black mb-16 text-center">
            How Setty works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-black/30">{`0${index + 1}`}</span>
                    <Icon size={24} strokeWidth={1.5} className="text-[#0000FF]" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-black">{step.title}</h3>
                  <p className="text-sm text-black/60 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-8 py-24 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">
            Build a consistent world, one asset at a time
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/app"
              className="rounded-none bg-[#0000FF] text-white px-8 py-4 text-sm font-semibold hover:bg-black transition-colors w-full sm:w-auto text-center"
            >
              Start Browsing
            </Link>
            <Link
              to="/auth"
              className="rounded-none border border-black text-black px-8 py-4 text-sm font-semibold hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-center"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-8 py-8 border-t border-gray-200 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-lg tracking-tight text-black">Setty</span>
        <span className="text-sm text-black/40">{new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

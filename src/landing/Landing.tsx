import { Layers, ShoppingBag, Target } from 'lucide-react'

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
          <button className="rounded-none bg-[#0000FF] text-white px-8 py-4 text-sm font-semibold hover:bg-black transition-colors w-full sm:w-auto">
            Explore Assets
          </button>
          <button className="rounded-none border border-black text-black px-8 py-4 text-sm font-semibold hover:bg-black hover:text-white transition-colors w-full sm:w-auto">
            Post a Bounty
          </button>
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

      <footer className="px-8 py-8 border-t border-gray-200 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-lg tracking-tight text-black">Setty</span>
        <span className="text-sm text-black/40">{new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

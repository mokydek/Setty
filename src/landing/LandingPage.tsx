import { ArrowRight, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-black px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={20} strokeWidth={1.5} />
          <span className="font-semibold text-base tracking-tight">Setty</span>
        </div>
        <button
          onClick={() => navigate('/app')}
          className="text-sm font-medium border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
        >
          Enter marketplace
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-xs font-medium tracking-widest uppercase text-[#0000FF] mb-6">
          B2B / B2C Digital Asset Marketplace
        </p>
        <h1 className="text-6xl font-bold tracking-tight leading-none mb-6 max-w-3xl">
          The curated market for digital assets.
        </h1>
        <p className="text-base text-black/60 max-w-md mb-10 leading-relaxed">
          Setty connects buyers and sellers of premium digital products with zero friction and full transparency.
        </p>
        <button
          onClick={() => navigate('/app')}
          className="inline-flex items-center gap-2 bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors"
        >
          Browse assets
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </section>

      <footer className="border-t border-black px-8 py-4 flex items-center justify-between">
        <span className="text-xs text-black/40">2026 Setty</span>
        <span className="text-xs text-black/40">Phase 1</span>
      </footer>
    </main>
  )
}

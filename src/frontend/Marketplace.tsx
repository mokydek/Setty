import { Search, SlidersHorizontal, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Marketplace() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-black px-8 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Layers size={20} strokeWidth={1.5} />
          <span className="font-semibold text-base tracking-tight">Setty</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-black/20 px-3 py-2 gap-2 w-64">
            <Search size={14} strokeWidth={1.5} className="text-black/40" />
            <input
              type="text"
              placeholder="Search assets..."
              className="text-sm outline-none bg-transparent w-full placeholder:text-black/30 font-['Space_Grotesk']"
            />
          </div>
          <button className="flex items-center gap-2 border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors">
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filter
          </button>
        </div>
      </header>

      <section className="px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-[#0000FF] mb-2">
              All assets
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
          </div>
          <span className="text-sm text-black/40">0 results</span>
        </div>

        <div className="border border-black/10 py-24 flex flex-col items-center justify-center gap-3">
          <span className="text-sm font-medium text-black/30">No assets listed yet.</span>
          <span className="text-xs text-black/20">Phase 1 scaffold</span>
        </div>
      </section>
    </main>
  )
}

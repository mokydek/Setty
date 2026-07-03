import { useState, type FormEvent } from 'react'

interface Bounty {
  id: number
  title: string
  description: string
  style: string
  reward: string
}

const STYLES = ['Low Poly', 'Cyberpunk', 'Hand painted', 'Realistic'] as const

const BOUNTIES: Bounty[] = [
  {
    id: 1,
    title: 'Low Poly Watchtower',
    description: 'Need a modular watchtower with a ladder and lookout deck, matching a low poly forest set.',
    style: 'Low Poly',
    reward: '$15.00',
  },
  {
    id: 2,
    title: 'Cyberpunk Vending Machine',
    description: 'Single prop, neon trim, chrome body, to fit an existing alley tileset.',
    style: 'Cyberpunk',
    reward: '$12.50',
  },
  {
    id: 3,
    title: 'Hand Painted Bridge Tile',
    description: 'A wooden rope bridge tile in a soft painted style, matching existing terrain art.',
    style: 'Hand painted',
    reward: '$9.00',
  },
  {
    id: 4,
    title: 'Realistic Barrel Cluster',
    description: 'Photoreal wooden and metal barrels, scanned texture quality, for an industrial scene.',
    style: 'Realistic',
    reward: '$20.00',
  },
  {
    id: 5,
    title: 'Low Poly Market Stall',
    description: 'A single market stall prop with awning, consistent with a low poly village kit.',
    style: 'Low Poly',
    reward: '$11.25',
  },
]

function BountyCard({ bounty }: { bounty: Bounty }) {
  return (
    <div className="rounded-none border border-black bg-white p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-bold tracking-tight text-black">{bounty.title}</h3>
        <span className="rounded-none bg-black text-white text-xs font-medium px-3 py-1 whitespace-nowrap">
          {bounty.style}
        </span>
      </div>

      <p className="text-sm text-black/60 leading-relaxed">{bounty.description}</p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-lg font-semibold text-[#0000FF]">{bounty.reward}</span>
        <button className="rounded-none border border-black text-black px-4 py-2 text-sm font-medium hover:bg-[#0000FF] hover:text-white hover:border-[#0000FF] transition-colors">
          Accept Task
        </button>
      </div>
    </div>
  )
}

export default function Bounties() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState<string>(STYLES[0])
  const [reward, setReward] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTitle('')
    setDescription('')
    setStyle(STYLES[0])
    setReward('')
  }

  return (
    <div className="px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black">Bounties</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="rounded-none border border-black bg-white p-8">
            <h2 className="text-xl font-bold tracking-tight text-black mb-6">Post a Bounty</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-xs font-medium text-black/60">
                  Task Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="text-xs font-medium text-black/60">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="style" className="text-xs font-medium text-black/60">
                  Required Style
                </label>
                <select
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="reward" className="text-xs font-medium text-black/60">
                  Reward Amount (USD)
                </label>
                <input
                  id="reward"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
                />
              </div>

              <button
                type="submit"
                className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors mt-2"
              >
                Publish Bounty
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <span className="text-xs font-medium text-black/40 uppercase tracking-widest mb-4 block">
            Open Bounties
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BOUNTIES.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

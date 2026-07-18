import { filledSquares, formatRating } from '../lib/ratings'

// Sharp square rating markers per the design system: no stars, no rounding.
// Filled squares use the accent for aggregate ratings and black for
// individual review rows.
export default function RatingSquares({
  average,
  count,
  accent = true,
  size = 10,
}: {
  average: number
  count?: number
  accent?: boolean
  size?: number
}) {
  const filled = filledSquares(average)
  const fillColor = accent ? 'bg-[#0000FF]' : 'bg-black'

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            style={{ width: size, height: size }}
            className={`inline-block border ${
              index < filled ? `${fillColor} ${accent ? 'border-[#0000FF]' : 'border-black'}` : 'border-black/30 bg-white'
            }`}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-black">
        {formatRating(average)}
        {typeof count === 'number' && <span className="text-black/40"> ({count})</span>}
      </span>
    </span>
  )
}

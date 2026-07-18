// Rating helpers, kept pure for unit testing.

export function averageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((total, rating) => total + rating, 0)
  return Math.round((sum / ratings.length) * 100) / 100
}

// How many of the five square markers should be filled for a given average.
export function filledSquares(average: number): number {
  return Math.min(5, Math.max(0, Math.round(average)))
}

export function formatRating(average: number): string {
  return average.toFixed(1)
}

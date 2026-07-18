import { useEffect, useState } from 'react'
import { supabase } from '../backend/supabase'

export interface AssetRating {
  avg_rating: number
  review_count: number
}

// Fetches aggregate ratings for a set of assets in one query against the
// asset_ratings view. Returns a map keyed by asset id.
export function useAssetRatings(assetIds: string[]): Record<string, AssetRating> {
  const [ratings, setRatings] = useState<Record<string, AssetRating>>({})
  const key = assetIds.slice().sort().join(',')

  useEffect(() => {
    if (!key) {
      setRatings({})
      return
    }

    let cancelled = false
    supabase
      .from('asset_ratings')
      .select('*')
      .in('asset_id', key.split(','))
      .then(({ data }) => {
        if (cancelled || !data) return
        const map: Record<string, AssetRating> = {}
        for (const row of data as Array<{ asset_id: string; avg_rating: number; review_count: number }>) {
          map[row.asset_id] = { avg_rating: Number(row.avg_rating), review_count: row.review_count }
        }
        setRatings(map)
      })

    return () => {
      cancelled = true
    }
  }, [key])

  return ratings
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../backend/supabase'

interface WishlistContextValue {
  assetIds: string[]
  isWishlisted: (assetId: string) => boolean
  toggleWishlist: (assetId: string) => Promise<void>
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [assetIds, setAssetIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setAssetIds([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data, error } = await supabase
        .from('wishlists')
        .select('asset_id')
        .eq('user_id', user.id)

      if (!error && data) {
        setAssetIds(data.map((row) => row.asset_id as string))
      }

      setIsLoading(false)
    }

    fetchWishlist()
  }, [user])

  const isWishlisted = (assetId: string) => assetIds.includes(assetId)

  const toggleWishlist = async (assetId: string) => {
    if (!user) return

    if (isWishlisted(assetId)) {
      setAssetIds((prev) => prev.filter((id) => id !== assetId))
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('asset_id', assetId)
    } else {
      setAssetIds((prev) => [...prev, assetId])
      await supabase.from('wishlists').insert([{ user_id: user.id, asset_id: assetId }])
    }
  }

  const value: WishlistContextValue = {
    assetIds,
    isWishlisted,
    toggleWishlist,
    isLoading,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

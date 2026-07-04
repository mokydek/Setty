import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ImageOff } from 'lucide-react'
import { useWishlist } from '../contexts/WishlistContext'
import { supabase } from '../backend/supabase'
import type { Asset } from '../types/database.types'

function WishlistCard({ asset, onRemove }: { asset: Asset; onRemove: (id: string) => void }) {
  const navigate = useNavigate()
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="rounded-none border border-black bg-white p-4 flex flex-col">
      <div
        onClick={() => navigate(`/asset/${asset.id}`)}
        className="rounded-none bg-gray-100 aspect-square flex items-center justify-center mb-4 overflow-hidden cursor-pointer"
      >
        {asset.image_url && !imageFailed ? (
          <img
            src={asset.image_url}
            alt={asset.title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageOff size={32} strokeWidth={1.5} className="text-black/30" />
        )}
      </div>

      <h3 className="text-sm font-bold text-black tracking-tight mb-1">{asset.title}</h3>
      <span className="text-xs text-black/50 mb-4">${asset.price.toFixed(2)}</span>

      <button
        onClick={() => onRemove(asset.id)}
        className="rounded-none border border-black text-black px-3 py-2 flex items-center justify-center gap-2 text-xs font-medium hover:bg-black hover:text-white transition-colors mt-auto"
      >
        <Heart size={14} strokeWidth={1.5} className="fill-current" />
        Remove
      </button>
    </div>
  )
}

export default function Wishlist() {
  const { assetIds, toggleWishlist, isLoading: wishlistLoading } = useWishlist()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAssets = async () => {
      if (wishlistLoading) return

      if (assetIds.length === 0) {
        setAssets([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data, error } = await supabase.from('assets').select('*').in('id', assetIds)

      if (!error && data) {
        setAssets(data as Asset[])
      }

      setIsLoading(false)
    }

    fetchAssets()
  }, [assetIds, wishlistLoading])

  const handleRemove = async (assetId: string) => {
    await toggleWishlist(assetId)
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId))
  }

  return (
    <div className="px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black">Wishlist</h1>
      </div>

      {isLoading || wishlistLoading ? (
        <span className="text-sm font-medium text-black/40">Loading wishlist...</span>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <WishlistCard key={asset.id} asset={asset} onRemove={handleRemove} />
          ))}
        </div>
      ) : (
        <span className="text-sm font-medium text-black">Your wishlist is empty.</span>
      )}
    </div>
  )
}

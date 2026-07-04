import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ImageOff, ShoppingCart, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart, type CartItem } from '../contexts/CartContext'
import { supabase } from '../backend/supabase'

interface Asset extends CartItem {
  description?: string
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const [asset, setAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return
      setIsLoading(true)

      const { data, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !data) {
        setNotFound(true)
      } else {
        setAsset(data as Asset)
      }

      setIsLoading(false)
    }

    fetchAsset()
  }, [id])

  const handleBuy = () => {
    if (!asset) return
    addToCart(asset)
    navigate('/cart')
  }

  const handleFreeDownload = async () => {
    if (!asset) return
    setError(null)
    setMessage(null)

    if (!user) {
      navigate('/auth')
      return
    }

    setIsProcessing(true)

    const { error: insertError } = await supabase.from('purchases').insert([
      {
        user_id: user.id,
        asset_id: asset.id,
      },
    ])

    setIsProcessing(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setMessage('Added to your assets.')
  }

  if (isLoading) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black/40">Loading asset...</span>
      </div>
    )
  }

  if (notFound || !asset) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black">Asset not found.</span>
      </div>
    )
  }

  return (
    <div className="px-8 py-12">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-none border border-black bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
          {asset.image_url ? (
            <img src={asset.image_url} alt={asset.title} className="w-full h-full object-cover" />
          ) : (
            <ImageOff size={48} strokeWidth={1.5} className="text-black/30" />
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-black mb-2">{asset.title}</h1>

          <Link
            to={`/profile/${asset.seller_id}`}
            className="text-sm text-black/60 hover:text-[#0000FF] transition-colors mb-6 w-fit"
          >
            by {asset.author_name}
          </Link>

          <p className="text-sm text-black/60 leading-relaxed mb-8">
            {asset.description || 'No description provided.'}
          </p>

          {message && (
            <div className="rounded-none border border-black bg-white px-4 py-3 mb-6">
              <span className="text-sm font-medium text-black">{message}</span>
            </div>
          )}

          {error && (
            <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6">
              <span className="text-sm font-medium text-red-600">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <span className="text-2xl font-bold tracking-tight text-black">
              {asset.price > 0 ? `$${asset.price.toFixed(2)}` : 'Free'}
            </span>

            {asset.price > 0 ? (
              <button
                onClick={handleBuy}
                className="rounded-none bg-[#0000FF] text-white px-6 py-3 flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors"
              >
                <ShoppingCart size={16} strokeWidth={1.5} />
                Buy
              </button>
            ) : (
              <button
                onClick={handleFreeDownload}
                disabled={isProcessing}
                className="rounded-none bg-[#0000FF] text-white px-6 py-3 flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
              >
                <Download size={16} strokeWidth={1.5} />
                {isProcessing ? 'Please wait...' : 'Download'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

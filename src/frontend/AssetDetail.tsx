import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ImageOff, ShoppingCart, Download, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../backend/supabase'
import { getSignedAssetFileUrl, triggerDownload } from '../lib/assetFiles'
import { PAYMENTS_ENABLED, createCheckout, rememberPendingCheckout } from '../lib/payments'
import { formatFileSize, resolveAssetAction } from '../lib/assetAccess'
import { averageRating } from '../lib/ratings'
import RatingSquares from '../components/RatingSquares'
import type { Asset, Review } from '../types/database.types'

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [asset, setAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [alreadyOwned, setAlreadyOwned] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const fetchReviews = async (assetId: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false })
    setReviews((data as Review[]) ?? [])
  }

  useEffect(() => {
    if (id) fetchReviews(id)
  }, [id])

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

  useEffect(() => {
    const checkOwnership = async () => {
      if (!id || !user) {
        setAlreadyOwned(false)
        return
      }

      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('asset_id', id)
        .maybeSingle()

      setAlreadyOwned(!!data)
    }

    checkOwnership()
  }, [id, user])

  const isOwnListing = !!user && !!asset && user.id === asset.seller_id
  const action = asset
    ? resolveAssetAction({ isOwnListing, alreadyOwned, price: asset.price })
    : null
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!asset?.file_path) return
    setError(null)
    setIsDownloading(true)

    const { url, error: signError } = await getSignedAssetFileUrl(asset.file_path)
    setIsDownloading(false)

    if (!url) {
      setError(signError ?? t('assetFile.downloadFailed'))
      return
    }

    triggerDownload(url, asset.file_path.split('/').pop() ?? asset.title)
  }

  const myReview = user ? reviews.find((review) => review.user_id === user.id) : undefined
  const avg = averageRating(reviews.map((review) => review.rating))

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !asset) return

    setReviewError(null)
    setIsSubmittingReview(true)

    const { error: reviewInsertError } = myReview
      ? await supabase
          .from('reviews')
          .update({ rating: reviewRating, text: reviewText })
          .eq('id', myReview.id)
      : await supabase.from('reviews').insert([
          { asset_id: asset.id, user_id: user.id, rating: reviewRating, text: reviewText },
        ])

    setIsSubmittingReview(false)

    if (reviewInsertError) {
      setReviewError(reviewInsertError.message)
      return
    }

    setReviewText('')
    await fetchReviews(asset.id)
  }

  const handleBuy = async () => {
    if (!asset) return

    if (!PAYMENTS_ENABLED) {
      addToCart(asset)
      navigate('/cart')
      return
    }

    if (!user) {
      navigate('/auth')
      return
    }

    setError(null)
    setIsProcessing(true)

    const { url, error: checkoutError } = await createCheckout([asset.id])
    setIsProcessing(false)

    if (!url) {
      setError(checkoutError ?? 'Checkout could not be created.')
      return
    }

    rememberPendingCheckout([asset.id])
    window.location.href = url
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

    setAlreadyOwned(true)
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
          {asset.image_url && !imageFailed ? (
            <img
              src={asset.image_url}
              alt={asset.title}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageOff size={48} strokeWidth={1.5} className="text-black/30" />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-black">{asset.title}</h1>
            {user && (
              <button
                onClick={() => toggleWishlist(asset.id)}
                aria-label={isWishlisted(asset.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                className="shrink-0 p-2 border border-black text-black hover:text-[#0000FF] transition-colors"
              >
                <Heart
                  size={18}
                  strokeWidth={1.5}
                  className={isWishlisted(asset.id) ? 'fill-[#0000FF] text-[#0000FF]' : ''}
                />
              </button>
            )}
          </div>

          <Link
            to={`/profile/${asset.seller_id}`}
            className="text-sm text-black/60 hover:text-[#0000FF] transition-colors mb-6 w-fit"
          >
            by {asset.author_name}
          </Link>

          <p className="text-sm text-black/60 leading-relaxed mb-4">
            {asset.description || 'No description provided.'}
          </p>

          {asset.file_path && (
            <div className="flex items-center gap-4 mb-8 text-xs text-black/60">
              {asset.file_format && (
                <span className="border border-black px-2 py-1 font-medium uppercase tracking-widest">
                  {asset.file_format}
                </span>
              )}
              {typeof asset.file_size_bytes === 'number' && (
                <span>
                  {t('assetFile.size')}: {formatFileSize(asset.file_size_bytes)}
                </span>
              )}
            </div>
          )}

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
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold tracking-tight text-black">
                {asset.price > 0 ? `$${asset.price.toFixed(2)}` : 'Free'}
              </span>
              {reviews.length > 0 && <RatingSquares average={avg} count={reviews.length} />}
            </div>

            {action === 'ownListing' ? (
              <span className="text-sm font-medium text-black/40">This is your own listing</span>
            ) : action === 'download' ? (
              asset.file_path ? (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="rounded-none bg-[#0000FF] text-white px-6 py-3 flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
                >
                  <Download size={16} strokeWidth={1.5} />
                  {isDownloading ? t('assetFile.preparing') : t('assetFile.download')}
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="rounded-none border border-black text-black px-6 py-3 text-sm font-semibold hover:bg-black hover:text-white transition-colors"
                >
                  Already owned
                </Link>
              )
            ) : action === 'buy' ? (
              <button
                onClick={handleBuy}
                disabled={isProcessing}
                className="rounded-none bg-[#0000FF] text-white px-6 py-3 flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={16} strokeWidth={1.5} />
                {isProcessing ? 'Please wait...' : 'Buy'}
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

      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-xl font-bold tracking-tight text-black mb-6">
          {t('reviews.title')}
          {reviews.length > 0 && (
            <span className="text-black/40 font-medium text-sm ml-3">
              {reviews.length} {t('reviews.count')}
            </span>
          )}
        </h2>

        {alreadyOwned && !isOwnListing && (
          <form onSubmit={handleSubmitReview} className="border border-black p-6 mb-8 flex flex-col gap-4 max-w-xl">
            <span className="text-sm font-bold text-black">
              {myReview ? t('reviews.editYours') : t('reviews.writeOne')}
            </span>

            <div className="flex items-center gap-1" role="radiogroup" aria-label={t('reviews.rating')}>
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={reviewRating === value}
                    aria-label={`${value}`}
                    onClick={() => setReviewRating(value)}
                    className={`h-6 w-6 border transition-colors ${
                      value <= reviewRating ? 'bg-black border-black' : 'bg-white border-black/30 hover:border-black'
                    }`}
                  />
                )
              })}
              <span className="text-sm font-medium text-black ml-2">{reviewRating}/5</span>
            </div>

            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t('reviews.placeholder')}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#0000FF] resize-none"
            />

            {reviewError && <span className="text-sm text-red-600">{reviewError}</span>}

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors w-fit disabled:opacity-50"
            >
              {isSubmittingReview ? t('auth.pleaseWait') : t('reviews.submit')}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <span className="text-sm text-black/40">{t('reviews.empty')}</span>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-black/20 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <RatingSquares average={review.rating} accent={false} />
                  <span className="text-xs text-black/40">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.text && (
                  <p className="text-sm text-black/70 leading-relaxed">{review.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

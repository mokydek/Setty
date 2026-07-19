import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../backend/supabase'
import { PAYMENTS_ENABLED, createCheckout, rememberPendingCheckout } from '../lib/payments'
import { track } from '../lib/analytics'

export default function Cart() {
  const { items, removeFromCart, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setError(null)

    if (!user) {
      setError('You must be signed in to check out.')
      return
    }

    if (items.length === 0) {
      return
    }

    setIsCheckingOut(true)
    track({ name: 'checkout_started', props: { asset_count: items.length, value: cartTotal } })

    if (PAYMENTS_ENABLED) {
      // Real payments: server-side prices, Lemon Squeezy hosted checkout.
      const assetIds = items.map((item) => item.id)
      const { url, error: checkoutError } = await createCheckout(assetIds)

      if (!url) {
        setIsCheckingOut(false)
        setError(checkoutError ?? 'Checkout could not be created.')
        return
      }

      rememberPendingCheckout(assetIds, cartTotal)
      window.location.href = url
      return
    }

    // Legacy dev-only path (VITE_PAYMENTS_ENABLED=false): free insert.
    const results = await Promise.all(
      items.map(async (item) => {
        const { error: insertError } = await supabase
          .from('purchases')
          .insert([{ user_id: user.id, asset_id: item.id }])

        return { item, error: insertError }
      }),
    )

    setIsCheckingOut(false)

    const failed = results.filter((result) => result.error)
    const succeeded = results.filter((result) => !result.error)

    succeeded.forEach((result) => removeFromCart(result.item.id))

    if (failed.length === 0) {
      navigate('/dashboard')
      return
    }

    if (succeeded.length === 0) {
      setError(`Checkout failed: ${failed[0].error?.message}`)
      return
    }

    setError(
      `${succeeded.length} of ${results.length} items purchased. These items failed and remain in your cart: ${failed
        .map((result) => result.item.title)
        .join(', ')}.`,
    )
  }

  return (
    <div className="px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black">Cart</h1>
      </div>

      {error && (
        <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6 max-w-2xl">
          <span className="text-sm font-medium text-red-600">{error}</span>
        </div>
      )}

      {items.length === 0 ? (
        <span className="text-sm font-medium text-black">Your cart is empty.</span>
      ) : (
        <div className="max-w-2xl">
          <div className="flex flex-col gap-4 mb-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-none border border-black bg-white p-6 flex items-center justify-between gap-4"
              >
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-black tracking-tight mb-1">{item.title}</h3>
                  <span className="text-xs text-black/50">{item.author_name}</span>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-sm font-semibold text-black">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm font-medium text-black/50 hover:text-black transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-black pt-6 flex items-center justify-between mb-8">
            <span className="text-sm font-medium text-black/60 uppercase tracking-widest">Total</span>
            <span className="text-2xl font-bold tracking-tight text-black">${cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="rounded-none bg-[#0000FF] text-white px-8 py-4 text-sm font-semibold hover:bg-black transition-colors w-full sm:w-auto disabled:opacity-50"
          >
            {isCheckingOut ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../backend/supabase'

export default function Cart() {
  const { items, removeFromCart, clearCart, cartTotal } = useCart()
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

    const { error: insertError } = await supabase.from('purchases').insert(
      items.map((item) => ({
        user_id: user.id,
        asset_id: item.id,
      })),
    )

    setIsCheckingOut(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    clearCart()
    navigate('/dashboard')
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
                  <span className="text-xs text-black/50">{item.author}</span>
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

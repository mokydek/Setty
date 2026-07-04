import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface CartItem {
  id: string
  title: string
  author_name: string
  price: number
  style: string
  image_url: string
  seller_id: string
}

interface CartContextValue {
  items: CartItem[]
  addToCart: (asset: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  cartTotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (asset: CartItem) => {
    setItems((prev) => (prev.some((item) => item.id === asset.id) ? prev : [...prev, asset]))
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  const cartTotal = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items])

  const value: CartContextValue = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

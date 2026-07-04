import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Asset } from '../types/database.types'

export type CartItem = Asset

interface CartContextValue {
  items: CartItem[]
  addToCart: (asset: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  cartTotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'setty-cart'

function loadStoredItems(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadStoredItems)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

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

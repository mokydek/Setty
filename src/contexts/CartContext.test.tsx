import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CartProvider, useCart, type CartItem } from './CartContext'

const mockAsset: CartItem = {
  id: 'asset-1',
  title: 'Voxel Forest Pack',
  author_name: 'Mira Voss',
  price: 4.99,
  style: 'lowPoly',
  image_url: '',
  seller_id: 'seller-1',
}

function TestHarness() {
  const { items, addToCart, removeFromCart, cartTotal } = useCart()

  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <span data-testid="total">{cartTotal.toFixed(2)}</span>
      <button onClick={() => addToCart(mockAsset)}>Add</button>
      <button onClick={() => removeFromCart(mockAsset.id)}>Remove</button>
    </div>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adds an item once and computes the total', () => {
    render(
      <CartProvider>
        <TestHarness />
      </CartProvider>,
    )

    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getByText('Add'))

    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('total')).toHaveTextContent('4.99')
  })

  it('removes an item from the cart', () => {
    render(
      <CartProvider>
        <TestHarness />
      </CartProvider>,
    )

    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getByText('Remove'))

    expect(screen.getByTestId('count')).toHaveTextContent('0')
    expect(screen.getByTestId('total')).toHaveTextContent('0.00')
  })
})

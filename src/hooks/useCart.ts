import { createContext, useContext } from 'react'
import type { CartItem, CartState } from '../types/cart'
import type { Product } from '../types/product'

export type CartContextValue = {
  state: CartState
  items: CartItem[]
  totalUnits: number
  subtotal: number
  notification: CartAddNotification | null
  addItem: (product: Product, quantity?: number) => Promise<boolean>
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  dismissNotification: (id: number) => void
}

export type CartAddNotification = {
  id: number
  product: Product
  quantity: number
  operationSubtotalCents: number
  totalUnits: number
  cartSubtotalCents: number
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider.')
  }

  return context
}

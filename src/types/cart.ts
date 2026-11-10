import type { Product } from './product'

export type CartItem = {
  product: Product
  quantity: number
}

export type CartState = {
  items: CartItem[]
}

export type CartAction =
  | {
      type: 'ADD_ITEM'
      product: Product
      quantity?: number
    }
  | {
      type: 'UPDATE_QUANTITY'
      id: string
      quantity: number
    }
  | {
      type: 'REMOVE_ITEM'
      id: string
    }
  | {
      type: 'CLEAR_CART'
    }

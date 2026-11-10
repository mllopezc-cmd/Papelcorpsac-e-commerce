import type { CartAction, CartState } from '../types/cart'
import type { Product } from '../types/product'

function isValidProductId(id: unknown): id is string {
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    id.trim() === id &&
    !id.includes('/')
  )
}

function isValidPrice(price: unknown): price is number {
  return (
    typeof price === 'number' &&
    Number.isFinite(price) &&
    Number.isFinite(price * 100) &&
    price >= 0 &&
    Math.abs(price * 100 - Math.round(price * 100)) <= 1e-8
  )
}

function isValidStock(stock: unknown): stock is number {
  return (
    typeof stock === 'number' &&
    Number.isFinite(stock) &&
    Number.isSafeInteger(stock) &&
    stock > 0
  )
}

function isValidQuantity(quantity: unknown): quantity is number {
  return (
    typeof quantity === 'number' &&
    Number.isFinite(quantity) &&
    Number.isSafeInteger(quantity) &&
    quantity > 0
  )
}

function isAddableProduct(
  product: Product,
): product is Product & { stock: number } {
  return (
    product !== null &&
    typeof product === 'object' &&
    isValidProductId(product.id) &&
    isValidPrice(product.price) &&
    isValidStock(product.stock)
  )
}

export function cartReducer(
  state: CartState,
  action: CartAction,
): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product } = action
      const quantity = action.quantity === undefined ? 1 : action.quantity

      if (
        !isAddableProduct(product) ||
        !isValidQuantity(quantity) ||
        quantity > product.stock
      ) {
        return state
      }

      const existingItem = state.items.find(
        (item) => item.product.id === product.id,
      )

      if (existingItem) {
        const nextQuantity = existingItem.quantity + quantity
        if (
          !isValidQuantity(existingItem.quantity) ||
          nextQuantity > product.stock
        ) {
          return state
        }

        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { product, quantity: nextQuantity }
              : item,
          ),
        }
      }

      return {
        ...state,
        items: [...state.items, { product, quantity }],
      }
    }

    case 'UPDATE_QUANTITY': {
      if (!isValidProductId(action.id) || !isValidQuantity(action.quantity)) {
        return state
      }

      const existingItem = state.items.find(
        (item) => item.product.id === action.id,
      )
      if (
        !existingItem ||
        !isValidStock(existingItem.product.stock) ||
        action.quantity > existingItem.product.stock
      ) {
        return state
      }

      if (existingItem.quantity === action.quantity) {
        return state
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.id
            ? { ...item, quantity: action.quantity }
            : item,
        ),
      }
    }

    case 'REMOVE_ITEM': {
      if (!isValidProductId(action.id)) {
        return state
      }

      const items = state.items.filter(
        (item) => item.product.id !== action.id,
      )
      return items.length === state.items.length ? state : { ...state, items }
    }

    case 'CLEAR_CART':
      return state.items.length === 0 ? state : { ...state, items: [] }

    default:
      return state
  }
}

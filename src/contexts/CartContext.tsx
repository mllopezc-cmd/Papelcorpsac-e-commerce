import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { cartReducer } from '../reducers/cartReducer'
import type {
  CartAction,
  CartSnapshotItem,
  CartState,
} from '../types/cart'
import type { Product } from '../types/product'
import { readCartState, writeCartState } from '../utils/cartStorage'
import {
  CartContext,
  type CartAddNotification,
} from '../hooks/useCart'

type CartProviderProps = {
  children: ReactNode
}

type AddItemResult = {
  requestId: number
  accepted: boolean
}

type CartContextState = {
  cart: CartState
  notification: CartAddNotification | null
  addItemResults: AddItemResult[]
}

type CartContextAction =
  | {
      type: 'ADD_ITEM'
      requestId: number
      product: Product
      quantity?: number
      acknowledgedThrough: number
    }
  | {
      type: 'DISPATCH'
      action: Exclude<CartAction, { type: 'ADD_ITEM' }>
      acknowledgedThrough: number
    }
  | ({
      type: 'DISMISS_NOTIFICATION'
      id: number
    } & {
      acknowledgedThrough: number
    })

function getTotalUnits(items: CartState['items']): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

function getSubtotalCents(items: CartState['items']): number {
  return items.reduce(
    (total, item) =>
      total + Math.round(item.product.price * 100) * item.quantity,
    0,
  )
}

function cartContextReducer(
  state: CartContextState,
  action: CartContextAction,
): CartContextState {
  const pendingResults = state.addItemResults.filter(
    (result) => result.requestId > action.acknowledgedThrough,
  )

  const currentState =
    pendingResults.length === state.addItemResults.length
      ? state
      : { ...state, addItemResults: pendingResults }

  if (action.type === 'DISMISS_NOTIFICATION') {
    return currentState.notification?.id === action.id
      ? { ...currentState, notification: null }
      : currentState
  }

  const cartAction: CartAction =
    action.type === 'ADD_ITEM'
      ? action.quantity === undefined
        ? { type: 'ADD_ITEM', product: action.product }
        : {
            type: 'ADD_ITEM',
            product: action.product,
            quantity: action.quantity,
          }
      : action.action

  const cart = cartReducer(currentState.cart, cartAction)

  if (action.type !== 'ADD_ITEM') {
    return cart === currentState.cart
      ? currentState
      : { ...currentState, cart }
  }

  const accepted = cart !== currentState.cart

  if (!accepted) {
    return {
      ...currentState,
      addItemResults: [
        ...currentState.addItemResults,
        { requestId: action.requestId, accepted: false },
      ],
    }
  }

  const quantity = action.quantity ?? 1

  const notification: CartAddNotification = {
    id: action.requestId,
    product: action.product,
    quantity,
    operationSubtotalCents:
      Math.round(action.product.price * 100) * quantity,
    totalUnits: getTotalUnits(cart.items),
    cartSubtotalCents: getSubtotalCents(cart.items),
  }

  return {
    ...currentState,
    cart,
    notification,
    addItemResults: [
      ...currentState.addItemResults,
      { requestId: action.requestId, accepted: true },
    ],
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [contextState, dispatch] = useReducer(
    cartContextReducer,
    undefined,
    (): CartContextState => ({
      cart: readCartState(),
      notification: null,
      addItemResults: [],
    }),
  )

  const nextRequestId = useRef(0)
  const acknowledgedAddItemId = useRef(0)
  const lifecycleGeneration = useRef(0)
  const addItemResolvers = useRef(
    new Map<number, (accepted: boolean) => void>(),
  )

  const { cart: state } = contextState

  useEffect(() => {
    writeCartState(state)
  }, [state])

  useEffect(() => {
    const generation = lifecycleGeneration.current + 1
    lifecycleGeneration.current = generation
    const resolvers = addItemResolvers.current

    return () => {
      void Promise.resolve().then(() => {
        if (lifecycleGeneration.current !== generation) {
          return
        }

        for (const resolve of resolvers.values()) {
          resolve(false)
        }

        resolvers.clear()
      })
    }
  }, [])

  useEffect(() => {
    if (contextState.addItemResults.length === 0) {
      return
    }

    for (const result of contextState.addItemResults) {
      if (result.requestId <= acknowledgedAddItemId.current) {
        continue
      }

      const resolve = addItemResolvers.current.get(result.requestId)

      if (resolve) {
        resolve(result.accepted)
        addItemResolvers.current.delete(result.requestId)
      }

      acknowledgedAddItemId.current = result.requestId
    }
  }, [contextState.addItemResults])

  const addItem = useCallback(
    (product: Product, quantity?: number) =>
      new Promise<boolean>((resolve) => {
        const requestId = nextRequestId.current + 1
        nextRequestId.current = requestId
        addItemResolvers.current.set(requestId, resolve)

        dispatch(
          quantity === undefined
            ? {
                type: 'ADD_ITEM',
                requestId,
                product,
                acknowledgedThrough: acknowledgedAddItemId.current,
              }
            : {
                type: 'ADD_ITEM',
                requestId,
                product,
                quantity,
                acknowledgedThrough: acknowledgedAddItemId.current,
              },
        )
      }),
    [dispatch],
  )

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch({
        type: 'DISPATCH',
        action: { type: 'UPDATE_QUANTITY', id, quantity },
        acknowledgedThrough: acknowledgedAddItemId.current,
      })
    },
    [dispatch],
  )

  const removeItem = useCallback(
    (id: string) => {
      dispatch({
        type: 'DISPATCH',
        action: { type: 'REMOVE_ITEM', id },
        acknowledgedThrough: acknowledgedAddItemId.current,
      })
    },
    [dispatch],
  )

  const clearCart = useCallback(() => {
    dispatch({
      type: 'DISPATCH',
      action: { type: 'CLEAR_CART' },
      acknowledgedThrough: acknowledgedAddItemId.current,
    })
  }, [dispatch])

  const clearCartIfUnchanged = useCallback(
    (items: CartSnapshotItem[]) => {
      dispatch({
        type: 'DISPATCH',
        action: { type: 'CLEAR_CART_IF_UNCHANGED', items },
        acknowledgedThrough: acknowledgedAddItemId.current,
      })
    },
    [dispatch],
  )

  const dismissNotification = useCallback((id: number) => {
    dispatch({
      type: 'DISMISS_NOTIFICATION',
      id,
      acknowledgedThrough: acknowledgedAddItemId.current,
    })
  }, [])

  const totalUnits = useMemo(
    () => getTotalUnits(state.items),
    [state.items],
  )

  const subtotal = useMemo(
    () => getSubtotalCents(state.items) / 100,
    [state.items],
  )

  const value = useMemo(
    () => ({
      state,
      items: state.items,
      totalUnits,
      subtotal,
      notification: contextState.notification,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      clearCartIfUnchanged,
      dismissNotification,
    }),
    [
      state,
      totalUnits,
      subtotal,
      contextState.notification,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      clearCartIfUnchanged,
      dismissNotification,
    ],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

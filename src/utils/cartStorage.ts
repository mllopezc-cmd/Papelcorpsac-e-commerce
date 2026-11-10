import {
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
} from '../types/product'
import type { CartItem, CartState } from '../types/cart'

const STORAGE_KEY = 'papelcorpsac:cart:v1'
const STORAGE_VERSION = 1
const PRODUCT_KEYS = [
  'id',
  'name',
  'description',
  'category',
  'price',
  'imageUrl',
  'published',
  'brand',
  'stock',
]
const EMPTY_CART_STATE: CartState = { items: [] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  return Object.keys(value).every((key) => allowedKeys.includes(key))
}

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

function isProductCategory(category: unknown): category is ProductCategory {
  return PRODUCT_CATEGORIES.some((validCategory) => validCategory === category)
}

function parseCartItem(value: unknown): CartItem | null {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ['product', 'quantity']) ||
    !isValidQuantity(value.quantity) ||
    !isRecord(value.product) ||
    !hasOnlyKeys(value.product, PRODUCT_KEYS)
  ) {
    return null
  }

  const product = value.product
  if (
    !isValidProductId(product.id) ||
    typeof product.name !== 'string' ||
    typeof product.description !== 'string' ||
    !isProductCategory(product.category) ||
    !isValidPrice(product.price) ||
    (product.imageUrl !== undefined &&
      typeof product.imageUrl !== 'string') ||
    typeof product.published !== 'boolean' ||
    typeof product.brand !== 'string' ||
    !isValidStock(product.stock) ||
    value.quantity > product.stock
  ) {
    return null
  }

  const savedProduct: Product = {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    published: product.published,
    brand: product.brand,
    stock: product.stock,
    ...(product.imageUrl === undefined ? {} : { imageUrl: product.imageUrl }),
  }

  return { product: savedProduct, quantity: value.quantity }
}

function normalizeCartItem(value: unknown): unknown {
  if (!isRecord(value) || !isRecord(value.product)) {
    return value
  }

  const product = value.product

  return {
    quantity: value.quantity,
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      ...(product.imageUrl === undefined
        ? {}
        : { imageUrl: product.imageUrl }),
      published: product.published,
      brand: product.brand,
      stock: product.stock,
    },
  }
}

function parseCartItems(value: unknown): {
  items: CartItem[]
  rejectedCount: number
} | null {
  if (!Array.isArray(value)) {
    return null
  }

  const items: CartItem[] = []
  const productIds = new Set<string>()
  let rejectedCount = 0

  for (const valueItem of value) {
    const item = parseCartItem(valueItem)
    if (!item || productIds.has(item.product.id)) {
      rejectedCount += 1
      continue
    }

    productIds.add(item.product.id)
    items.push(item)
  }

  return { items, rejectedCount }
}

export function readCartState(): CartState {
  try {
    if (typeof window === 'undefined') {
      return EMPTY_CART_STATE
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (storedValue === null) {
      return EMPTY_CART_STATE
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (
      !isRecord(parsedValue) ||
      !hasOnlyKeys(parsedValue, ['version', 'items']) ||
      parsedValue.version !== STORAGE_VERSION
    ) {
      console.warn(
        'El carrito guardado tiene un esquema inválido; se iniciará vacío.',
      )
      return EMPTY_CART_STATE
    }

    const parsedItems = parseCartItems(parsedValue.items)
    if (!parsedItems) {
      console.warn(
        'Los elementos guardados del carrito no tienen un formato válido.',
      )
      return EMPTY_CART_STATE
    }

    if (parsedItems.rejectedCount > 0) {
      console.warn(
        `Se descartaron ${parsedItems.rejectedCount} elemento(s) inválido(s) del carrito guardado.`,
      )
    }

    return { items: parsedItems.items }
  } catch (error) {
    console.warn('No se pudo recuperar el carrito de localStorage.', error)
    return EMPTY_CART_STATE
  }
}

export function writeCartState(state: CartState): void {
  try {
    if (typeof window === 'undefined') {
      return
    }

    const normalizedItems = state.items.map(normalizeCartItem)
    const parsedItems = parseCartItems(normalizedItems)
    if (!parsedItems) {
      console.warn('No se guardó el carrito porque sus elementos son inválidos.')
      return
    }

    if (parsedItems.rejectedCount > 0) {
      console.warn(
        `Se omitieron ${parsedItems.rejectedCount} elemento(s) inválido(s) al guardar el carrito.`,
      )
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items: parsedItems.items,
      }),
    )
  } catch (error) {
    console.warn('No se pudo guardar el carrito en localStorage.', error)
  }
}

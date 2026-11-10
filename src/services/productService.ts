import { loadFirestore } from '../lib/firebase'
import {
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
} from '../types/product'

type ProductData = Omit<Product, 'id' | 'brand' | 'stock' | 'sourceUrl'> & {
  brand?: string
  stock?: number
  sourceUrl?: string
}

let publishedProductsRequest: Promise<Product[]> | undefined

function isProductCategory(value: unknown): value is ProductCategory {
  return PRODUCT_CATEGORIES.some((category) => category === value)
}

function isValidPrice(value: unknown, requireCents: boolean): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    (!requireCents ||
      Math.abs(value * 100 - Math.round(value * 100)) <= 1e-8)
  )
}

function isValidProductUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false
  }

  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      url.hostname.length > 0 &&
      url.username.length === 0 &&
      url.password.length === 0
    )
  } catch {
    return false
  }
}

function isValidImageUrl(value: unknown): value is string {
  return (
    value === '/images/product-placeholder.svg' ||
    isValidProductUrl(value)
  )
}

function isProductData(value: unknown): value is ProductData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const product = value as Record<string, unknown>
  const hasBrand = product.brand !== undefined
  const hasStock = product.stock !== undefined
  const hasSourceUrl = Object.prototype.hasOwnProperty.call(
    product,
    'sourceUrl',
  )
  const hasProductMetadata = hasBrand || hasStock || hasSourceUrl
  const productMetadataIsValid =
    hasBrand === hasStock &&
    (!hasBrand ||
      (typeof product.brand === 'string' &&
        product.brand.trim().length > 0 &&
        typeof product.stock === 'number' &&
        Number.isInteger(product.stock) &&
        product.stock >= 0))
  const sourceUrlIsValid =
    !hasSourceUrl || isValidProductUrl(product.sourceUrl)

  return (
    typeof product.name === 'string' &&
    product.name.trim().length > 0 &&
    typeof product.description === 'string' &&
    product.description.trim().length > 0 &&
    isProductCategory(product.category) &&
    isValidPrice(product.price, hasProductMetadata) &&
    (product.imageUrl === undefined || isValidImageUrl(product.imageUrl)) &&
    productMetadataIsValid &&
    sourceUrlIsValid &&
    typeof product.published === 'boolean'
  )
}

function toProduct(id: string, value: unknown): Product {
  if (!isProductData(value)) {
    throw new Error(`El producto "${id}" tiene datos inválidos.`)
  }

  const { name, description, category, price, imageUrl, published } = value
  const product = {
    id,
    name,
    description,
    category,
    price,
    ...(imageUrl === undefined ? {} : { imageUrl }),
    published,
  }

  if (typeof value.brand === 'string' && typeof value.stock === 'number') {
    const productWithInventory = {
      ...product,
      brand: value.brand,
      stock: value.stock,
    }

    if (typeof value.sourceUrl === 'string') {
      return { ...productWithInventory, sourceUrl: value.sourceUrl }
    }

    return productWithInventory
  }

  if (typeof value.sourceUrl === 'string') {
    return {
      ...product,
      sourceUrl: value.sourceUrl,
    }
  }

  return product
}

async function fetchPublishedProducts(): Promise<Product[]> {
  const { db, firestore } = await loadFirestore()
  const productsQuery = firestore.query(
    firestore.collection(db, 'products'),
    firestore.where('published', '==', true),
  )
  const snapshot = await firestore.getDocs(productsQuery)

  return snapshot.docs
    .map((document) => toProduct(document.id, document.data()))
    .filter((product) => product.published)
}

export function getPublishedProducts(): Promise<Product[]> {
  if (!publishedProductsRequest) {
    publishedProductsRequest = fetchPublishedProducts().finally(() => {
      publishedProductsRequest = undefined
    })
  }

  return publishedProductsRequest
}

export async function getPublishedProductById(
  id: string,
): Promise<Product | null> {
  const { db, firestore } = await loadFirestore()
  const document = await firestore.getDoc(firestore.doc(db, 'products', id))

  if (!document.exists()) {
    return null
  }

  const product = toProduct(document.id, document.data())
  return product.published ? product : null
}

export const PRODUCT_CATEGORIES = [
  'writing-instruments',
  'stationery',
  'office-supplies',
  'desk-accessories',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  'writing-instruments': 'Instrumentos de escritura',
  stationery: 'Papelería',
  'office-supplies': 'Artículos de oficina',
  'desk-accessories': 'Accesorios de escritorio',
}

type ProductFields = {
  id: string
  name: string
  description: string
  category: ProductCategory
  price: number
  imageUrl?: string
  published: boolean
}

export type Product = ProductFields &
  (
    | {
        brand?: undefined
        stock?: undefined
        sourceUrl?: string
      }
    | {
        brand: string
        stock: number
        sourceUrl?: string
      }
  )

/**
 * Datos necesarios para crear o actualizar un producto desde
 * el panel administrativo.
 *
 * Se requiere marca y stock porque ambos forman parte
 * de los productos comerciales utilizados por el checkout.
 *
 * La imagen puede omitirse durante T10.3. En ese caso,
 * se utilizará la imagen demostrativa local.
 */
export type ProductInput = Omit<ProductFields, 'id'> & {
  brand: string
  stock: number
  sourceUrl?: string
}

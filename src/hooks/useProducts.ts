import { useEffect, useState } from 'react'
import { getPublishedProducts } from '../services/productService'
import type { Product } from '../types/product'

type UseProductsResult = {
  products: Product[]
  loading: boolean
  error: Error | null
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true

    void getPublishedProducts()
      .then((loadedProducts) => {
        if (active) {
          setProducts(loadedProducts)
          setLoading(false)
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause
              : new Error('Ocurrió un error inesperado al cargar el catálogo.'),
          )
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return { products, loading, error }
}

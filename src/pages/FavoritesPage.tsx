import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../hooks/useAuth'
import { useFavorites } from '../hooks/useFavorites'
import {
  getFavoriteErrorMessage,
} from '../services/favoriteService'
import { getPublishedProductById } from '../services/productService'
import type { Product } from '../types/product'

type ProductLookupState = {
  uid: string | null
  favoriteIdsKey: string
  products: Product[]
  unavailableIds: string[]
  failedIds: string[]
}

const initialProductLookupState: ProductLookupState = {
  uid: null,
  favoriteIdsKey: '',
  products: [],
  unavailableIds: [],
  failedIds: [],
}

export function FavoritesPage() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const {
    favorites,
    loading,
    error,
    pendingProductIds,
    removeFavorite,
  } = useFavorites()
  const [productLookup, setProductLookup] = useState(initialProductLookupState)
  const favoriteIdsKey = JSON.stringify([...favorites].sort())

  useEffect(() => {
    if (!uid || loading) {
      return
    }

    let active = true
    const parsedFavoriteIds: unknown = JSON.parse(favoriteIdsKey)
    const productIds = Array.isArray(parsedFavoriteIds)
      ? parsedFavoriteIds.filter(
          (productId): productId is string => typeof productId === 'string',
        )
      : []

    void Promise.allSettled(
      productIds.map((productId) => getPublishedProductById(productId)),
    ).then((results) => {
      if (!active) {
        return
      }

      const products: Product[] = []
      const unavailableIds: string[] = []
      const failedIds: string[] = []

      results.forEach((result, index) => {
        const productId = productIds[index]

        if (result.status === 'rejected') {
          failedIds.push(productId)
        } else if (result.value) {
          products.push(result.value)
        } else {
          unavailableIds.push(productId)
        }
      })

      setProductLookup({
        uid,
        favoriteIdsKey,
        products,
        unavailableIds,
        failedIds,
      })
    })

    return () => {
      active = false
    }
  }, [favoriteIdsKey, loading, uid])

  const productLookupLoading =
    loading ||
    productLookup.uid !== uid ||
    productLookup.favoriteIdsKey !== favoriteIdsKey
  const productById = new Map(
    productLookup.products.map((product) => [product.id, product]),
  )

  return (
    <section
      aria-labelledby="favorites-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>
      <h1
        id="favorites-title"
        className="font-display text-3xl font-medium text-ink sm:text-5xl"
      >
        Mis favoritos
      </h1>

      {error && (
        <p role="alert" className="mt-6 border border-line bg-surface p-4 text-sm leading-7 text-ink">
          {getFavoriteErrorMessage(error)}
        </p>
      )}

      <div
        aria-busy={productLookupLoading}
        className="mt-8 rounded-sm border border-line bg-surface p-6 sm:p-10"
      >
        {loading ? (
          <p role="status" aria-live="polite" className="leading-7 text-muted">
            Cargando tus favoritos…
          </p>
        ) : error && favorites.length === 0 ? null : productLookupLoading ? (
          <p role="status" aria-live="polite" className="leading-7 text-muted">
            Cargando los productos guardados…
          </p>
        ) : favorites.length === 0 ? (
          <div>
            <p role="status" className="leading-7 text-muted">
              Aún no tienes productos favoritos.
            </p>
            <Link
              to="/catalogo"
              className="mt-4 inline-flex rounded-sm font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
            >
              Explorar el catálogo
            </Link>
          </div>
        ) : (
          <ul
            aria-label="Mis productos favoritos"
            className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            {favorites.map((productId) => {
              const product = productById.get(productId)
              const pending = pendingProductIds.includes(productId)
              const unavailable =
                productLookup.unavailableIds.includes(productId)
              const failed = productLookup.failedIds.includes(productId)

              return (
                <li key={productId}>
                  {product ? (
                    <ProductCard
                      product={product}
                      isFavorite
                      favoritePending={pending}
                      onToggleFavorite={(id) => void removeFavorite(id)}
                    />
                  ) : (
                    <article className="flex h-full flex-col justify-between rounded-sm border border-line bg-page p-5">
                      <div>
                        <h2 className="font-display text-lg font-medium text-ink">
                          Producto no disponible
                        </h2>
                        <p role={failed ? 'alert' : 'status'} className="mt-3 leading-7 text-muted">
                          {failed
                            ? 'No fue posible consultar este producto. Puede que ya no esté publicado.'
                            : unavailable
                              ? 'Este producto fue eliminado o dejó de estar publicado.'
                              : 'Verificando la disponibilidad del producto…'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => void removeFavorite(productId)}
                        aria-label="Quitar producto no disponible de favoritos"
                        className="mt-5 inline-flex w-fit rounded-sm border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text disabled:cursor-wait disabled:opacity-60"
                      >
                        {pending ? 'Quitando…' : 'Quitar de favoritos'}
                      </button>
                    </article>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

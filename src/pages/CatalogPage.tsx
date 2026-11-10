import { Fragment, useEffect, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { useFavorites } from '../hooks/useFavorites'
import { useProducts } from '../hooks/useProducts'
import {
  getFavoriteErrorMessage,
} from '../services/favoriteService'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  type ProductCategory,
} from '../types/product'

type CategoryFilter = ProductCategory | 'all'

const PRODUCTS_PER_PAGE = 12

function isCategoryFilter(value: string): value is CategoryFilter {
  return (
    value === 'all' ||
    PRODUCT_CATEGORIES.some((productCategory) => productCategory === value)
  )
}

export function CatalogPage() {
  const { products, loading, error } = useProducts()
  const {
    favorites,
    error: favoritesError,
    pendingProductIds,
    addFavorite,
    removeFavorite,
  } = useFavorites()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim().toLocaleLowerCase('es'))
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLocaleLowerCase('es')
      .includes(debouncedSearch)
    const matchesCategory = category === 'all' || product.category === category

    return matchesSearch && matchesCategory
  })
  const pageCount = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  )
  const currentPage = Math.min(page, pageCount)
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  )
  const mobilePageNumbers = [
    ...new Set([1, currentPage, pageCount]),
  ].sort((first, second) => first - second)

  const firstVisibleProduct = (currentPage - 1) * PRODUCTS_PER_PAGE + 1
  const lastVisibleProduct = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    filteredProducts.length,
  )

  return (
    <section
      aria-labelledby="catalog-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>
      <h1
        id="catalog-title"
        className="font-display text-3xl font-medium text-ink sm:text-5xl"
      >
        Nuestro catálogo
      </h1>
      <div
        aria-busy={loading}
        className="mt-8 rounded-sm border border-line bg-surface p-6 sm:p-10"
      >
        {loading ? (
          <p role="status" aria-live="polite" className="leading-7 text-muted">
            Cargando productos…
          </p>
        ) : error ? (
          <div role="alert" aria-live="assertive">
            <p className="font-display text-xl text-ink sm:text-2xl">
              No fue posible cargar el catálogo.
            </p>
            <p className="mt-3 leading-7 text-muted">
              Inténtalo nuevamente más tarde.
            </p>
          </div>
        ) : (
          <>
            {favoritesError && (
              <p role="alert" className="mb-5 leading-7 text-muted">
                {getFavoriteErrorMessage(favoritesError)}
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
              <div>
                <label
                  htmlFor="catalog-search"
                  className="mb-2 block text-sm font-semibold text-ink"
                >
                  Buscar por nombre
                </label>
                <input
                  id="catalog-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Escribe el nombre de un producto"
                  className="w-full rounded-sm border border-line bg-page px-4 py-3 text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
                />
              </div>
              <div>
                <label
                  htmlFor="catalog-category"
                  className="mb-2 block text-sm font-semibold text-ink"
                >
                  Categoría
                </label>
                <select
                  id="catalog-category"
                  value={category}
                  onChange={(event) => {
                    const selectedCategory = event.target.value
                    setCategory(
                      isCategoryFilter(selectedCategory)
                        ? selectedCategory
                        : 'all',
                    )
                    setPage(1)
                  }}
                  className="w-full rounded-sm border border-line bg-page px-4 py-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text sm:min-w-64"
                >
                  <option value="all">Todas las categorías</option>
                  {PRODUCT_CATEGORIES.map((productCategory) => (
                    <option key={productCategory} value={productCategory}>
                      {PRODUCT_CATEGORY_LABELS[productCategory]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={search.trim() === '' && category === 'all'}
                onClick={() => {
                  setSearch('')
                  setDebouncedSearch('')
                  setCategory('all')
                  setPage(1)
                }}
                className="min-h-11 rounded-sm border border-line bg-page px-4 py-2 text-sm font-semibold text-ink transition-colors enabled:hover:border-gold/60 enabled:hover:bg-surface active:bg-page disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
              >
                Limpiar filtros
              </button>
            </div>

            {products.length === 0 ? (
              <p role="status" className="mt-8 leading-7 text-muted">
                Aún no hay productos publicados.
              </p>
            ) : filteredProducts.length === 0 ? (
              <p role="status" className="mt-8 leading-7 text-muted">
                No se encontraron productos con esos criterios.
              </p>
            ) : (
              <>
                <p
                  aria-live="polite"
                  className="mt-8 text-sm text-muted"
                >
                  Mostrando {firstVisibleProduct}–{lastVisibleProduct} de{' '}
                  {filteredProducts.length} productos
                </p>
                <ul
                  aria-label="Productos publicados"
                  className="mt-4 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {visibleProducts.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        favoritePending={pendingProductIds.includes(product.id)}
                        onToggleFavorite={(productId) => {
                          const operation = favorites.includes(productId)
                            ? removeFavorite
                            : addFavorite
                          void operation(productId)
                        }}
                      />
                    </li>
                  ))}
                </ul>
                {pageCount > 1 && (
                  <nav
                    aria-label="Paginación del catálogo"
                    className="mt-8 flex flex-wrap items-center justify-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="min-h-11 rounded-sm border border-line bg-page px-3 text-sm font-semibold text-ink transition-colors enabled:hover:border-gold/60 enabled:hover:bg-surface active:bg-page disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: pageCount }, (_, index) => {
                      const pageNumber = index + 1
                      const isCurrentPage = pageNumber === currentPage
                      const isMobilePage = mobilePageNumbers.includes(pageNumber)
                      const previousMobilePage =
                        mobilePageNumbers[
                          mobilePageNumbers.indexOf(pageNumber) - 1
                        ]

                      return (
                        <Fragment key={pageNumber}>
                          {isMobilePage &&
                            previousMobilePage !== undefined &&
                            pageNumber - previousMobilePage > 1 && (
                              <span
                                aria-hidden="true"
                                className="px-1 text-sm text-muted sm:hidden"
                              >
                                …
                              </span>
                            )}
                          <button
                            type="button"
                            aria-label={`Página ${pageNumber}`}
                            aria-current={isCurrentPage ? 'page' : undefined}
                            onClick={() => setPage(pageNumber)}
                            className={`size-11 rounded-sm border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text ${
                              isCurrentPage
                                ? 'border-gold-text bg-deep-blue text-cream'
                                : 'border-line bg-page text-ink hover:border-gold/60 hover:bg-surface active:bg-page'
                            } ${isMobilePage ? '' : 'hidden sm:inline-block'}`}
                          >
                            {pageNumber}
                          </button>
                        </Fragment>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      className="min-h-11 rounded-sm border border-line bg-page px-3 text-sm font-semibold text-ink transition-colors enabled:hover:border-gold/60 enabled:hover:bg-surface active:bg-page disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
                    >
                      Siguiente
                    </button>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  )
}

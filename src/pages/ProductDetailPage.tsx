import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProductImage } from '../components/ProductCard'
import { getPublishedProductById } from '../services/productService'
import { PRODUCT_CATEGORY_LABELS, type Product } from '../types/product'

type ProductDetailState =
  | { status: 'loading'; productId: string | undefined }
  | { status: 'invalid-id'; productId: string | undefined }
  | { status: 'not-found'; productId: string }
  | { status: 'error'; productId: string; error: Error }
  | { status: 'loaded'; productId: string; product: Product }

const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

export function ProductDetailPage() {
  const { productId } = useParams()
  const [detail, setDetail] = useState<ProductDetailState>({
    status: 'loading',
    productId,
  })

  useEffect(() => {
    let active = true

    if (!productId || productId.trim().length === 0 || productId.includes('/')) {
      return () => {
        active = false
      }
    }

    void getPublishedProductById(productId)
      .then((product) => {
        if (active) {
          setDetail(
            product
              ? { status: 'loaded', productId, product }
              : { status: 'not-found', productId },
          )
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setDetail({
            status: 'error',
            productId,
            error:
              cause instanceof Error
                ? cause
                : new Error('Ocurrió un error inesperado al cargar el producto.'),
          })
        }
      })

    return () => {
      active = false
    }
  }, [productId])

  const isInvalidId =
    !productId || productId.trim().length === 0 || productId.includes('/')
  const currentDetail = isInvalidId
    ? { status: 'invalid-id' as const, productId }
    : detail.productId === productId
      ? detail
      : { status: 'loading' as const, productId }
  const product =
    currentDetail.status === 'loaded' ? currentDetail.product : null

  return (
    <section
      aria-labelledby="product-detail-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>
      <h1
        id="product-detail-title"
        className="font-display text-3xl font-medium text-ink sm:text-5xl"
      >
        {product?.name ?? 'Detalle del producto'}
      </h1>
      <Link
        to="/catalogo"
        className="mt-6 inline-flex rounded-sm font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
      >
        Volver al catálogo
      </Link>

      <div
        aria-busy={currentDetail.status === 'loading'}
        className="mt-8 rounded-sm border border-line bg-surface p-6 sm:p-10"
      >
        {currentDetail.status === 'loading' ? (
          <p role="status" aria-live="polite" className="leading-7 text-muted">
            Cargando producto…
          </p>
        ) : currentDetail.status === 'invalid-id' ? (
          <p role="alert" className="leading-7 text-muted">
            El identificador del producto no es válido.
          </p>
        ) : currentDetail.status === 'not-found' ? (
          <p role="status" className="leading-7 text-muted">
            Este producto no existe o ya no está disponible.
          </p>
        ) : currentDetail.status === 'error' ? (
          <div role="alert" aria-live="assertive">
            <p className="font-display text-xl text-ink sm:text-2xl">
              No fue posible cargar el producto.
            </p>
            <p className="mt-3 leading-7 text-muted">
              Inténtalo nuevamente más tarde.
            </p>
          </div>
        ) : product ? (
          <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-12">
            <div className="aspect-square overflow-hidden border border-line bg-page">
              <ProductImage product={product} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-gold-text uppercase">
                {PRODUCT_CATEGORY_LABELS[product.category]}
              </p>
              <p className="mt-5 leading-7 text-muted">
                {product.description}
              </p>
              <p className="mt-6 font-display text-2xl text-ink">
                {priceFormatter.format(product.price)}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

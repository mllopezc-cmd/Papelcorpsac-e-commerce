import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProductImage } from '../components/ProductCard'
import { useCart } from '../hooks/useCart'
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

type ProductQuantityControlsProps = {
  product: Product
  remainingStock: number
  onAdd: (product: Product, quantity: number) => Promise<boolean>
}

function ProductQuantityControls({
  product,
  remainingStock,
  onAdd,
}: ProductQuantityControlsProps) {
  const [quantity, setQuantity] = useState(1)
  const isMounted = useRef(true)
  const selectedQuantity = Math.min(quantity, remainingStock)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return (
    <>
      <label
        htmlFor="selected-quantity"
        className="text-sm font-semibold text-ink"
      >
        Cantidad seleccionada
      </label>
      <div className="mt-2 flex w-fit items-center gap-3">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          disabled={selectedQuantity <= 1}
          className="flex size-11 items-center justify-center rounded-sm border border-line bg-page text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
        </button>
        <output
          id="selected-quantity"
          aria-live="polite"
          aria-atomic="true"
          className="min-w-10 text-center font-semibold text-ink"
        >
          {selectedQuantity}
        </output>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          onClick={() =>
            setQuantity((current) =>
              Math.min(remainingStock, current + 1),
            )
          }
          disabled={selectedQuantity >= remainingStock}
          className="flex size-11 items-center justify-center rounded-sm border border-line bg-page text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() =>
          void onAdd(product, selectedQuantity).then((accepted) => {
            if (accepted && isMounted.current) {
              setQuantity(1)
            }
          })
        }
        disabled={selectedQuantity > remainingStock}
        className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-50"
      >
        Agregar al carrito
      </button>
    </>
  )
}

export function ProductDetailPage() {
  const { productId } = useParams()
  const { items, addItem } = useCart()
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
  const cartQuantity = product
    ? items.find((item) => item.product.id === product.id)?.quantity ?? 0
    : 0
  const productStock = product?.stock
  const availableStock =
    typeof productStock === 'number' &&
    Number.isSafeInteger(productStock) &&
    productStock > 0
      ? productStock
      : 0
  const hasAvailableStock = availableStock > 0
  const remainingStock = Math.max(0, availableStock - cartQuantity)

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
              <div className="mt-6">
                <p className="text-sm text-muted">
                  Stock del producto:{' '}
                  {hasAvailableStock
                    ? `${availableStock} unidades`
                    : 'no disponible'}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Disponibles para agregar: {remainingStock}
                </p>
                {!hasAvailableStock ? (
                  <p role="status" className="font-semibold text-muted">
                    Producto agotado.
                  </p>
                ) : remainingStock === 0 ? (
                  <p role="status" className="font-semibold text-muted">
                    Ya tienes todas las unidades disponibles en tu carrito.
                  </p>
                ) : (
                  <ProductQuantityControls
                    key={product.id}
                    product={product}
                    remainingStock={remainingStock}
                    onAdd={addItem}
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

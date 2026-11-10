import { Link } from 'react-router'
import { useCart } from '../hooks/useCart'

const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

export function CartAddNotification() {
  const { notification, dismissNotification } = useCart()

  if (!notification) {
    return null
  }

  const {
    id,
    product,
    quantity,
    operationSubtotalCents,
    totalUnits,
    cartSubtotalCents,
  } = notification

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Producto agregado al carrito: {product.name}, {quantity}{' '}
        {quantity === 1 ? 'unidad' : 'unidades'}.
      </p>
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6">
        <section
          aria-label="Confirmación de producto agregado"
          className="pointer-events-auto w-full max-w-sm rounded-sm border border-line bg-page p-4 text-ink shadow-lg sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/50 text-sm font-bold text-gold-text"
            >
              ✓
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                Producto agregado al carrito
              </p>
              <p className="mt-1 wrap-break-word text-sm text-muted">
                {product.name}
              </p>
            </div>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => dismissNotification(id)}
              className="flex size-11 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt=""
                className="size-16 shrink-0 rounded-sm border border-line object-cover"
              />
            )}
            <dl className="min-w-0 flex-1 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">
                  Agregadas ({quantity})
                </dt>
                <dd className="text-right font-medium text-ink">
                  {priceFormatter.format(operationSubtotalCents / 100)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Unidades en el carrito</dt>
                <dd className="text-right font-medium text-ink">
                  {totalUnits}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-1">
                <dt className="text-muted">Subtotal del carrito</dt>
                <dd className="text-right font-semibold text-ink">
                  {priceFormatter.format(cartSubtotalCents / 100)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => dismissNotification(id)}
              className="min-h-11 rounded-sm px-3 py-2 text-sm font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
            >
              Continuar comprando
            </button>
            <Link
              to="/carrito"
              onClick={() => dismissNotification(id)}
              className="inline-flex min-h-11 items-center rounded-sm bg-deep-blue px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
            >
              Ver carrito
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

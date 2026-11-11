import { useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  CheckoutClientError,
  submitCheckout,
} from '../services/checkoutService'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import type {
  CheckoutRequest,
  CheckoutSuccessResponse,
} from '../types/checkout'

const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

type CheckoutAttempt = {
  fingerprint: string
  idempotencyKey: string
}

function getErrorMessage(error: unknown): string {
  if (!(error instanceof CheckoutClientError)) {
    return 'Ocurrió un error inesperado. Inténtalo nuevamente.'
  }

  switch (error.kind) {
    case 'invalid_request':
      return 'El pedido contiene datos inválidos. Revisa tu carrito.'
    case 'unauthorized':
      return 'Tu sesión no es válida. Inicia sesión nuevamente.'
    case 'conflict':
      return 'No se pudo confirmar el pedido. Es posible que algún producto ya no tenga stock disponible.'
    case 'unavailable':
      return 'El servicio de compras simuladas no está disponible en este entorno.'
    default:
      return 'No se pudo confirmar el pedido. Inténtalo nuevamente.'
  }
}

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, clearCart } = useCart()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<
    CheckoutSuccessResponse | null
  >(null)

  const attemptRef = useRef<CheckoutAttempt | null>(null)
  const submittingRef = useRef(false)

  const hasInvalidItems =
    items.length > 50 ||
    items.some(
      ({ product, quantity }) =>
        !product.published ||
        typeof product.stock !== 'number' ||
        !Number.isSafeInteger(product.stock) ||
        product.stock < quantity ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 99,
    )

  const handleConfirm = async () => {
    if (
      submittingRef.current ||
      confirmedOrder ||
      !user ||
      items.length === 0 ||
      hasInvalidItems
    ) {
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setError(null)

    const requestedItems = items.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }))

    const fingerprint = JSON.stringify(
      [...requestedItems].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      ),
    )

    if (attemptRef.current?.fingerprint !== fingerprint) {
      attemptRef.current = {
        fingerprint,
        idempotencyKey: crypto.randomUUID(),
      }
    }

    const request: CheckoutRequest = {
      idempotencyKey: attemptRef.current.idempotencyKey,
      items: requestedItems,
    }

    try {
      const result = await submitCheckout(user, request)

      setConfirmedOrder(result)
      clearCart()
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="checkout-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>

      <h1
        id="checkout-title"
        className="font-display text-3xl font-medium text-ink sm:text-5xl"
      >
        Finalizar compra
      </h1>

      <p className="mt-4 max-w-2xl leading-7 text-muted">
        Revisa tu pedido y confirma la operación de demostración.
        No se realizarán cobros reales ni se solicitarán datos bancarios.
      </p>

      {confirmedOrder ? (
        <div
          aria-live="polite"
          className="mt-10 max-w-2xl rounded-sm border border-line bg-surface p-6 sm:p-9"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
            Pedido confirmado
          </p>

          <h2 className="mt-3 font-display text-2xl font-medium text-ink">
            Tu orden fue registrada
          </h2>

          <p className="mt-4 leading-7 text-muted">
            Se registró correctamente tu solicitud de compra simulada.
            La orden quedó pendiente de procesamiento.
          </p>

          <dl className="mt-6 space-y-4 border-y border-line py-5">
            <div>
              <dt className="text-sm text-muted">Identificador de orden</dt>
              <dd className="mt-1 break-all font-mono text-sm text-ink">
                {confirmedOrder.order.id}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted">Estado</dt>
              <dd className="font-semibold text-ink">Pendiente</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted">Total confirmado</dt>
              <dd className="font-semibold text-ink">
                {priceFormatter.format(
                  confirmedOrder.order.totalCents / 100,
                )}
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-sm text-muted">
            {confirmedOrder.replayed
              ? 'Se recuperó una orden confirmada anteriormente. No se creó una compra duplicada.'
              : 'Esta confirmación corresponde a una operación de demostración.'}
          </p>

          <Link
            to="/catalogo"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
          >
            Volver al catálogo
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 max-w-2xl rounded-sm border border-line bg-surface p-6 text-center sm:p-9">
          <h2 className="font-display text-xl text-ink">
            Tu carrito está vacío
          </h2>

          <p className="mt-3 text-muted">
            Agrega productos antes de continuar con el checkout.
          </p>

          <Link
            to="/catalogo"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
          <div className="rounded-sm border border-line bg-surface p-5 sm:p-8">
            <h2 className="font-display text-2xl font-medium text-ink">
              Resumen del pedido
            </h2>

            <ul className="mt-6 divide-y divide-line border-y border-line">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex justify-between gap-5 py-5"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      Cantidad: {quantity}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Precio unitario:{' '}
                      {priceFormatter.format(product.price)}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-ink">
                    {priceFormatter.format(
                      (Math.round(product.price * 100) * quantity) /
                        100,
                    )}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-between gap-4">
              <span className="font-display text-xl text-ink">
                Total estimado
              </span>

              <span className="font-display text-xl text-ink">
                {priceFormatter.format(subtotal)}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted">
              El importe definitivo se calculará con los precios
              almacenados en el servidor.
            </p>

            <Link
              to="/carrito"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
            >
              Volver a mi carrito
            </Link>
          </div>

          <div className="h-fit rounded-sm border border-line bg-page p-5 sm:p-8">
            <h2 className="font-display text-2xl font-medium text-ink">
              Pago simulado
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted">
              Este proyecto académico utiliza una confirmación
              simulada. No ingreses información de tarjetas,
              cuentas bancarias ni otros datos de pago.
            </p>

            <div className="mt-6 border-y border-line py-5">
              <p className="text-sm font-semibold text-ink">
                Entorno de demostración
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                La operación depende de un servidor de pruebas
                autorizado. Las compras comerciales permanecen
                deshabilitadas.
              </p>
            </div>

            {hasInvalidItems && (
              <p
                role="alert"
                className="mt-5 text-sm leading-6 text-ink"
              >
                Hay productos sin existencias válidas o cantidades
                no admitidas. Revisa tu carrito antes de continuar.
              </p>
            )}

            {error && (
              <p
                role="alert"
                aria-live="polite"
                className="mt-5 rounded-sm border border-line bg-surface p-3 text-sm leading-6 text-ink"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={submitting || hasInvalidItems || !user}
              className="mt-6 min-h-12 w-full rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Confirmando pedido…'
                : 'Confirmar pedido simulado'}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-muted">
              No se realizará ningún cargo real.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

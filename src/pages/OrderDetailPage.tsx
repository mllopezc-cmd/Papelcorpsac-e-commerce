import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { getUserOrderById } from '../services/orderService'
import {
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from '../types/order'

type OrderDetailState =
  | {
      uid: string
      orderId: string
      retry: number
      status: 'loaded'
      order: Order
    }
  | {
      uid: string
      orderId: string
      retry: number
      status: 'not-found' | 'error'
    }

type OrderDetailViewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'not-found' }
  | { status: 'loaded'; order: Order }

const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'long',
  timeStyle: 'short',
})

const statusClasses: Record<OrderStatus, string> = {
  pending: 'border border-line text-muted',
  processing: 'border border-line text-gold-text',
  completed: 'border border-line text-ink',
  cancelled: 'border border-line text-muted',
}

export function OrderDetailPage() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [state, setState] = useState<OrderDetailState | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!uid || !orderId) {
      return
    }

    let active = true

    void getUserOrderById(uid, orderId)
      .then((order) => {
        if (!active) {
          return
        }

        setState(
          order
            ? {
                uid,
                orderId,
                retry,
                status: 'loaded',
                order,
              }
            : {
                uid,
                orderId,
                retry,
                status: 'not-found',
              },
        )
      })
      .catch(() => {
        if (active) {
          setState({
            uid,
            orderId,
            retry,
            status: 'error',
          })
        }
      })

    return () => {
      active = false
    }
  }, [uid, orderId, retry])

  const visibleState: OrderDetailViewState =
    !uid || !orderId
      ? { status: 'error' }
      : !state ||
          state.uid !== uid ||
          state.orderId !== orderId ||
          state.retry !== retry
        ? { status: 'loading' }
        : state.status === 'loaded'
          ? { status: 'loaded', order: state.order }
          : { status: state.status }

  return (
    <section
      aria-labelledby="order-detail-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>

      <h1
        id="order-detail-title"
        className="font-display text-3xl font-medium text-ink sm:text-5xl"
      >
        Detalle de orden
      </h1>

      <Link
        to="/mis-ordenes"
        className="mt-6 inline-flex rounded-sm font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
      >
        Volver a mis órdenes
      </Link>

      <div
        aria-busy={visibleState.status === 'loading'}
        className="mt-8 rounded-sm border border-line bg-surface p-6 sm:p-9"
      >
        {visibleState.status === 'loading' ? (
          <p role="status" aria-live="polite" className="leading-7 text-muted">
            Cargando detalle de la orden…
          </p>
        ) : visibleState.status === 'error' ? (
          <div>
            <p role="alert" className="leading-7 text-muted">
              No fue posible consultar esta orden.
            </p>

            <button
              type="button"
              onClick={() => setRetry((current) => current + 1)}
              className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
            >
              Reintentar
            </button>
          </div>
        ) : visibleState.status === 'not-found' ? (
          <div>
            <p role="status" className="font-display text-xl text-ink">
              No encontramos esta orden.
            </p>

            <p className="mt-3 leading-7 text-muted">
              La orden no existe o no está disponible.
            </p>
          </div>
        ) : (
          <div>
            <div className="border-b border-line pb-6">
              <p className="text-xs font-semibold tracking-wide text-gold-text uppercase">
                Identificador de orden
              </p>

              <p className="mt-2 break-all font-mono text-sm text-ink">
                {visibleState.order.id}
              </p>

              <p className="mt-3 text-sm text-muted">
                {dateFormatter.format(visibleState.order.createdAt.toDate())}
              </p>

              <span
                className={`mt-4 inline-flex rounded-sm px-3 py-1.5 text-xs font-semibold ${statusClasses[visibleState.order.status]}`}
              >
                {ORDER_STATUS_LABELS[visibleState.order.status]}
              </span>
            </div>

            <div className="py-6">
              <h2 className="font-display text-xl font-medium text-ink">
                Productos de tu pedido
              </h2>

              <ul className="mt-5 divide-y divide-line border-y border-line">
                {visibleState.order.items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-ink">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted">
                        Cantidad: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        Precio unitario:{' '}
                        {priceFormatter.format(item.unitPriceCents / 100)}
                      </p>
                    </div>

                    <p className="font-semibold text-ink">
                      {priceFormatter.format(item.subtotalCents / 100)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="border-t border-line pt-5">
              <div className="flex justify-between gap-4 font-display text-xl text-ink">
                <dt>Total confirmado</dt>
                <dd className="font-semibold">
                  {priceFormatter.format(
                    visibleState.order.totalCents / 100,
                  )}
                </dd>
              </div>

              <div className="mt-4 flex justify-between gap-4 text-sm text-muted">
                <dt>Moneda</dt>
                <dd>{visibleState.order.currency}</dd>
              </div>
            </dl>

            <p className="mt-6 text-sm leading-7 text-muted">
              Esta orden corresponde a una compra simulada. No se realizaron
              cobros reales.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

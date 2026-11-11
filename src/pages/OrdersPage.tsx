import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { getUserOrders } from '../services/orderService'
import {
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from '../types/order'

type OrdersState =
  | {
      uid: string
      retry: number
      status: 'loaded'
      orders: Order[]
    }
  | {
      uid: string
      retry: number
      status: 'error'
    }

type OrdersViewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; orders: Order[] }

const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const statusClasses: Record<OrderStatus, string> = {
  pending: 'border border-line text-muted',
  processing: 'border border-line text-gold-text',
  completed: 'border border-line text-ink',
  cancelled: 'border border-line text-muted',
}

export function OrdersPage() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [state, setState] = useState<OrdersState | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!uid) {
      return
    }

    let active = true

    void getUserOrders(uid)
      .then((orders) => {
        if (active) {
          setState({
            uid,
            retry,
            status: 'loaded',
            orders,
          })
        }
      })
      .catch(() => {
        if (active) {
          setState({
            uid,
            retry,
            status: 'error',
          })
        }
      })

    return () => {
      active = false
    }
  }, [uid, retry])

  const visibleState: OrdersViewState = !uid
    ? { status: 'error' }
    : !state || state.uid !== uid || state.retry !== retry
      ? { status: 'loading' }
      : state.status === 'loaded'
        ? { status: 'loaded', orders: state.orders }
        : { status: 'error' }

  return (
    <section
      aria-labelledby="orders-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>

      <h1
        id="orders-title"
        className="font-display text-3xl font-medium text-ink sm:text-5xl"
      >
        Mis órdenes
      </h1>

      <p className="mt-4 max-w-2xl leading-7 text-muted">
        Consulta tus compras y revisa el detalle de cada pedido.
      </p>

      <div
        aria-busy={visibleState.status === 'loading'}
        className="mt-8 rounded-sm border border-line bg-surface p-6 sm:p-9"
      >
        {visibleState.status === 'loading' ? (
          <p role="status" aria-live="polite" className="leading-7 text-muted">
            Cargando tus órdenes…
          </p>
        ) : visibleState.status === 'error' ? (
          <div>
            <p role="alert" className="leading-7 text-muted">
              No fue posible cargar tus órdenes. Inténtalo nuevamente.
            </p>

            <button
              type="button"
              onClick={() => setRetry((current) => current + 1)}
              className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
            >
              Reintentar
            </button>
          </div>
        ) : visibleState.orders.length === 0 ? (
          <div>
            <p role="status" className="font-display text-xl text-ink">
              Aún no tienes órdenes registradas.
            </p>

            <p className="mt-3 leading-7 text-muted">
              Cuando realices una compra, podrás consultar aquí los detalles
              de tu pedido.
            </p>

            <Link
              to="/catalogo"
              className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visibleState.orders.map((order) => {
              const totalUnits = order.items.reduce(
                (total, item) => total + item.quantity,
                0,
              )

              return (
                <li key={order.id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-wide text-gold-text uppercase">
                        Orden
                      </p>

                      <h2 className="mt-2 break-all font-mono text-sm text-ink">
                        {order.id}
                      </h2>

                      <p className="mt-2 text-sm text-muted">
                        {dateFormatter.format(order.createdAt.toDate())}
                      </p>

                      <p className="mt-2 text-sm text-muted">
                        {totalUnits}{' '}
                        {totalUnits === 1 ? 'unidad' : 'unidades'}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <span
                        className={`rounded-sm px-3 py-1.5 text-xs font-semibold ${statusClasses[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>

                      <p className="font-display text-xl text-ink">
                        {priceFormatter.format(order.totalCents / 100)}
                      </p>

                      <Link
                        to={`/mis-ordenes/${encodeURIComponent(order.id)}`}
                        className="inline-flex min-h-11 items-center rounded-sm border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

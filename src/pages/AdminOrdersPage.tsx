import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from '../services/orderService'
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from '../types/order'

type StatusFilter = 'all' | OrderStatus

type PendingStatusChange = {
  orderId: string
  oldStatus: OrderStatus
  newStatus: OrderStatus
}

const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const inputClass =
  'min-h-11 rounded-sm border border-line bg-page px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text'

const buttonClass =
  'inline-flex min-h-11 items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-50'

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'permission-denied'
  ) {
    return 'No tienes permisos para realizar esta operación.'
  }

  return 'No se pudo completar la operación. Inténtalo nuevamente.'
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [drafts, setDrafts] = useState<Record<string, OrderStatus>>({})
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null)

  useEffect(() => {
    let active = true

    void getAdminOrders()
      .then((result) => {
        if (!active) {
          return
        }

        setOrders(result)
        setDrafts({})
        setLoadError(null)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }

        setLoadError(getErrorMessage(error))
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [reload])

  const visibleOrders = orders.filter(
    (order) => filter === 'all' || order.status === filter,
  )

  const handleRetry = () => {
    if (savingId !== null || pendingChange !== null) {
      return
    }

    setLoading(true)
    setLoadError(null)
    setSaveError(null)
    setNotice(null)
    setReload((current) => current + 1)
  }

  const handleSave = (order: Order) => {
    if (savingId !== null || pendingChange !== null) return

    const nextStatus = drafts[order.id] ?? order.status

    if (nextStatus === order.status) return

    setPendingChange({
      orderId: order.id,
      oldStatus: order.status,
      newStatus: nextStatus,
    })
  }

  const confirmStatusChange = async () => {
    if (!pendingChange || savingId !== null) return

    const { orderId, newStatus } = pendingChange

    setPendingChange(null)
    setSavingId(orderId)
    setSaveError(null)
    setNotice(null)

    try {
      await updateAdminOrderStatus(orderId, newStatus)

      setOrders((current) =>
        current.map((item) =>
          item.id === orderId
            ? { ...item, status: newStatus }
            : item,
        ),
      )

      setDrafts((current) => {
        const updated = { ...current }
        delete updated[orderId]
        return updated
      })

      setNotice(
        `Estado de la orden ${orderId} actualizado correctamente.`,
      )
    } catch (error) {
      setSaveError(getErrorMessage(error))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section
      aria-labelledby="admin-orders-title"
      className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        Panel administrativo
      </p>

      <h1
        id="admin-orders-title"
        className="mt-4 font-display text-3xl font-medium text-ink sm:text-4xl"
      >
        Gestión de órdenes
      </h1>

      <p className="mt-4 max-w-2xl leading-7 text-muted">
        Consulta las compras registradas y administra sus estados.
        Los importes y artículos de cada orden son de solo lectura.
      </p>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <label
            htmlFor="admin-orders-filter"
            className="text-sm font-semibold text-ink"
          >
            Filtrar por estado
          </label>

          <select
            id="admin-orders-filter"
            className={inputClass}
            value={filter}
            disabled={savingId !== null || pendingChange !== null}
            onChange={(event) =>
              setFilter(event.target.value as StatusFilter)
            }
          >
            <option value="all">Todos los estados</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={`${buttonClass} border border-line text-ink hover:bg-surface`}
          onClick={handleRetry}
          disabled={loading || savingId !== null || pendingChange !== null}
        >
          Actualizar listado
        </button>
      </div>

      {notice && (
        <p
          role="status"
          aria-live="polite"
          className="mt-5 rounded-sm border border-line bg-surface p-4 text-sm text-ink wrap-break-word"
        >
          {notice}
        </p>
      )}

      {saveError && (
        <p
          role="alert"
          className="mt-5 rounded-sm border border-line bg-surface p-4 text-sm text-ink"
        >
          {saveError}
        </p>
      )}

      <div className="mt-6" aria-busy={loading}>
        {loading ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-sm border border-line bg-surface p-6 text-muted"
          >
            Cargando órdenes…
          </p>
        ) : loadError ? (
          <div className="rounded-sm border border-line bg-surface p-6">
            <p role="alert" className="text-muted">
              {loadError}
            </p>

            <button
              type="button"
              className={`${buttonClass} mt-5 bg-deep-blue text-cream hover:bg-graphite`}
              onClick={handleRetry}
            >
              Reintentar
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p
            role="status"
            className="rounded-sm border border-line bg-surface p-6 text-muted"
          >
            No hay órdenes registradas.
          </p>
        ) : visibleOrders.length === 0 ? (
          <p
            role="status"
            className="rounded-sm border border-line bg-surface p-6 text-muted"
          >
            No hay órdenes con el estado seleccionado.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">
              Mostrando {visibleOrders.length} de {orders.length} órdenes.
            </p>

            <ul className="space-y-5">
              {visibleOrders.map((order) => {
                const selectedStatus =
                  drafts[order.id] ?? order.status

                const unchanged =
                  selectedStatus === order.status

                const saving = savingId === order.id

                return (
                  <li
                    key={order.id}
                    className="min-w-0 rounded-sm border border-line bg-surface p-5 sm:p-7"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-wide text-gold-text uppercase">
                          Orden
                        </p>

                        <h2 className="mt-2 font-mono text-sm text-ink break-all">
                          {order.id}
                        </h2>

                        <p className="mt-3 text-sm text-muted">
                          {dateFormatter.format(
                            order.createdAt.toDate(),
                          )}
                        </p>

                        <p className="mt-2 text-sm text-muted break-all">
                          Cliente: {order.userId}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <p className="text-xs text-muted">
                          Total de la orden
                        </p>

                        <p className="mt-1 font-display text-2xl text-ink">
                          {priceFormatter.format(
                            order.totalCents / 100,
                          )}
                        </p>

                        <p className="mt-2 text-sm text-muted">
                          Estado actual:{' '}
                          <span className="font-semibold text-ink">
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-line pt-5">
                      <h3 className="text-sm font-semibold text-ink">
                        Artículos
                      </h3>

                      <ul className="mt-3 space-y-2">
                        {order.items.map((item, index) => (
                          <li
                            key={`${item.productId}-${index}`}
                            className="flex min-w-0 flex-wrap justify-between gap-x-4 gap-y-1 text-sm text-muted"
                          >
                            <span className="min-w-0 wrap-break-word">
                              {item.name} × {item.quantity}
                            </span>

                            <span className="text-ink">
                              {priceFormatter.format(
                                item.subtotalCents / 100,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-end">
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <label
                          htmlFor={`order-status-${order.id}`}
                          className="text-sm font-semibold text-ink"
                        >
                          Nuevo estado
                        </label>

                        <select
                          id={`order-status-${order.id}`}
                          aria-label={`Nuevo estado de la orden ${order.id}`}
                          className={`${inputClass} w-full`}
                          value={selectedStatus}
                          disabled={savingId !== null || pendingChange !== null}
                          onChange={(event) => {
                            const status =
                              event.target.value as OrderStatus

                            setDrafts((current) => ({
                              ...current,
                              [order.id]: status,
                            }))

                            setSaveError(null)
                            setNotice(null)
                          }}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {ORDER_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        aria-label={
                          saving
                            ? `Guardando… de ${order.id}`
                            : `Guardar estado de ${order.id}`
                        }
                        className={`${buttonClass} bg-deep-blue text-cream hover:bg-graphite`}
                        disabled={unchanged || savingId !== null || pendingChange !== null}
                        onClick={() => handleSave(order)}
                      >
                        {saving
                          ? 'Guardando…'
                          : 'Guardar estado'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      <ConfirmDialog
        open={pendingChange !== null}
        title="Confirmar cambio de estado"
        description={
          pendingChange
            ? `¿Cambiar la orden ${pendingChange.orderId} de ` +
              `"${ORDER_STATUS_LABELS[pendingChange.oldStatus]}" a ` +
              `"${ORDER_STATUS_LABELS[pendingChange.newStatus]}"?`
            : ''
        }
        confirmLabel="Confirmar cambio"
        onCancel={() => setPendingChange(null)}
        onConfirm={() => void confirmStatusChange()}
      />
    </section>
  )
}

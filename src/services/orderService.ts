import { loadFirestore } from '../lib/firebase'
import {
  ORDER_STATUSES,
  type Order,
  type OrderItem,
  type OrderStatus,
} from '../types/order'

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function isPositiveSafeInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0
  )
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status === value)
}

function isOrderItem(value: unknown): value is OrderItem {
  if (!isRecord(value)) {
    return false
  }

  if (
    typeof value.productId !== 'string' ||
    value.productId.trim().length === 0 ||
    typeof value.name !== 'string' ||
    value.name.trim().length === 0 ||
    !isPositiveSafeInteger(value.quantity) ||
    !isPositiveSafeInteger(value.unitPriceCents) ||
    !isPositiveSafeInteger(value.subtotalCents)
  ) {
    return false
  }

  const expectedSubtotal = value.unitPriceCents * value.quantity

  return (
    Number.isSafeInteger(expectedSubtotal) &&
    value.subtotalCents === expectedSubtotal
  )
}

function toOrder(
  id: string,
  value: unknown,
  timestampConstructor: typeof import('firebase/firestore').Timestamp,
): Order {
  if (
    !isRecord(value) ||
    typeof value.userId !== 'string' ||
    value.userId.trim().length === 0 ||
    !isOrderStatus(value.status) ||
    value.currency !== 'PEN' ||
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    !isPositiveSafeInteger(value.totalCents) ||
    !(value.createdAt instanceof timestampConstructor)
  ) {
    throw new Error('La orden contiene datos inválidos.')
  }

  const items: unknown[] = value.items

  if (!items.every(isOrderItem)) {
    throw new Error('La orden contiene artículos inválidos.')
  }

  const orderItems = items as OrderItem[]

  const calculatedTotal = orderItems.reduce(
    (total, item) => total + item.subtotalCents,
    0,
  )

  if (
    !Number.isSafeInteger(calculatedTotal) ||
    calculatedTotal !== value.totalCents
  ) {
    throw new Error('El importe de la orden no es válido.')
  }

  return {
    id,
    userId: value.userId,
    status: value.status,
    currency: 'PEN',
    items: orderItems,
    totalCents: value.totalCents,
    createdAt: value.createdAt,
  }
}

function isValidUid(uid: string): boolean {
  return (
    typeof uid === 'string' &&
    uid.length > 0 &&
    uid.length <= 128 &&
    uid.trim() === uid
  )
}

export async function getUserOrders(uid: string): Promise<Order[]> {
  if (!isValidUid(uid)) {
    throw new Error('El usuario no es válido.')
  }

  const { db, firestore } = await loadFirestore()

  const ordersQuery = firestore.query(
    firestore.collection(db, 'orders'),
    firestore.where('userId', '==', uid),
  )

  const snapshot = await firestore.getDocs(ordersQuery)

  const orders = snapshot.docs.map((document) =>
    toOrder(document.id, document.data(), firestore.Timestamp),
  )

  return orders.sort(
    (first, second) =>
      second.createdAt.toMillis() - first.createdAt.toMillis() ||
      first.id.localeCompare(second.id),
  )
}

export async function getUserOrderById(
  uid: string,
  orderId: string,
): Promise<Order | null> {
  if (
    !isValidUid(uid) ||
    typeof orderId !== 'string' ||
    orderId.length === 0 ||
    orderId.length > 1500 ||
    orderId.trim() !== orderId ||
    orderId.includes('/')
  ) {
    throw new Error('Los datos de consulta de la orden no son válidos.')
  }

  const { db, firestore } = await loadFirestore()

  const orderReference = firestore.doc(db, 'orders', orderId)
  const snapshot = await firestore.getDoc(orderReference)

  if (!snapshot.exists()) {
    return null
  }

  const order = toOrder(
    snapshot.id,
    snapshot.data(),
    firestore.Timestamp,
  )

  if (order.userId !== uid) {
    throw new Error('No se pudo acceder a esta orden.')
  }

  return order
}

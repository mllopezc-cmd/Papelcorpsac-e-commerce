import type { Timestamp } from 'firebase/firestore'

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'completed',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export type OrderItem = {
  productId: string
  name: string
  quantity: number
  unitPriceCents: number
  subtotalCents: number
}

export type Order = {
  id: string
  userId: string
  status: OrderStatus
  currency: 'PEN'
  items: OrderItem[]
  totalCents: number
  createdAt: Timestamp
}

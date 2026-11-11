import { getIdToken, type User } from 'firebase/auth'
import type {
  CheckoutRequest,
  CheckoutSuccessResponse,
} from '../types/checkout'

export type CheckoutClientErrorKind =
  | 'invalid_request'
  | 'unauthorized'
  | 'conflict'
  | 'unavailable'
  | 'internal'

export class CheckoutClientError extends Error {
  readonly kind: CheckoutClientErrorKind

  constructor(kind: CheckoutClientErrorKind) {
    super(kind)
    this.name = 'CheckoutClientError'
    this.kind = kind
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function isCheckoutSuccess(
  value: unknown,
): value is CheckoutSuccessResponse {
  if (
    !isRecord(value) ||
    value.success !== true ||
    typeof value.replayed !== 'boolean' ||
    !isRecord(value.order)
  ) {
    return false
  }

  const order = value.order

  return (
    typeof order.id === 'string' &&
    order.id.length > 0 &&
    order.status === 'pending' &&
    order.currency === 'PEN' &&
    typeof order.totalCents === 'number' &&
    Number.isSafeInteger(order.totalCents) &&
    order.totalCents > 0
  )
}

function errorKindFromStatus(status: number): CheckoutClientErrorKind {
  switch (status) {
    case 400:
      return 'invalid_request'
    case 401:
      return 'unauthorized'
    case 409:
      return 'conflict'
    case 503:
      return 'unavailable'
    default:
      return 'internal'
  }
}

export async function submitCheckout(
  user: User,
  request: CheckoutRequest,
): Promise<CheckoutSuccessResponse> {
  let token: string

  try {
    token = await getIdToken(user)
  } catch {
    throw new CheckoutClientError('unauthorized')
  }

  let response: Response

  try {
    response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      cache: 'no-store',
    })
  } catch {
    throw new CheckoutClientError('unavailable')
  }

  if (!response.ok) {
    throw new CheckoutClientError(
      errorKindFromStatus(response.status),
    )
  }

  if (response.status !== 200 && response.status !== 201) {
    throw new CheckoutClientError('internal')
  }

  const contentType = response.headers.get('content-type')

  if (
    typeof contentType !== 'string' ||
    !contentType.toLowerCase().includes('application/json')
  ) {
    throw new CheckoutClientError('internal')
  }

  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new CheckoutClientError('internal')
  }

  if (
    !isCheckoutSuccess(data) ||
    (response.status === 200 && !data.replayed) ||
    (response.status === 201 && data.replayed)
  ) {
    throw new CheckoutClientError('internal')
  }

  return data
}

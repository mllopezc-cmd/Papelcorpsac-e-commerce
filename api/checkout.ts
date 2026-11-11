import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  AuthRequestError,
  verifyBearerRequest,
} from '../server/auth.js'
import { parseCheckoutRequest } from '../server/checkoutValidation.js'
import {
  CheckoutServiceError,
  createCheckoutOrder,
} from '../server/checkoutService.js'
import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminFirestore,
  resolveFirebaseAdminConfiguration,
} from '../server/firebaseAdmin.js'
import type {
  CheckoutErrorResponse,
  CheckoutResponse,
} from '../src/types/checkout.js'

type CheckoutHttpRequest = IncomingMessage & {
  body?: unknown
}

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse
  json: (body: CheckoutResponse) => VercelResponse
}

function sendError(
  response: VercelResponse,
  statusCode: number,
  error: CheckoutErrorResponse['error'],
): void {
  response.status(statusCode).json({
    success: false,
    error,
  })
}

function isJsonRequest(request: CheckoutHttpRequest): boolean {
  const contentType = request.headers['content-type']

  return (
    typeof contentType === 'string' &&
    /^application\/json(?:\s*;|$)/i.test(contentType)
  )
}

function isCheckoutEmulatorEnabled(): boolean {
  if (
    process.env.PAPELCORPSAC_ENABLE_CHECKOUT_EMULATOR !== 'true' ||
    process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080'
  ) {
    return false
  }

  const configuration = resolveFirebaseAdminConfiguration()

  return (
    configuration.emulatorEnabled &&
    configuration.projectId === 'demo-papelcorpsac'
  )
}

export default async function handler(
  request: CheckoutHttpRequest,
  response: VercelResponse,
): Promise<void> {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendError(response, 405, 'Method Not Allowed')
    return
  }

  let uid: string

  try {
    const identity = await verifyBearerRequest(request, {
      checkRevoked: true,
    })

    uid = identity.uid
  } catch (error: unknown) {
    if (error instanceof AuthRequestError) {
      if (error.kind === 'unauthorized') {
        response.setHeader('WWW-Authenticate', 'Bearer')
        sendError(response, 401, 'Unauthorized')
        return
      }

      if (error.kind === 'unavailable') {
        sendError(response, 503, 'Service Unavailable')
        return
      }
    }

    sendError(response, 500, 'Internal Server Error')
    return
  }

  if (!isJsonRequest(request)) {
    sendError(response, 400, 'Invalid Request')
    return
  }

  const checkoutRequest = parseCheckoutRequest(request.body)

  if (!checkoutRequest) {
    sendError(response, 400, 'Invalid Request')
    return
  }

  try {
    if (!isCheckoutEmulatorEnabled()) {
      sendError(response, 503, 'Service Unavailable')
      return
    }

    const db = getFirebaseAdminFirestore()
    const result = await createCheckoutOrder(
      db,
      uid,
      checkoutRequest,
    )

    response.status(result.replayed ? 200 : 201).json(result)
  } catch (error: unknown) {
    if (error instanceof CheckoutServiceError) {
      if (error.kind === 'invalid_request') {
        sendError(response, 400, 'Invalid Request')
        return
      }

      if (
        error.kind === 'product_unavailable' ||
        error.kind === 'insufficient_stock' ||
        error.kind === 'conflict'
      ) {
        sendError(response, 409, 'Conflict')
        return
      }

      sendError(response, 503, 'Service Unavailable')
      return
    }

    if (error instanceof FirebaseAdminConfigurationError) {
      sendError(response, 503, 'Service Unavailable')
      return
    }

    sendError(response, 500, 'Internal Server Error')
  }
}

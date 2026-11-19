import type {
  IncomingMessage,
  ServerResponse,
} from 'node:http'
import {
  AuthRequestError,
  verifyBearerRequest,
} from '../server/auth.js'
import { getFirebaseAdminFirestore } from '../server/firebaseAdmin.js'
import {
  createPresignedRead,
  isValidProductImageKey,
  S3UploadConfigurationError,
  userIsAdmin,
  type ReadImageResult,
} from '../server/s3Upload.js'

type ErrorMessage =
  | 'Method Not Allowed'
  | 'Invalid Request'
  | 'Not Found'
  | 'Service Unavailable'

type ImageResponse =
  | ReadImageResult
  | { error: ErrorMessage }

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse
  json: (body: ImageResponse) => VercelResponse
}

function sendError(
  response: VercelResponse,
  status: number,
  error: ErrorMessage,
): void {
  response.status(status).json({ error })
}

function parseProductId(
  request: IncomingMessage,
): string | null {
  if (!request.url) {
    return null
  }

  try {
    const url = new URL(request.url, 'http://localhost')
    const ids = url.searchParams.getAll('productId')

    if (ids.length !== 1) {
      return null
    }

    const id = ids[0]

    if (
      id.length === 0 ||
      id.length > 1500 ||
      id.trim() !== id ||
      id.includes('/')
    ) {
      return null
    }

    return id
  } catch {
    return null
  }
}

async function hasAdminAccess(
  request: IncomingMessage,
): Promise<boolean> {
  try {
    const identity = await verifyBearerRequest(request, {
      checkRevoked: true,
    })

    return await userIsAdmin(identity.uid)
  } catch (error: unknown) {
    if (
      error instanceof AuthRequestError &&
      error.kind === 'unauthorized'
    ) {
      return false
    }

    throw error
  }
}

export default async function handler(
  request: IncomingMessage,
  response: VercelResponse,
): Promise<void> {
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Referrer-Policy', 'no-referrer')

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    sendError(response, 405, 'Method Not Allowed')
    return
  }

  const productId = parseProductId(request)

  if (!productId) {
    sendError(response, 400, 'Invalid Request')
    return
  }

  try {
    const snapshot = await getFirebaseAdminFirestore()
      .collection('products')
      .doc(productId)
      .get()

    if (!snapshot.exists) {
      sendError(response, 404, 'Not Found')
      return
    }

    const product = snapshot.data()

    if (
      !product ||
      !isValidProductImageKey(product.imageKey)
    ) {
      sendError(response, 404, 'Not Found')
      return
    }

    if (product.published !== true) {
      const allowed = await hasAdminAccess(request)

      if (!allowed) {
        sendError(response, 404, 'Not Found')
        return
      }
    }

    const result = await createPresignedRead(
      product.imageKey,
    )

    response.status(200).json(result)
  } catch (error: unknown) {
    if (error instanceof S3UploadConfigurationError) {
      sendError(response, 503, 'Service Unavailable')
      return
    }

    sendError(response, 503, 'Service Unavailable')
  }
}

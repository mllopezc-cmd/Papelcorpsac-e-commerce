import type {
  IncomingMessage,
  ServerResponse,
} from 'node:http'
import {
  AuthRequestError,
  verifyBearerRequest,
} from '../server/auth.js'
import {
  deleteUnreferencedProductImage,
  isValidProductImageKey,
  ProductImageReferencedError,
  S3UploadConfigurationError,
  userIsAdmin,
} from '../server/s3Upload.js'

type DeleteRequest = IncomingMessage & {
  body?: unknown
}

type ErrorMessage =
  | 'Method Not Allowed'
  | 'Unauthorized'
  | 'Forbidden'
  | 'Invalid Request'
  | 'Image In Use'
  | 'Service Unavailable'

type DeleteResponse =
  | { deleted: true }
  | { error: ErrorMessage }

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse
  json: (body: DeleteResponse) => VercelResponse
}

function sendError(
  response: VercelResponse,
  status: number,
  error: ErrorMessage,
): void {
  response.status(status).json({ error })
}

function isJsonRequest(request: DeleteRequest): boolean {
  const contentType = request.headers['content-type']

  return (
    typeof contentType === 'string' &&
    /^application\/json(?:\s*;|$)/i.test(contentType)
  )
}

function parseDeleteRequest(value: unknown): string | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return null
  }

  const input = value as Record<string, unknown>
  const keys = Object.keys(input)

  if (
    keys.length !== 1 ||
    keys[0] !== 'key' ||
    !isValidProductImageKey(input.key)
  ) {
    return null
  }

  return input.key
}

export default async function handler(
  request: DeleteRequest,
  response: VercelResponse,
): Promise<void> {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'DELETE') {
    response.setHeader('Allow', 'DELETE')
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
    if (
      error instanceof AuthRequestError &&
      error.kind === 'unauthorized'
    ) {
      response.setHeader('WWW-Authenticate', 'Bearer')
      sendError(response, 401, 'Unauthorized')
      return
    }

    sendError(response, 503, 'Service Unavailable')
    return
  }

  try {
    if (!(await userIsAdmin(uid))) {
      sendError(response, 403, 'Forbidden')
      return
    }

    if (!isJsonRequest(request)) {
      sendError(response, 400, 'Invalid Request')
      return
    }

    const key = parseDeleteRequest(request.body)

    if (key === null) {
      sendError(response, 400, 'Invalid Request')
      return
    }

    await deleteUnreferencedProductImage(key)

    response.status(200).json({ deleted: true })
  } catch (error: unknown) {
    if (error instanceof ProductImageReferencedError) {
      sendError(response, 409, 'Image In Use')
      return
    }

    if (error instanceof S3UploadConfigurationError) {
      sendError(response, 503, 'Service Unavailable')
      return
    }

    sendError(response, 503, 'Service Unavailable')
  }
}

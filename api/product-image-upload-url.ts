import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  AuthRequestError,
  verifyBearerRequest,
} from '../server/auth.js'
import {
  createPresignedUpload,
  parseUploadImageInput,
  S3UploadConfigurationError,
  userIsAdmin,
  type UploadImageResult,
} from '../server/s3Upload.js'

type UploadRequest = IncomingMessage & {
  body?: unknown
}

type ErrorMessage =
  | 'Method Not Allowed'
  | 'Unauthorized'
  | 'Forbidden'
  | 'Invalid Request'
  | 'Service Unavailable'

type UploadResponse =
  | UploadImageResult
  | { error: ErrorMessage }

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse
  json: (body: UploadResponse) => VercelResponse
}

function sendError(
  response: VercelResponse,
  status: number,
  error: ErrorMessage,
): void {
  response.status(status).json({ error })
}

function isJsonRequest(request: UploadRequest): boolean {
  const contentType = request.headers['content-type']

  return (
    typeof contentType === 'string' &&
    /^application\/json(?:\s*;|$)/i.test(contentType)
  )
}

export default async function handler(
  request: UploadRequest,
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

    const input = parseUploadImageInput(request.body)

    if (!input) {
      sendError(response, 400, 'Invalid Request')
      return
    }

    const result = await createPresignedUpload(input)

    response.status(200).json(result)
  } catch (error: unknown) {
    if (error instanceof S3UploadConfigurationError) {
      sendError(response, 503, 'Service Unavailable')
      return
    }

    sendError(response, 503, 'Service Unavailable')
  }
}

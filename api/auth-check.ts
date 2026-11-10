import type { IncomingMessage, ServerResponse } from 'node:http'
import { AuthRequestError, verifyBearerRequest } from '../server/auth.js'

type AuthCheckResponse =
  | { authenticated: true }
  | { error: AuthCheckError }

type AuthCheckError =
  | 'Unauthorized'
  | 'Internal Server Error'
  | 'Service Unavailable'
  | 'Method Not Allowed'

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse
  json: (body: AuthCheckResponse) => VercelResponse
}

function sendError(
  response: VercelResponse,
  status: number,
  error: AuthCheckError,
): void {
  response.status(status).json({ error })
}

export default async function handler(
  request: IncomingMessage,
  response: VercelResponse,
): Promise<void> {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    sendError(response, 405, 'Method Not Allowed')
    return
  }

  try {
    await verifyBearerRequest(request)
    response.status(200).json({ authenticated: true })
  } catch (error: unknown) {
    if (!(error instanceof AuthRequestError)) {
      sendError(response, 500, 'Internal Server Error')
      return
    }

    if (error.kind === 'unauthorized') {
      response.setHeader('WWW-Authenticate', 'Bearer')
      sendError(response, 401, 'Unauthorized')
      return
    }

    if (error.kind === 'unavailable') {
      sendError(response, 503, 'Service Unavailable')
      return
    }

    sendError(response, 500, 'Internal Server Error')
  }
}

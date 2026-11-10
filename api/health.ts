import type { IncomingMessage, ServerResponse } from 'node:http'

type HealthResponse = {
  status: 'ok'
  service: 'papelcorpsac-api'
}

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse
  json: (body: HealthResponse | { error: string }) => VercelResponse
}

const healthResponse: HealthResponse = {
  status: 'ok',
  service: 'papelcorpsac-api',
}

export default function handler(
  request: IncomingMessage,
  response: VercelResponse,
): void {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  response.status(200).json(healthResponse)
}

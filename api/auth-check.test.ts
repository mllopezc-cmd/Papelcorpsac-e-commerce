import { beforeEach, describe, expect, it, vi } from 'vitest'

const { verifyBearerRequestMock } = vi.hoisted(() => ({
  verifyBearerRequestMock: vi.fn(),
}))

vi.mock('../server/auth.js', () => ({
  AuthRequestError: class AuthRequestError extends Error {
    constructor(readonly kind: string) {
      super(kind)
    }
  },
  verifyBearerRequest: verifyBearerRequestMock,
}))

import handler from './auth-check.js'
import { AuthRequestError } from '../server/auth.js'

function createResponse() {
  const headers = new Map<string, string>()
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    setHeader(name: string, value: string) {
      headers.set(name.toLowerCase(), value)
      return this
    },
    status(statusCode: number) {
      this.statusCode = statusCode
      return this
    },
    json(body: unknown) {
      this.body = body
      return this
    },
  }
  return { response: response as never, headers, result: response }
}

function createRequest(method: string) {
  return { method } as never
}

beforeEach(() => {
  vi.clearAllMocks()
  verifyBearerRequestMock.mockResolvedValue({ uid: 'private-user' })
})

describe('GET /api/auth-check', () => {
  it('returns only a generic authenticated response', async () => {
    const { response, headers, result } = createResponse()

    await handler(createRequest('GET'), response)

    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual({ authenticated: true })
    expect(verifyBearerRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET' }),
    )
    expect(verifyBearerRequestMock).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(result.body)).not.toMatch(
      /private-user|private@example\.test|Bearer |claims/i,
    )
    expect(headers.get('cache-control')).toBe('no-store')
  })

  it('rejects non-GET requests and advertises the allowed method', async () => {
    const { response, headers, result } = createResponse()

    await handler(createRequest('POST'), response)

    expect(result.statusCode).toBe(405)
    expect(headers.get('allow')).toBe('GET')
    expect(headers.get('cache-control')).toBe('no-store')
    expect(verifyBearerRequestMock).not.toHaveBeenCalled()
  })

  it('returns a generic 401 with a Bearer challenge', async () => {
    verifyBearerRequestMock.mockRejectedValue(new AuthRequestError('unauthorized'))
    const { response, headers, result } = createResponse()

    await handler(createRequest('GET'), response)

    expect(result.statusCode).toBe(401)
    expect(result.body).toEqual({ error: 'Unauthorized' })
    expect(headers.get('www-authenticate')).toBe('Bearer')
    expect(headers.get('cache-control')).toBe('no-store')
    expect(JSON.stringify(result.body)).not.toMatch(
      /private-user|private@example\.test|header\.payload\.signature|claims/i,
    )
  })

  it.each([
    ['configuration', 500, { error: 'Internal Server Error' }],
    ['internal', 500, { error: 'Internal Server Error' }],
    ['unavailable', 503, { error: 'Service Unavailable' }],
  ] as const)(
    'returns a safe status for %s failures',
    async (kind, expectedStatus, expectedBody) => {
      verifyBearerRequestMock.mockRejectedValue(new AuthRequestError(kind))
      const { response, headers, result } = createResponse()

      await handler(createRequest('GET'), response)

      expect(result.statusCode).toBe(expectedStatus)
      expect(result.body).toEqual(expectedBody)
      expect(headers.get('cache-control')).toBe('no-store')
      expect(JSON.stringify(result.body)).not.toMatch(
        /private-user|private@example\.test|header\.payload\.signature|claims/i,
      )
    },
  )
})

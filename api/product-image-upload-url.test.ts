import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  AuthRequestError,
  verifyBearerRequest,
} from '../server/auth.js'
import {
  createPresignedUpload,
  userIsAdmin,
} from '../server/s3Upload.js'
import handler from './product-image-upload-url.js'

vi.mock('../server/auth.js', () => ({
  AuthRequestError: class AuthRequestError extends Error {
    constructor(readonly kind: string) {
      super(kind)
    }
  },
  verifyBearerRequest: vi.fn(),
}))

vi.mock('../server/s3Upload.js', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../server/s3Upload.js')>()

  return {
    ...original,
    userIsAdmin: vi.fn(),
    createPresignedUpload: vi.fn(),
  }
})

const mockVerify = vi.mocked(verifyBearerRequest)
const mockAdmin = vi.mocked(userIsAdmin)
const mockUpload = vi.mocked(createPresignedUpload)

function createRequest(
  method = 'POST',
  body: unknown = {
    contentType: 'image/jpeg',
    size: 1024,
  },
  contentType = 'application/json',
) {
  return {
    method,
    body,
    headers: {
      'content-type': contentType,
    },
  } as unknown as Parameters<typeof handler>[0]
}

function createResponse() {
  let statusCode = 200
  let body: unknown

  const headers: Record<string, string> = {}

  const response = {
    setHeader(name: string, value: string) {
      headers[name] = value
      return this
    },
    status(code: number) {
      statusCode = code
      return this
    },
    json(value: unknown) {
      body = value
      return this
    },
  } as unknown as Parameters<typeof handler>[1]

  return {
    response,
    result: () => ({
      statusCode,
      body,
      headers,
    }),
  }
}

beforeEach(() => {
  mockVerify.mockResolvedValue({ uid: 'admin-uid' })
  mockAdmin.mockResolvedValue(true)
  mockUpload.mockResolvedValue({
    url: 'https://example.com/presigned-put',
    key: 'products/example.jpg',
    contentType: 'image/jpeg',
    expiresIn: 60,
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/product-image-upload-url', () => {
  it('rejects unsupported methods', async () => {
    const { response, result } = createResponse()

    await handler(createRequest('GET'), response)

    expect(result().statusCode).toBe(405)
    expect(result().headers.Allow).toBe('POST')
    expect(mockVerify).not.toHaveBeenCalled()
  })

  it('rejects requests without a valid token', async () => {
    mockVerify.mockRejectedValue(
      new AuthRequestError('unauthorized'),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(401)
    expect(result().headers['WWW-Authenticate']).toBe('Bearer')
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('rejects a customer', async () => {
    mockAdmin.mockResolvedValue(false)

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(403)
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('rejects unsupported content types', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest(
        'POST',
        { contentType: 'image/jpeg', size: 1024 },
        'text/plain',
      ),
      response,
    )

    expect(result().statusCode).toBe(400)
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('rejects invalid image metadata', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest('POST', {
        contentType: 'image/svg+xml',
        size: 1024,
      }),
      response,
    )

    expect(result().statusCode).toBe(400)
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('rejects oversized images', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest('POST', {
        contentType: 'image/jpeg',
        size: 6 * 1024 * 1024,
      }),
      response,
    )

    expect(result().statusCode).toBe(400)
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('returns the signed URL for admin', async () => {
    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(200)
    expect(result().body).toEqual({
      url: 'https://example.com/presigned-put',
      key: 'products/example.jpg',
      contentType: 'image/jpeg',
      expiresIn: 60,
    })

    expect(result().headers['Cache-Control']).toBe('no-store')
    expect(mockVerify).toHaveBeenCalledWith(
      expect.anything(),
      { checkRevoked: true },
    )
    expect(mockAdmin).toHaveBeenCalledWith('admin-uid')
  })

  it('does not expose internal failures', async () => {
    mockUpload.mockRejectedValue(
      new Error('Sensitive AWS details'),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(503)
    expect(result().body).toEqual({
      error: 'Service Unavailable',
    })
  })
})

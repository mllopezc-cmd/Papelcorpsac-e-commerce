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
  deleteUnreferencedProductImage,
  ProductImageReferencedError,
  S3UploadConfigurationError,
  userIsAdmin,
} from '../server/s3Upload.js'
import handler from './product-image-delete.js'

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
    deleteUnreferencedProductImage: vi.fn(),
  }
})

const mockVerify = vi.mocked(verifyBearerRequest)
const mockAdmin = vi.mocked(userIsAdmin)
const mockDelete = vi.mocked(deleteUnreferencedProductImage)

const imageKey =
  'products/11111111-1111-4111-8111-111111111111.jpg'

function createRequest(
  method = 'DELETE',
  body: unknown = { key: imageKey },
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
  mockDelete.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('DELETE /api/product-image-delete', () => {
  it('rejects unsupported methods', async () => {
    const { response, result } = createResponse()

    await handler(createRequest('GET'), response)

    expect(result().statusCode).toBe(405)
    expect(result().headers.Allow).toBe('DELETE')
    expect(mockVerify).not.toHaveBeenCalled()
  })

  it('rejects an invalid or missing token', async () => {
    mockVerify.mockRejectedValue(
      new AuthRequestError('unauthorized'),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(401)
    expect(result().headers['WWW-Authenticate']).toBe('Bearer')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('rejects a customer', async () => {
    mockAdmin.mockResolvedValue(false)

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(403)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('rejects requests with unsupported content types', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest(
        'DELETE',
        { key: imageKey },
        'text/plain',
      ),
      response,
    )

    expect(result().statusCode).toBe(400)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it.each([
    null,
    [],
    {},
    { key: 'products/imagen.jpg' },
    { key: '../outside.jpg' },
    { key: imageKey, extra: true },
    { key: 123 },
  ])('rejects invalid input %#', async (body) => {
    const { response, result } = createResponse()

    await handler(createRequest('DELETE', body), response)

    expect(result().statusCode).toBe(400)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('deletes an unreferenced image for Admin', async () => {
    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(200)
    expect(result().body).toEqual({ deleted: true })
    expect(result().headers['Cache-Control']).toBe('no-store')

    expect(mockVerify).toHaveBeenCalledWith(
      expect.anything(),
      { checkRevoked: true },
    )

    expect(mockAdmin).toHaveBeenCalledWith('admin-uid')
    expect(mockDelete).toHaveBeenCalledWith(imageKey)
  })

  it('rejects an image that is still in use', async () => {
    mockDelete.mockRejectedValue(
      new ProductImageReferencedError(),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(409)
    expect(result().body).toEqual({
      error: 'Image In Use',
    })
  })

  it('does not expose AWS configuration errors', async () => {
    mockDelete.mockRejectedValue(
      new S3UploadConfigurationError(),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(503)
    expect(result().body).toEqual({
      error: 'Service Unavailable',
    })
  })

  it('does not expose unexpected internal errors', async () => {
    mockDelete.mockRejectedValue(
      new Error('Sensitive AWS details'),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(503)
    expect(result().body).toEqual({
      error: 'Service Unavailable',
    })
  })

  it('does not expose Firebase verification failures', async () => {
    mockVerify.mockRejectedValue(
      new AuthRequestError('unavailable'),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(503)
    expect(mockDelete).not.toHaveBeenCalled()
  })
})

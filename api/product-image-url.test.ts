import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const {
  firestoreMock,
  verifyMock,
  adminMock,
  readMock,
} = vi.hoisted(() => ({
  firestoreMock: vi.fn(),
  verifyMock: vi.fn(),
  adminMock: vi.fn(),
  readMock: vi.fn(),
}))

vi.mock('../server/firebaseAdmin.js', () => ({
  getFirebaseAdminFirestore: firestoreMock,
}))

vi.mock('../server/auth.js', () => ({
  AuthRequestError: class AuthRequestError extends Error {
    constructor(readonly kind: string) {
      super(kind)
    }
  },
  verifyBearerRequest: verifyMock,
}))

vi.mock('../server/s3Upload.js', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../server/s3Upload.js')>()

  return {
    ...original,
    createPresignedRead: readMock,
    userIsAdmin: adminMock,
  }
})

import { AuthRequestError } from '../server/auth.js'
import handler from './product-image-url.js'

const key =
  'products/11111111-1111-4111-8111-111111111111.webp'

function createRequest(
  url = '/api/product-image-url?productId=product-001',
  method = 'GET',
) {
  return {
    url,
    method,
  } as Parameters<typeof handler>[0]
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

function mockProduct(
  data: Record<string, unknown> | null,
) {
  const get = vi.fn().mockResolvedValue({
    exists: data !== null,
    data: () => data ?? undefined,
  })

  const doc = vi.fn().mockReturnValue({ get })
  const collection = vi.fn().mockReturnValue({ doc })

  firestoreMock.mockReturnValue({ collection })

  return { get, doc, collection }
}

beforeEach(() => {
  vi.clearAllMocks()

  mockProduct({
    imageKey: key,
    published: true,
  })

  verifyMock.mockResolvedValue({ uid: 'admin-001' })
  adminMock.mockResolvedValue(true)

  readMock.mockResolvedValue({
    url: 'https://example.com/presigned-get',
    expiresIn: 60,
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('GET /api/product-image-url', () => {
  it('rechaza métodos distintos de GET', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest(undefined, 'POST'),
      response,
    )

    expect(result().statusCode).toBe(405)
    expect(result().headers.Allow).toBe('GET')
    expect(firestoreMock).not.toHaveBeenCalled()
  })

  it('rechaza identificadores ausentes', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest('/api/product-image-url'),
      response,
    )

    expect(result().statusCode).toBe(400)
    expect(firestoreMock).not.toHaveBeenCalled()
  })

  it('rechaza identificadores duplicados', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest(
        '/api/product-image-url?productId=a&productId=b',
      ),
      response,
    )

    expect(result().statusCode).toBe(400)
    expect(firestoreMock).not.toHaveBeenCalled()
  })

  it('rechaza rutas dentro del identificador', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest(
        '/api/product-image-url?productId=a%2Fb',
      ),
      response,
    )

    expect(result().statusCode).toBe(400)
    expect(firestoreMock).not.toHaveBeenCalled()
  })

  it('permite leer imágenes de productos publicados', async () => {
    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(200)
    expect(result().body).toEqual({
      url: 'https://example.com/presigned-get',
      expiresIn: 60,
    })

    expect(result().headers['Cache-Control']).toBe('no-store')
    expect(readMock).toHaveBeenCalledWith(key)
    expect(verifyMock).not.toHaveBeenCalled()
  })

  it('no genera URL cuando el producto no existe', async () => {
    mockProduct(null)

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(404)
    expect(readMock).not.toHaveBeenCalled()
  })

  it('no genera URL cuando falta imageKey', async () => {
    mockProduct({ published: true })

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(404)
    expect(readMock).not.toHaveBeenCalled()
  })

  it('rechaza una clave S3 inválida', async () => {
    mockProduct({
      imageKey: '../private/file.jpg',
      published: true,
    })

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(404)
    expect(readMock).not.toHaveBeenCalled()
  })

  it('autoriza la lectura administrativa', async () => {
    mockProduct({
      imageKey: key,
      published: false,
    })

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(200)
    expect(verifyMock).toHaveBeenCalledWith(
      expect.anything(),
      { checkRevoked: true },
    )
    expect(adminMock).toHaveBeenCalledWith('admin-001')
    expect(readMock).toHaveBeenCalledWith(key)
  })

  it('no permite a un cliente leer una imagen privada', async () => {
    mockProduct({
      imageKey: key,
      published: false,
    })

    adminMock.mockResolvedValue(false)

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(404)
    expect(readMock).not.toHaveBeenCalled()
  })

  it('no permite acceso anónimo a imágenes privadas', async () => {
    mockProduct({
      imageKey: key,
      published: false,
    })

    verifyMock.mockRejectedValue(
      new AuthRequestError('unauthorized'),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(404)
    expect(readMock).not.toHaveBeenCalled()
  })

  it('oculta errores internos de Firestore', async () => {
    firestoreMock.mockImplementation(() => {
      throw new Error('Sensitive Firebase details')
    })

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result().statusCode).toBe(503)
    expect(result().body).toEqual({
      error: 'Service Unavailable',
    })
    expect(readMock).not.toHaveBeenCalled()
  })

  it('oculta errores internos del firmador AWS', async () => {
    readMock.mockRejectedValue(
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

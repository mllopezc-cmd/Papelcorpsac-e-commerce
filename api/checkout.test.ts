import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  verifyBearerRequestMock,
  createCheckoutOrderMock,
  getFirebaseAdminFirestoreMock,
  resolveFirebaseAdminConfigurationMock,
} = vi.hoisted(() => ({
  verifyBearerRequestMock: vi.fn(),
  createCheckoutOrderMock: vi.fn(),
  getFirebaseAdminFirestoreMock: vi.fn(),
  resolveFirebaseAdminConfigurationMock: vi.fn(),
}))

vi.mock('../server/auth.js', () => ({
  AuthRequestError: class AuthRequestError extends Error {
    constructor(readonly kind: string) {
      super(kind)
    }
  },
  verifyBearerRequest: verifyBearerRequestMock,
}))

vi.mock('../server/checkoutService.js', () => ({
  CheckoutServiceError: class CheckoutServiceError extends Error {
    constructor(readonly kind: string) {
      super(kind)
    }
  },
  createCheckoutOrder: createCheckoutOrderMock,
}))

vi.mock('../server/firebaseAdmin.js', () => ({
  FirebaseAdminConfigurationError:
    class FirebaseAdminConfigurationError extends Error {
      constructor() {
        super('configuration')
      }
    },
  getFirebaseAdminFirestore: getFirebaseAdminFirestoreMock,
  resolveFirebaseAdminConfiguration:
    resolveFirebaseAdminConfigurationMock,
}))

import handler from './checkout.js'
import { AuthRequestError } from '../server/auth.js'
import { CheckoutServiceError } from '../server/checkoutService.js'
import { FirebaseAdminConfigurationError } from '../server/firebaseAdmin.js'

const validKey = 'c1b8d7e3-96f2-4a51-a82b-3278a0c99421'
const mockFirestore = { type: 'firestore-test-double' }

function validRequest() {
  return {
    idempotencyKey: validKey,
    items: [{ productId: 'producto-001', quantity: 2 }],
  }
}

function createRequest(
  method = 'POST',
  body?: unknown,
  contentType: string | null = 'application/json',
) {
  const requestBody = arguments.length < 2 ? validRequest() : body

  return {
    method,
    body: requestBody,
    headers:
      contentType === null
        ? {}
        : { 'content-type': contentType },
    rawHeaders: [],
  } as never
}

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

  return {
    response: response as never,
    headers,
    result: response,
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  vi.stubEnv('PAPELCORPSAC_ENABLE_CHECKOUT_EMULATOR', 'true')
  vi.stubEnv('FIRESTORE_EMULATOR_HOST', '127.0.0.1:8080')

  verifyBearerRequestMock.mockResolvedValue({
    uid: 'customer-1',
  })

  resolveFirebaseAdminConfigurationMock.mockReturnValue({
    projectId: 'demo-papelcorpsac',
    emulatorEnabled: true,
  })

  getFirebaseAdminFirestoreMock.mockReturnValue(mockFirestore)

  createCheckoutOrderMock.mockResolvedValue({
    success: true,
    order: {
      id: 'order-001',
      status: 'pending',
      currency: 'PEN',
      totalCents: 2500,
    },
    replayed: false,
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('POST /api/checkout', () => {
  it('rechaza métodos distintos de POST', async () => {
    const { response, result, headers } = createResponse()

    await handler(createRequest('GET'), response)

    expect(result.statusCode).toBe(405)
    expect(result.body).toEqual({
      success: false,
      error: 'Method Not Allowed',
    })
    expect(headers.get('allow')).toBe('POST')
    expect(headers.get('cache-control')).toBe('no-store')
    expect(verifyBearerRequestMock).not.toHaveBeenCalled()
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('verifica el token y comprueba su revocación', async () => {
    const { response, result } = createResponse()
    const request = createRequest()

    await handler(request, response)

    expect(result.statusCode).toBe(201)
    expect(verifyBearerRequestMock).toHaveBeenCalledWith(
      request,
      { checkRevoked: true },
    )
    expect(verifyBearerRequestMock).toHaveBeenCalledTimes(1)
  })

  it('crea una orden y responde HTTP 201', async () => {
    const { response, result, headers } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(201)
    expect(result.body).toEqual({
      success: true,
      order: {
        id: 'order-001',
        status: 'pending',
        currency: 'PEN',
        totalCents: 2500,
      },
      replayed: false,
    })
    expect(headers.get('cache-control')).toBe('no-store')
    expect(getFirebaseAdminFirestoreMock).toHaveBeenCalledTimes(1)
    expect(createCheckoutOrderMock).toHaveBeenCalledWith(
      mockFirestore,
      'customer-1',
      validRequest(),
    )
  })

  it('responde HTTP 200 ante un reintento idempotente', async () => {
    createCheckoutOrderMock.mockResolvedValue({
      success: true,
      order: {
        id: 'order-001',
        status: 'pending',
        currency: 'PEN',
        totalCents: 2500,
      },
      replayed: true,
    })

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(200)
    expect(result.body).toMatchObject({
      success: true,
      replayed: true,
      order: {
        id: 'order-001',
      },
    })
  })

  it('rechaza un token inválido con HTTP 401', async () => {
    verifyBearerRequestMock.mockRejectedValue(
      new AuthRequestError('unauthorized'),
    )

    const { response, result, headers } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(401)
    expect(result.body).toEqual({
      success: false,
      error: 'Unauthorized',
    })
    expect(headers.get('www-authenticate')).toBe('Bearer')
    expect(getFirebaseAdminFirestoreMock).not.toHaveBeenCalled()
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('responde HTTP 503 si falla temporalmente la autenticación', async () => {
    verifyBearerRequestMock.mockRejectedValue(
      new AuthRequestError('unavailable'),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(503)
    expect(result.body).toEqual({
      success: false,
      error: 'Service Unavailable',
    })
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it.each(['configuration', 'internal'] as const)(
    'responde HTTP 500 ante un fallo de autenticación %s',
    async (kind) => {
      verifyBearerRequestMock.mockRejectedValue(
        new AuthRequestError(kind),
      )

      const { response, result } = createResponse()

      await handler(createRequest(), response)

      expect(result.statusCode).toBe(500)
      expect(result.body).toEqual({
        success: false,
        error: 'Internal Server Error',
      })
      expect(createCheckoutOrderMock).not.toHaveBeenCalled()
    },
  )

  it('rechaza solicitudes sin Content-Type JSON', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest('POST', validRequest(), null),
      response,
    )

    expect(result.statusCode).toBe(400)
    expect(result.body).toEqual({
      success: false,
      error: 'Invalid Request',
    })
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('rechaza un tipo de contenido incorrecto', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest('POST', validRequest(), 'text/plain'),
      response,
    )

    expect(result.statusCode).toBe(400)
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('acepta JSON con charset UTF-8', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest(
        'POST',
        validRequest(),
        'application/json; charset=utf-8',
      ),
      response,
    )

    expect(result.statusCode).toBe(201)
  })

  it.each([
    ['ausente', undefined],
    ['null', null],
    ['cadena', '{"items":[]}'],
    ['arreglo', []],
    ['carrito vacío', { idempotencyKey: validKey, items: [] }],
  ])('rechaza un cuerpo %s', async (_description, body) => {
    const { response, result } = createResponse()

    await handler(createRequest('POST', body), response)

    expect(result.statusCode).toBe(400)
    expect(result.body).toEqual({
      success: false,
      error: 'Invalid Request',
    })
    expect(getFirebaseAdminFirestoreMock).not.toHaveBeenCalled()
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('rechaza un propietario enviado por el cliente', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest('POST', {
        ...validRequest(),
        userId: 'otro-usuario',
      }),
      response,
    )

    expect(result.statusCode).toBe(400)
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('rechaza un total enviado por el cliente', async () => {
    const { response, result } = createResponse()

    await handler(
      createRequest('POST', {
        ...validRequest(),
        totalCents: 1,
      }),
      response,
    )

    expect(result.statusCode).toBe(400)
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('no ejecuta compras cuando falta la habilitación explícita', async () => {
    vi.stubEnv('PAPELCORPSAC_ENABLE_CHECKOUT_EMULATOR', '')

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(503)
    expect(result.body).toEqual({
      success: false,
      error: 'Service Unavailable',
    })
    expect(getFirebaseAdminFirestoreMock).not.toHaveBeenCalled()
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('rechaza un host de Firestore Emulator distinto', async () => {
    vi.stubEnv('FIRESTORE_EMULATOR_HOST', 'localhost:8080')

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(503)
    expect(getFirebaseAdminFirestoreMock).not.toHaveBeenCalled()
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('rechaza un proyecto distinto al de demostración', async () => {
    resolveFirebaseAdminConfigurationMock.mockReturnValue({
      projectId: 'proyecto-real',
      emulatorEnabled: false,
    })

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(503)
    expect(getFirebaseAdminFirestoreMock).not.toHaveBeenCalled()
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('rechaza la configuración de demostración incompleta', async () => {
    resolveFirebaseAdminConfigurationMock.mockImplementation(() => {
      throw new FirebaseAdminConfigurationError()
    })

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(503)
    expect(result.body).toEqual({
      success: false,
      error: 'Service Unavailable',
    })
    expect(getFirebaseAdminFirestoreMock).not.toHaveBeenCalled()
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it('no compra si falla la configuración de Firestore Admin', async () => {
    getFirebaseAdminFirestoreMock.mockImplementation(() => {
      throw new FirebaseAdminConfigurationError()
    })

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(503)
    expect(result.body).toEqual({
      success: false,
      error: 'Service Unavailable',
    })
    expect(createCheckoutOrderMock).not.toHaveBeenCalled()
  })

  it.each([
    ['invalid_request', 400, 'Invalid Request'],
    ['product_unavailable', 409, 'Conflict'],
    ['insufficient_stock', 409, 'Conflict'],
    ['conflict', 409, 'Conflict'],
    ['unavailable', 503, 'Service Unavailable'],
  ] as const)(
    'responde correctamente al error comercial %s',
    async (kind, expectedStatus, expectedError) => {
      createCheckoutOrderMock.mockRejectedValue(
        new CheckoutServiceError(kind),
      )

      const { response, result } = createResponse()

      await handler(createRequest(), response)

      expect(result.statusCode).toBe(expectedStatus)
      expect(result.body).toEqual({
        success: false,
        error: expectedError,
      })
    },
  )

  it('oculta los detalles de errores internos inesperados', async () => {
    createCheckoutOrderMock.mockRejectedValue(
      new Error('Token privado y datos internos'),
    )

    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(500)
    expect(result.body).toEqual({
      success: false,
      error: 'Internal Server Error',
    })
    expect(JSON.stringify(result.body)).not.toMatch(
      /Token privado|datos internos|customer-1/i,
    )
  })

  it('no devuelve el UID del usuario en una compra correcta', async () => {
    const { response, result } = createResponse()

    await handler(createRequest(), response)

    expect(result.statusCode).toBe(201)
    expect(JSON.stringify(result.body)).not.toContain('customer-1')
  })
})

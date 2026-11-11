import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from 'firebase/auth'
import type { CheckoutRequest } from '../types/checkout'

const { getIdTokenMock } = vi.hoisted(() => ({
  getIdTokenMock: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getIdToken: getIdTokenMock,
}))

import {
  CheckoutClientError,
  submitCheckout,
} from './checkoutService'

const mockUser = {
  uid: 'customer-test-001',
} as User

const validKey = 'c1b8d7e3-96f2-4a51-a82b-3278a0c99421'

function validRequest(): CheckoutRequest {
  return {
    idempotencyKey: validKey,
    items: [
      {
        productId: 'producto-001',
        quantity: 2,
      },
    ],
  }
}

function validOrder() {
  return {
    id: 'orden-test-001',
    status: 'pending',
    currency: 'PEN',
    totalCents: 2500,
  }
}

function successfulBody(replayed = false) {
  return {
    success: true,
    order: validOrder(),
    replayed,
  }
}

function jsonResponse(
  body: unknown,
  status = 201,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const fetchMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)

  getIdTokenMock.mockResolvedValue('firebase-test-token')

  fetchMock.mockResolvedValue(
    jsonResponse(successfulBody()),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('submitCheckout', () => {
  it('obtiene el ID token del usuario autenticado', async () => {
    await submitCheckout(mockUser, validRequest())

    expect(getIdTokenMock).toHaveBeenCalledTimes(1)
    expect(getIdTokenMock).toHaveBeenCalledWith(mockUser)
  })

  it('envía una solicitud POST al endpoint correcto', async () => {
    await submitCheckout(mockUser, validRequest())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('incluye el token en Authorization Bearer', async () => {
    await submitCheckout(mockUser, validRequest())

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-test-token',
        }),
      }),
    )
  })

  it('envía el cuerpo como JSON', async () => {
    const request = validRequest()

    await submitCheckout(mockUser, request)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(request),
      }),
    )
  })

  it('solo envía identificadores, cantidades y clave de idempotencia', async () => {
    await submitCheckout(mockUser, validRequest())

    const options = fetchMock.mock.calls[0][1] as RequestInit
    const body: unknown = JSON.parse(options.body as string)

    expect(body).toEqual({
      idempotencyKey: validKey,
      items: [
        {
          productId: 'producto-001',
          quantity: 2,
        },
      ],
    })

    expect(JSON.stringify(body)).not.toMatch(
      /customer-test-001|userId|uid|price|totalCents|stock/i,
    )
  })

  it('deshabilita el almacenamiento HTTP en caché', async () => {
    await submitCheckout(mockUser, validRequest())

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({
        cache: 'no-store',
      }),
    )
  })

  it('acepta una orden nueva con HTTP 201', async () => {
    const result = await submitCheckout(
      mockUser,
      validRequest(),
    )

    expect(result).toEqual(successfulBody(false))
  })

  it('acepta un reintento idempotente con HTTP 200', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(successfulBody(true), 200),
    )

    const result = await submitCheckout(
      mockUser,
      validRequest(),
    )

    expect(result).toEqual(successfulBody(true))
  })

  it('conserva el importe confirmado por el servidor', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        order: {
          ...validOrder(),
          totalCents: 3750,
        },
        replayed: false,
      }),
    )

    const result = await submitCheckout(
      mockUser,
      validRequest(),
    )

    expect(result.order.totalCents).toBe(3750)
  })

  it('rechaza la operación si falla la obtención del token', async () => {
    getIdTokenMock.mockRejectedValue(
      new Error('Firebase Authentication unavailable'),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      name: 'CheckoutClientError',
      kind: 'unauthorized',
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rechaza la operación cuando falla la conexión HTTP', async () => {
    fetchMock.mockRejectedValue(
      new TypeError('Failed to fetch'),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      name: 'CheckoutClientError',
      kind: 'unavailable',
    })
  })

  it.each([
    [400, 'invalid_request'],
    [401, 'unauthorized'],
    [409, 'conflict'],
    [503, 'unavailable'],
    [500, 'internal'],
    [405, 'internal'],
  ] as const)(
    'convierte HTTP %i en el error %s',
    async (status, expectedKind) => {
      fetchMock.mockResolvedValue(
        jsonResponse(
          {
            success: false,
            error: 'Error de prueba',
          },
          status,
        ),
      )

      await expect(
        submitCheckout(mockUser, validRequest()),
      ).rejects.toMatchObject({
        name: 'CheckoutClientError',
        kind: expectedKind,
      })
    },
  )

  it('rechaza una respuesta HTTP 202 aunque sea exitosa', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(successfulBody(), 202),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza una respuesta sin Content-Type JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(successfulBody()), {
        status: 201,
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza una respuesta JSON malformada', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"success":', {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza una respuesta JSON null', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(null),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza una respuesta que indica success false', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: false,
        order: validOrder(),
        replayed: false,
      }),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza una respuesta sin orden', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        replayed: false,
      }),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza una orden sin identificador válido', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        order: {
          ...validOrder(),
          id: '',
        },
        replayed: false,
      }),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza un estado de orden no admitido', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        order: {
          ...validOrder(),
          status: 'completed',
        },
        replayed: false,
      }),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza una moneda diferente de PEN', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        order: {
          ...validOrder(),
          currency: 'USD',
        },
        replayed: false,
      }),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it.each([
    ['cero', 0],
    ['negativo', -100],
    ['decimal', 12.5],
    ['inseguro', Number.MAX_SAFE_INTEGER + 1],
    ['cadena', '2500'],
    ['ausente', undefined],
  ])(
    'rechaza un total %s',
    async (_description, totalCents) => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          success: true,
          order: {
            ...validOrder(),
            totalCents,
          },
          replayed: false,
        }),
      )

      await expect(
        submitCheckout(mockUser, validRequest()),
      ).rejects.toMatchObject({
        kind: 'internal',
      })
    },
  )

  it('rechaza una respuesta sin indicador de reintento', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        order: validOrder(),
      }),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza HTTP 201 cuando replayed es true', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(successfulBody(true), 201),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('rechaza HTTP 200 cuando replayed es false', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(successfulBody(false), 200),
    )

    await expect(
      submitCheckout(mockUser, validRequest()),
    ).rejects.toMatchObject({
      kind: 'internal',
    })
  })

  it('utiliza CheckoutClientError para representar errores conocidos', () => {
    const error = new CheckoutClientError('conflict')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('CheckoutClientError')
    expect(error.kind).toBe('conflict')
    expect(error.message).toBe('conflict')
  })
})

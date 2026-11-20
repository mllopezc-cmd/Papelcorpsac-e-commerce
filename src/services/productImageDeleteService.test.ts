/**
 * @vitest-environment jsdom
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { User } from 'firebase/auth'

const { getIdTokenMock } = vi.hoisted(() => ({
  getIdTokenMock: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getIdToken: getIdTokenMock,
}))

import { deleteProductImage } from './productImageDeleteService'

const admin = { uid: 'admin-test' } as User

const key =
  'products/11111111-1111-4111-8111-111111111111.jpg'

const fetchMock = vi.fn()

function jsonResponse(
  data: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)

  getIdTokenMock.mockResolvedValue('test-token')
  fetchMock.mockResolvedValue(
    jsonResponse({ deleted: true }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('deleteProductImage', () => {
  it('envía una solicitud DELETE autenticada', async () => {
    await deleteProductImage(admin, key)

    expect(getIdTokenMock).toHaveBeenCalledWith(admin)

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      '/api/product-image-delete',
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
        cache: 'no-store',
      },
    )
  })

  it.each([
    '',
    'products/imagen.jpg',
    '../imagen.jpg',
    'products/11111111-1111-4111-8111-111111111111.svg',
    'other/11111111-1111-4111-8111-111111111111.jpg',
  ])('rechaza una clave inválida antes de enviar: %s', async (invalidKey) => {
    await expect(
      deleteProductImage(admin, invalidKey),
    ).rejects.toThrow(/referencia de la imagen/)

    expect(getIdTokenMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rechaza una sesión inválida', async () => {
    getIdTokenMock.mockRejectedValue(
      new Error('Firebase unavailable'),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/sesión no es válida/)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('informa una sesión caducada', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 401 }),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/sesión ha caducado/)
  })

  it('informa falta de permisos', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 403 }),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/No tienes permiso/)
  })

  it('informa que la imagen sigue en uso', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'Image In Use' }, 409),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/asociada a un producto/)
  })

  it('informa errores del backend', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'Service Unavailable' }, 503),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/eliminar la imagen/)
  })

  it('informa errores de conexión', async () => {
    fetchMock.mockRejectedValue(
      new TypeError('Network error'),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/conectar con el servicio/)
  })

  it('rechaza respuestas JSON incompatibles', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ deleted: false }),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/respuesta del servidor/)
  })

  it('rechaza respuestas que no son JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('ok', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/respuesta del servidor/)
  })

  it('rechaza JSON malformado', async () => {
    fetchMock.mockResolvedValue(
      new Response('{invalid', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/respuesta del servidor/)
  })

  it('rechaza propiedades inesperadas en la respuesta', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        deleted: true,
        unexpected: true,
      }),
    )

    await expect(
      deleteProductImage(admin, key),
    ).rejects.toThrow(/respuesta del servidor/)
  })
})

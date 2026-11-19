/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from 'firebase/auth'

const { getIdTokenMock } = vi.hoisted(() => ({
  getIdTokenMock: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getIdToken: getIdTokenMock,
}))

import {
  MAX_IMAGE_SIZE,
  uploadProductImage,
  validateProductImage,
} from './productImageUploadService'

const admin = { uid: 'admin-test' } as User

const key = 'products/11111111-1111-4111-8111-111111111111.jpg'
const url =
  'https://papelcorpsac-test.s3.us-east-1.amazonaws.com/' +
  key +
  '?X-Amz-Signature=test'

const fetchMock = vi.fn()

function file(type = 'image/jpeg', size = 1024): File {
  const result = new File(['imagen'], 'producto.jpg', { type })

  Object.defineProperty(result, 'size', { value: size })

  return result
}

function signedResponse(
  overrides: Record<string, unknown> = {},
): Response {
  return new Response(
    JSON.stringify({
      url,
      key,
      contentType: 'image/jpeg',
      expiresIn: 60,
      ...overrides,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)

  getIdTokenMock.mockResolvedValue('test-token')

  fetchMock
    .mockResolvedValueOnce(signedResponse())
    .mockResolvedValueOnce(new Response(null, { status: 200 }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('validateProductImage', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    'acepta %s',
    (type) => {
      expect(validateProductImage(file(type))).toBeNull()
    },
  )

  it('acepta exactamente 5 MiB', () => {
    expect(
      validateProductImage(file('image/jpeg', MAX_IMAGE_SIZE)),
    ).toBeNull()
  })

  it('rechaza formatos y tamaños inválidos', () => {
    expect(validateProductImage(file('image/svg+xml'))).not.toBeNull()
    expect(validateProductImage(file('image/jpeg', 0))).not.toBeNull()
    expect(
      validateProductImage(file('image/jpeg', MAX_IMAGE_SIZE + 1)),
    ).not.toBeNull()
  })
})

describe('uploadProductImage', () => {
  it('solicita una URL autenticada y envía el archivo a S3', async () => {
    const image = file()

    const result = await uploadProductImage(admin, image)

    expect(getIdTokenMock).toHaveBeenCalledWith(admin)

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/product-image-upload-url',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: 'image/jpeg',
          size: 1024,
        }),
        cache: 'no-store',
      },
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: image,
      },
    )

    expect(result).toEqual({ key })
  })

  it('rechaza un archivo inválido antes de pedir el token', async () => {
    await expect(
      uploadProductImage(admin, file('image/svg+xml')),
    ).rejects.toThrow(/JPEG, PNG o WebP/)

    expect(getIdTokenMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('detiene la subida si falla la autenticación', async () => {
    getIdTokenMock.mockRejectedValue(new Error('Firebase'))

    await expect(
      uploadProductImage(admin, file()),
    ).rejects.toThrow(/sesión no es válida/)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rechaza la falta de permisos', async () => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(
      new Response(null, { status: 403 }),
    )

    await expect(
      uploadProductImage(admin, file()),
    ).rejects.toThrow(/permiso/)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rechaza respuestas de firma inválidas', async () => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(
      signedResponse({ url: 'https://example.com/otro' }),
    )

    await expect(
      uploadProductImage(admin, file()),
    ).rejects.toThrow(/respuesta del servidor/)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rechaza una respuesta sin JSON válido', async () => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(
      new Response('error', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      }),
    )

    await expect(
      uploadProductImage(admin, file()),
    ).rejects.toThrow(/respuesta del servidor/)
  })

  it('informa si falla la conexión con el backend', async () => {
    fetchMock.mockReset()
    fetchMock.mockRejectedValue(new TypeError('Network error'))

    await expect(
      uploadProductImage(admin, file()),
    ).rejects.toThrow(/servicio de imágenes/)
  })

  it('informa si S3 rechaza la subida', async () => {
    fetchMock.mockReset()
    fetchMock
      .mockResolvedValueOnce(signedResponse())
      .mockResolvedValueOnce(
        new Response(null, { status: 403 }),
      )

    await expect(
      uploadProductImage(admin, file()),
    ).rejects.toThrow(/AWS S3 rechazó/)
  })

  it('informa si falla la conexión con S3', async () => {
    fetchMock.mockReset()
    fetchMock
      .mockResolvedValueOnce(signedResponse())
      .mockRejectedValueOnce(new TypeError('Network error'))

    await expect(
      uploadProductImage(admin, file()),
    ).rejects.toThrow(/conectar con AWS S3/)
  })
})

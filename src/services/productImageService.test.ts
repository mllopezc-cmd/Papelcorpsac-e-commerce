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
import { getProductImageUrl } from './productImageService'

const signedUrl =
  'https://papelcorpsac-test.s3.us-east-1.amazonaws.com/' +
  'products/11111111-1111-4111-8111-111111111111.webp' +
  '?X-Amz-Signature=test'

const fetchMock = vi.fn()

function jsonResponse(
  data: unknown = {
    url: signedUrl,
    expiresIn: 60,
  },
): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValue(jsonResponse())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getProductImageUrl', () => {
  it('solicita una URL GET sin credenciales AWS', async () => {
    const controller = new AbortController()

    const result = await getProductImageUrl(
      'product-001',
      controller.signal,
    )

    expect(result).toEqual({
      url: signedUrl,
      expiresIn: 60,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/product-image-url?productId=product-001',
      {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      },
    )
  })

  it('codifica el identificador del producto', async () => {
    await getProductImageUrl('producto especial')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/product-image-url?productId=producto%20especial',
      expect.objectContaining({
        method: 'GET',
      }),
    )
  })

  it.each([
    '',
    ' ',
    ' product-001',
    'product-001 ',
    'products/imagen',
  ])('rechaza un identificador inválido: %s', async (id) => {
    await expect(
      getProductImageUrl(id),
    ).rejects.toThrow(/identificador/)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rechaza un error HTTP', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 404 }),
    )

    await expect(
      getProductImageUrl('product-001'),
    ).rejects.toThrow(/obtener la imagen/)

    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('rechaza una URL de un dominio no autorizado', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        url: 'https://example.com/imagen.webp?X-Amz-Signature=test',
        expiresIn: 60,
      }),
    )

    await expect(
      getProductImageUrl('product-001'),
    ).rejects.toThrow(/respuesta del servicio/)

    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('rechaza una respuesta sin firma', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        url: 'https://s3.us-east-1.amazonaws.com/imagen.webp',
        expiresIn: 60,
      }),
    )

    await expect(
      getProductImageUrl('product-001'),
    ).rejects.toThrow(/respuesta del servicio/)
  })

  it('rechaza una vigencia inesperada', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        url: signedUrl,
        expiresIn: 3600,
      }),
    )

    await expect(
      getProductImageUrl('product-001'),
    ).rejects.toThrow(/respuesta del servicio/)
  })

  it('rechaza contenido que no es JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('texto', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    )

    await expect(
      getProductImageUrl('product-001'),
    ).rejects.toThrow(/respuesta del servicio/)
  })

  it('rechaza JSON malformado', async () => {
    fetchMock.mockResolvedValue(
      new Response('{', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    await expect(
      getProductImageUrl('product-001'),
    ).rejects.toThrow(/respuesta del servicio/)
  })

  it('conserva la causa de un error de conexión', async () => {
    const cause = new TypeError('Network failure')
    fetchMock.mockRejectedValue(cause)

    await expect(
      getProductImageUrl('product-001'),
    ).rejects.toMatchObject({
      message: 'No se pudo conectar con el servicio de imágenes.',
      cause,
    })
  })

  it('propaga la cancelación de la solicitud', async () => {
    const controller = new AbortController()
    const abortError = new DOMException(
      'Aborted',
      'AbortError',
    )

    fetchMock.mockRejectedValue(abortError)

    await expect(
      getProductImageUrl(
        'product-001',
        controller.signal,
      ),
    ).rejects.toBe(abortError)
  })
})

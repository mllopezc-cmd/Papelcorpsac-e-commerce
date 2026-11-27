/**
 * @vitest-environment jsdom
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { Product } from '../types/product'

const { getProductImageUrlMock } = vi.hoisted(() => ({
  getProductImageUrlMock: vi.fn(),
}))

vi.mock('../services/productImageService', () => ({
  getProductImageUrl: getProductImageUrlMock,
}))

import { ProductImage } from './ProductCard'

const key =
  'products/11111111-1111-4111-8111-111111111111.webp'

const secondKey =
  'products/22222222-2222-4222-8222-222222222222.webp'

const signedUrl =
  'https://papelcorpsac-test.s3.us-east-1.amazonaws.com/' +
  key +
  '?X-Amz-Signature=test'

const secondSignedUrl =
  'https://papelcorpsac-test.s3.us-east-1.amazonaws.com/' +
  secondKey +
  '?X-Amz-Signature=test'

const product: Product = {
  id: 'product-001',
  name: 'Cuaderno premium',
  description: 'Cuaderno de prueba',
  category: 'stationery',
  brand: 'Papel Corp',
  price: 25,
  stock: 10,
  published: true,
}

beforeEach(() => {
  vi.clearAllMocks()

  getProductImageUrlMock.mockResolvedValue({
    url: signedUrl,
    expiresIn: 60,
  })
})

afterEach(() => {
  cleanup()
})

describe('ProductImage — T10.4-C', () => {
  it('conserva una imagen tradicional', () => {
    render(
      <ProductImage
        product={{
          ...product,
          imageUrl: 'https://example.com/cuaderno.webp',
        }}
      />,
    )

    const image = screen.getByRole('img', {
      name: 'Cuaderno premium',
    }) as HTMLImageElement

    expect(image.getAttribute('src')).toBe(
      'https://example.com/cuaderno.webp',
    )

    expect(image.getAttribute('loading')).toBe('lazy')
    expect(image.getAttribute('fetchpriority')).toBeNull()

    expect(getProductImageUrlMock).not.toHaveBeenCalled()
  })

  it('prioriza una imagen tradicional cuando se solicita', () => {
    render(
      <ProductImage
        product={{
          ...product,
          imageUrl: 'https://example.com/cuaderno.webp',
        }}
        priority
      />,
    )

    const image = screen.getByRole('img', {
      name: 'Cuaderno premium',
    }) as HTMLImageElement

    expect(image.getAttribute('src')).toBe(
      'https://example.com/cuaderno.webp',
    )
    expect(image.getAttribute('loading')).toBe('eager')
    expect(image.getAttribute('fetchpriority')).toBe('high')

    expect(getProductImageUrlMock).not.toHaveBeenCalled()
  })

  it('muestra un placeholder si falta la imagen', () => {
    render(<ProductImage product={product} />)

    expect(
      screen.getByRole('img', {
        name: 'Imagen no disponible para Cuaderno premium',
      }),
    ).toBeTruthy()

    expect(getProductImageUrlMock).not.toHaveBeenCalled()
  })

  it('solicita una URL temporal para una imagen S3', async () => {
    render(
      <ProductImage
        product={{
          ...product,
          imageKey: key,
        }}
      />,
    )

    expect(
      getProductImageUrlMock,
    ).toHaveBeenCalledWith(
      'product-001',
      expect.any(AbortSignal),
    )

    await waitFor(() => {
      const image = screen.getByRole('img', {
        name: 'Cuaderno premium',
      }) as HTMLImageElement

      expect(image.getAttribute('src')).toBe(signedUrl)
      expect(image.getAttribute('referrerpolicy')).toBe(
        'no-referrer',
      )
    })
  })

  it('prioriza la imagen S3 después de obtener la URL privada', async () => {
    render(
      <ProductImage
        product={{
          ...product,
          imageKey: key,
        }}
        priority
      />,
    )

    const image = await screen.findByRole('img', {
      name: 'Cuaderno premium',
    }) as HTMLImageElement

    expect(image.getAttribute('src')).toBe(signedUrl)
    expect(image.getAttribute('loading')).toBe('eager')
    expect(image.getAttribute('fetchpriority')).toBe('high')
    expect(image.getAttribute('referrerpolicy')).toBe(
      'no-referrer',
    )

    expect(getProductImageUrlMock).toHaveBeenCalledTimes(1)
  })

  it('muestra carga mientras se obtiene la URL', () => {
    getProductImageUrlMock.mockReturnValue(
      new Promise(() => {}),
    )

    render(
      <ProductImage
        product={{
          ...product,
          imageKey: key,
        }}
      />,
    )

    expect(
      screen.getByRole('status', {
        name: 'Cargando imagen de Cuaderno premium',
      }),
    ).toBeTruthy()
  })

  it('utiliza imageUrl si falla la URL privada', async () => {
    getProductImageUrlMock.mockRejectedValue(
      new Error('Servicio no disponible'),
    )

    render(
      <ProductImage
        product={{
          ...product,
          imageKey: key,
          imageUrl: '/images/product-placeholder.svg',
        }}
      />,
    )

    await waitFor(() => {
      const image = screen.getByRole('img', {
        name: 'Cuaderno premium',
      }) as HTMLImageElement

      expect(image.getAttribute('src')).toBe(
        '/images/product-placeholder.svg',
      )
    })
  })

  it('muestra placeholder si falla y no hay imageUrl', async () => {
    getProductImageUrlMock.mockRejectedValue(
      new Error('Servicio no disponible'),
    )

    render(
      <ProductImage
        product={{
          ...product,
          imageKey: key,
        }}
      />,
    )

    expect(
      await screen.findByRole('img', {
        name: 'Imagen no disponible para Cuaderno premium',
      }),
    ).toBeTruthy()
  })

  it('cancela la solicitud al desmontar el componente', () => {
    getProductImageUrlMock.mockReturnValue(
      new Promise(() => {}),
    )

    const { unmount } = render(
      <ProductImage
        product={{
          ...product,
          imageKey: key,
        }}
      />,
    )

    const signal =
      getProductImageUrlMock.mock.calls[0][1] as AbortSignal

    expect(signal.aborted).toBe(false)

    unmount()

    expect(signal.aborted).toBe(true)
  })

  it('utiliza la imagen alternativa cuando falla la carga del elemento img', async () => {
    const fallbackUrl = '/images/product-placeholder.svg'

    render(
      <ProductImage
        product={{
          ...product,
          imageKey: key,
          imageUrl: fallbackUrl,
        }}
      />,
    )

    const signedImage = await screen.findByRole('img', {
      name: 'Cuaderno premium',
    }) as HTMLImageElement

    expect(signedImage.getAttribute('src')).toBe(signedUrl)

    fireEvent.error(signedImage)

    await waitFor(() => {
      const fallbackImage = screen.getByRole('img', {
        name: 'Cuaderno premium',
      }) as HTMLImageElement

      expect(fallbackImage.getAttribute('src')).toBe(
        fallbackUrl,
      )
    })

    expect(getProductImageUrlMock).toHaveBeenCalledTimes(1)
  })

  it('ignora una respuesta atrasada después de cambiar de producto', async () => {
    let resolveFirst:
      | ((result: { url: string; expiresIn: number }) => void)
      | undefined

    getProductImageUrlMock
      .mockImplementationOnce(
        () =>
          new Promise<{
            url: string
            expiresIn: number
          }>((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockResolvedValueOnce({
        url: secondSignedUrl,
        expiresIn: 60,
      })

    const firstProduct: Product = {
      ...product,
      imageKey: key,
    }

    const nextProduct: Product = {
      ...product,
      id: 'product-002',
      name: 'Agenda premium',
      imageKey: secondKey,
    }

    const { rerender } = render(
      <ProductImage product={firstProduct} />,
    )

    const firstSignal =
      getProductImageUrlMock.mock.calls[0][1] as AbortSignal

    rerender(
      <ProductImage product={nextProduct} />,
    )

    expect(firstSignal.aborted).toBe(true)

    await waitFor(() => {
      const image = screen.getByRole('img', {
        name: 'Agenda premium',
      }) as HTMLImageElement

      expect(image.getAttribute('src')).toBe(secondSignedUrl)
    })

    expect(getProductImageUrlMock).toHaveBeenCalledWith(
      'product-002',
      expect.any(AbortSignal),
    )

    expect(resolveFirst).toBeDefined()

    await act(async () => {
      resolveFirst?.({
        url: signedUrl,
        expiresIn: 60,
      })
    })

    const currentImage = screen.getByRole('img', {
      name: 'Agenda premium',
    }) as HTMLImageElement

    expect(currentImage.getAttribute('src')).toBe(
      secondSignedUrl,
    )

    expect(
      screen.queryByRole('img', {
        name: 'Cuaderno premium',
      }),
    ).toBeNull()
  })
})

/**
 * @vitest-environment jsdom
 */

import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../types/product'

const { getPublishedProductsMock } = vi.hoisted(() => ({
  getPublishedProductsMock: vi.fn(),
}))

vi.mock('../services/productService', () => ({
  getPublishedProducts: getPublishedProductsMock,
}))

import { useProducts } from './useProducts'

const product: Product = {
  id: 'product-001',
  name: 'Cuaderno premium',
  description: 'Producto de prueba',
  category: 'stationery',
  price: 25.9,
  brand: 'PAPEL CORP',
  stock: 5,
  published: true,
}

function deferred<T>() {
  let resolve!: (value: T) => void

  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

beforeEach(() => {
  vi.clearAllMocks()
  getPublishedProductsMock.mockResolvedValue([])
})

afterEach(() => {
  cleanup()
})

describe('useProducts — T12.5-B', () => {
  it('inicia con el catálogo vacío y loading activo', () => {
    const request = deferred<Product[]>()
    getPublishedProductsMock.mockReturnValue(request.promise)

    const { result } = renderHook(() => useProducts())

    expect(result.current.products).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(getPublishedProductsMock).toHaveBeenCalledTimes(1)
  })

  it('carga los productos publicados', async () => {
    getPublishedProductsMock.mockResolvedValue([product])

    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual([product])
    expect(result.current.error).toBeNull()
  })

  it('admite un catálogo sin resultados', async () => {
    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('conserva el error recibido del servicio', async () => {
    const failure = new Error('Firestore no disponible')
    getPublishedProductsMock.mockRejectedValue(failure)

    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual([])
    expect(result.current.error).toBe(failure)
  })

  it('normaliza errores inesperados', async () => {
    getPublishedProductsMock.mockRejectedValue('error inesperado')

    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error?.message).toBe(
      'Ocurrió un error inesperado al cargar el catálogo.',
    )
  })

  it('ignora respuestas tardías después del desmontaje', async () => {
    const request = deferred<Product[]>()
    getPublishedProductsMock.mockReturnValue(request.promise)

    const { result, unmount } = renderHook(() => useProducts())

    expect(result.current.loading).toBe(true)

    unmount()

    await act(async () => {
      request.resolve([product])
      await request.promise
    })

    expect(getPublishedProductsMock).toHaveBeenCalledTimes(1)
  })
})

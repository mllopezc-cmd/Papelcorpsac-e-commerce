/**
 * @vitest-environment jsdom
 */

import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  useAuthMock,
  subscribeMock,
  addMock,
  removeMock,
  unsubscribeMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  subscribeMock: vi.fn(),
  addMock: vi.fn(),
  removeMock: vi.fn(),
  unsubscribeMock: vi.fn(),
}))

vi.mock('./useAuth', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../services/favoriteService', () => ({
  subscribeToFavorites: subscribeMock,
  addFavorite: addMock,
  removeFavorite: removeMock,
}))

import { useFavorites } from './useFavorites'

const customer = { uid: 'customer-001' }
const otherCustomer = { uid: 'customer-002' }

function deferred() {
  let resolve!: () => void

  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

function useCustomer(user: { uid: string } | null = customer) {
  useAuthMock.mockReturnValue({ user })
}

function emitFavorites(index: number, ids: string[]) {
  const callback = subscribeMock.mock.calls[index][1] as (
    ids: string[],
  ) => void

  act(() => {
    callback(ids)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  useCustomer(null)

  subscribeMock.mockReturnValue(unsubscribeMock)
  addMock.mockResolvedValue(undefined)
  removeMock.mockResolvedValue(undefined)
})

afterEach(() => {
  cleanup()
})

describe('useFavorites — T12.5-B', () => {
  it('mantiene favoritos vacíos sin sesión y rechaza operaciones', async () => {
    const { result } = renderHook(() => useFavorites())

    expect(result.current.favorites).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(subscribeMock).not.toHaveBeenCalled()

    await expect(
      result.current.addFavorite('product-001'),
    ).resolves.toBe(false)

    await expect(
      result.current.removeFavorite('product-001'),
    ).resolves.toBe(false)

    expect(addMock).not.toHaveBeenCalled()
    expect(removeMock).not.toHaveBeenCalled()
  })

  it('se suscribe a los favoritos del usuario autenticado', () => {
    useCustomer()

    const { result } = renderHook(() => useFavorites())

    expect(subscribeMock).toHaveBeenCalledTimes(1)
    expect(subscribeMock.mock.calls[0][0]).toBe('customer-001')
    expect(result.current.loading).toBe(true)
    expect(result.current.favorites).toEqual([])
  })

  it('actualiza los favoritos cuando llega una notificación', () => {
    useCustomer()

    const { result } = renderHook(() => useFavorites())

    emitFavorites(0, ['product-001', 'product-002'])

    expect(result.current.loading).toBe(false)
    expect(result.current.favorites).toEqual([
      'product-001',
      'product-002',
    ])

    emitFavorites(0, ['product-002'])

    expect(result.current.favorites).toEqual(['product-002'])
  })

  it('agrega un favorito y controla la operación pendiente', async () => {
    useCustomer()
    const request = deferred()
    addMock.mockReturnValue(request.promise)

    const { result } = renderHook(() => useFavorites())

    emitFavorites(0, [])

    let operation!: Promise<boolean>

    act(() => {
      operation = result.current.addFavorite('product-001')
    })

    expect(result.current.pendingProductIds).toEqual(['product-001'])
    expect(addMock).toHaveBeenCalledWith(
      'customer-001',
      'product-001',
    )

    await act(async () => {
      request.resolve()
      expect(await operation).toBe(true)
    })

    expect(result.current.pendingProductIds).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('elimina un favorito y controla la operación pendiente', async () => {
    useCustomer()
    const request = deferred()
    removeMock.mockReturnValue(request.promise)

    const { result } = renderHook(() => useFavorites())

    emitFavorites(0, ['product-001'])

    let operation!: Promise<boolean>

    act(() => {
      operation = result.current.removeFavorite('product-001')
    })

    expect(result.current.pendingProductIds).toEqual(['product-001'])
    expect(removeMock).toHaveBeenCalledWith(
      'customer-001',
      'product-001',
    )

    await act(async () => {
      request.resolve()
      expect(await operation).toBe(true)
    })

    expect(result.current.pendingProductIds).toEqual([])
  })

  it('impide dos operaciones simultáneas sobre el mismo producto', async () => {
    useCustomer()
    const request = deferred()
    addMock.mockReturnValue(request.promise)

    const { result } = renderHook(() => useFavorites())

    let first!: Promise<boolean>

    act(() => {
      first = result.current.addFavorite('product-001')
    })

    await expect(
      result.current.addFavorite('product-001'),
    ).resolves.toBe(false)

    expect(addMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      request.resolve()
      expect(await first).toBe(true)
    })
  })

  it('informa errores y libera las operaciones pendientes', async () => {
    useCustomer()
    const failure = new Error('Permiso denegado')
    addMock.mockRejectedValue(failure)

    const { result } = renderHook(() => useFavorites())

    let success = true

    await act(async () => {
      success = await result.current.addFavorite('product-001')
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe(failure)
    expect(result.current.pendingProductIds).toEqual([])
  })

  it('separa los favoritos al cambiar de usuario y cerrar sesión', async () => {
    useCustomer()

    const { result, rerender } = renderHook(() => useFavorites())

    emitFavorites(0, ['product-001'])
    expect(result.current.favorites).toEqual(['product-001'])

    useCustomer(otherCustomer)
    rerender()

    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    expect(result.current.favorites).toEqual([])
    expect(result.current.loading).toBe(true)

    emitFavorites(0, ['product-001'])
    expect(result.current.favorites).toEqual([])

    emitFavorites(1, ['product-002'])
    expect(result.current.favorites).toEqual(['product-002'])

    useCustomer(null)
    rerender()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.favorites).toEqual([])
    expect(unsubscribeMock).toHaveBeenCalledTimes(2)
  })

  it('ignora operaciones antiguas y cancela la suscripción al desmontarse', async () => {
    useCustomer()
    const request = deferred()
    addMock.mockReturnValue(request.promise)

    const { result, rerender, unmount } = renderHook(
      () => useFavorites(),
    )

    let operation!: Promise<boolean>

    act(() => {
      operation = result.current.addFavorite('product-001')
    })

    useCustomer(otherCustomer)
    rerender()

    emitFavorites(1, ['product-002'])

    await act(async () => {
      request.resolve()
      expect(await operation).toBe(true)
    })

    expect(result.current.favorites).toEqual(['product-002'])
    expect(result.current.pendingProductIds).toEqual([])
    expect(result.current.error).toBeNull()

    unmount()

    expect(unsubscribeMock).toHaveBeenCalledTimes(2)
  })
})

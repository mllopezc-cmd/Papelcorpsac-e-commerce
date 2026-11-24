/**
 * @vitest-environment jsdom
 */

import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CartSnapshotItem } from '../types/cart'
import type { Product } from '../types/product'
import { CartProvider } from './CartContext'
import { useCart } from '../hooks/useCart'

const STORAGE_KEY = 'papelcorpsac:cart:v1'

const firstProduct: Product = {
  id: 'producto-001',
  name: 'Cuaderno premium',
  description: 'Cuaderno de prueba',
  category: 'stationery',
  price: 25.9,
  published: true,
  brand: 'Papel Corp',
  stock: 10,
}

const secondProduct: Product = {
  id: 'producto-002',
  name: 'Bolígrafo premium',
  description: 'Bolígrafo de prueba',
  category: 'writing-instruments',
  price: 12.5,
  published: true,
  brand: 'Papel Corp',
  stock: 5,
}

function wrapper({ children }: PropsWithChildren) {
  return <CartProvider>{children}</CartProvider>
}

function renderCartHook() {
  return renderHook(() => useCart(), { wrapper })
}

function storedCart(): unknown {
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === null ? null : JSON.parse(value)
}

async function addProduct(
  cart: ReturnType<typeof renderCartHook>['result'],
  product: Product,
  quantity?: number,
): Promise<boolean> {
  let request!: Promise<boolean>

  act(() => {
    request = cart.current.addItem(product, quantity)
  })

  return request
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('useCart y CartProvider — T12.2-B', () => {
  it('rechaza usar useCart fuera de CartProvider', () => {
    expect(() => renderHook(() => useCart())).toThrow(
      'useCart debe utilizarse dentro de un CartProvider.',
    )
  })

  it('inicia con el carrito vacío y los totales en cero', () => {
    const { result } = renderCartHook()

    expect(result.current.items).toEqual([])
    expect(result.current.totalUnits).toBe(0)
    expect(result.current.subtotal).toBe(0)
    expect(result.current.notification).toBeNull()
  })

  it('agrega un producto y confirma la operación', async () => {
    const { result } = renderCartHook()

    const accepted = await addProduct(
      result,
      firstProduct,
      2,
    )

    expect(accepted).toBe(true)
    expect(result.current.items).toEqual([
      { product: firstProduct, quantity: 2 },
    ])
    expect(result.current.totalUnits).toBe(2)
    expect(result.current.subtotal).toBe(51.8)
  })

  it('agrega una unidad cuando no se indica cantidad', async () => {
    const { result } = renderCartHook()

    expect(
      await addProduct(result, firstProduct),
    ).toBe(true)

    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.totalUnits).toBe(1)
  })

  it('calcula el subtotal de varios productos en céntimos', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct, 2)
    await addProduct(result, secondProduct, 3)

    expect(result.current.items).toHaveLength(2)
    expect(result.current.totalUnits).toBe(5)
    expect(result.current.subtotal).toBe(89.3)
  })

  it('acumula cantidades al agregar el mismo producto', async () => {
    const { result } = renderCartHook()

    expect(await addProduct(result, firstProduct, 2)).toBe(true)
    expect(await addProduct(result, firstProduct, 3)).toBe(true)

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.totalUnits).toBe(5)
    expect(result.current.subtotal).toBe(129.5)
  })

  it('rechaza cantidades superiores al stock sin alterar el carrito', async () => {
    const { result } = renderCartHook()

    expect(await addProduct(result, firstProduct, 2)).toBe(true)

    const previousItems = result.current.items

    expect(
      await addProduct(result, firstProduct, 9),
    ).toBe(false)

    expect(result.current.items).toBe(previousItems)
    expect(result.current.totalUnits).toBe(2)
    expect(result.current.subtotal).toBe(51.8)
  })

  it('rechaza productos inválidos sin mostrar una notificación', async () => {
    const { result } = renderCartHook()

    const invalidProduct: Product = {
      ...firstProduct,
      stock: 0,
    }

    expect(
      await addProduct(result, invalidProduct),
    ).toBe(false)

    expect(result.current.items).toEqual([])
    expect(result.current.notification).toBeNull()
  })

  it('muestra los datos de la última operación aceptada', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct, 2)

    expect(result.current.notification).toMatchObject({
      product: firstProduct,
      quantity: 2,
      operationSubtotalCents: 5180,
      totalUnits: 2,
      cartSubtotalCents: 5180,
    })

    const previousId = result.current.notification?.id

    await addProduct(result, secondProduct, 1)

    expect(result.current.notification).toMatchObject({
      product: secondProduct,
      quantity: 1,
      operationSubtotalCents: 1250,
      totalUnits: 3,
      cartSubtotalCents: 6430,
    })

    expect(result.current.notification?.id).not.toBe(previousId)
  })

  it('descarta solo la notificación que corresponde al identificador', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct)
    const firstId = result.current.notification?.id

    await addProduct(result, secondProduct)
    const latestId = result.current.notification?.id

    expect(firstId).toBeDefined()
    expect(latestId).toBeDefined()

    act(() => {
      result.current.dismissNotification(firstId!)
    })

    expect(result.current.notification?.id).toBe(latestId)

    act(() => {
      result.current.dismissNotification(latestId!)
    })

    expect(result.current.notification).toBeNull()
    expect(result.current.items).toHaveLength(2)
  })

  it('actualiza la cantidad y recalcula los totales', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct, 2)

    act(() => {
      result.current.updateQuantity(firstProduct.id, 4)
    })

    expect(result.current.items[0].quantity).toBe(4)
    expect(result.current.totalUnits).toBe(4)
    expect(result.current.subtotal).toBe(103.6)
  })

  it('elimina un producto y conserva los demás', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct, 2)
    await addProduct(result, secondProduct, 1)

    act(() => {
      result.current.removeItem(firstProduct.id)
    })

    expect(result.current.items).toEqual([
      { product: secondProduct, quantity: 1 },
    ])
    expect(result.current.totalUnits).toBe(1)
    expect(result.current.subtotal).toBe(12.5)
  })

  it('vacía el carrito y restablece los totales', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct, 2)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.items).toEqual([])
    expect(result.current.totalUnits).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('limpia el carrito si coincide exactamente con la instantánea', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct, 2)
    await addProduct(result, secondProduct, 1)

    const snapshot: CartSnapshotItem[] = [
      { productId: secondProduct.id, quantity: 1 },
      { productId: firstProduct.id, quantity: 2 },
    ]

    act(() => {
      result.current.clearCartIfUnchanged(snapshot)
    })

    expect(result.current.items).toEqual([])
  })

  it('conserva el carrito si cambió después de preparar la instantánea', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct, 2)

    const snapshot: CartSnapshotItem[] = [
      { productId: firstProduct.id, quantity: 2 },
    ]

    act(() => {
      result.current.updateQuantity(firstProduct.id, 3)
    })

    act(() => {
      result.current.clearCartIfUnchanged(snapshot)
    })

    expect(result.current.items).toEqual([
      { product: firstProduct, quantity: 3 },
    ])
  })

  it('guarda el carrito con el esquema versionado esperado', async () => {
    const { result } = renderCartHook()

    await addProduct(result, firstProduct, 2)

    expect(storedCart()).toEqual({
      version: 1,
      items: [
        { product: firstProduct, quantity: 2 },
      ],
    })
  })

  it('recupera el carrito válido guardado en localStorage', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [
          { product: firstProduct, quantity: 3 },
        ],
      }),
    )

    const { result } = renderCartHook()

    expect(result.current.items).toEqual([
      { product: firstProduct, quantity: 3 },
    ])
    expect(result.current.totalUnits).toBe(3)
    expect(result.current.subtotal).toBe(77.7)
  })

  it('inicia vacío ante datos JSON corruptos en localStorage', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      '{json-invalido',
    )

    const { result } = renderCartHook()

    expect(result.current.items).toEqual([])
    expect(result.current.totalUnits).toBe(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('resuelve varias solicitudes de agregado realizadas juntas', async () => {
    const { result } = renderCartHook()

    let firstRequest!: Promise<boolean>
    let secondRequest!: Promise<boolean>

    act(() => {
      firstRequest = result.current.addItem(firstProduct, 2)
      secondRequest = result.current.addItem(secondProduct, 1)
    })

    expect(await firstRequest).toBe(true)
    expect(await secondRequest).toBe(true)

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2)
    })

    expect(result.current.totalUnits).toBe(3)
    expect(result.current.subtotal).toBe(64.3)
    expect(result.current.notification?.product.id).toBe(
      secondProduct.id,
    )
  })
})

/**
 * @vitest-environment jsdom
 */

import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CartItem } from '../types/cart'
import type { Product } from '../types/product'
import { renderWithProviders } from '../test/renderWithProviders'
import { CartPage } from './CartPage'

const STORAGE_KEY = 'papelcorpsac:cart:v1'

const firstProduct: Product = {
  id: 'producto-001',
  name: 'Cuaderno premium',
  description: 'Cuaderno de prueba',
  category: 'stationery',
  price: 25.9,
  published: true,
  brand: 'Papel Corp',
  stock: 5,
}

const secondProduct: Product = {
  id: 'producto-002',
  name: 'Bolígrafo premium',
  description: 'Bolígrafo de prueba',
  category: 'writing-instruments',
  price: 12.5,
  published: true,
  brand: 'Papel Corp',
  stock: 3,
}

function prepareCart(items: CartItem[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      items,
    }),
  )
}

function renderCartPage() {
  return renderWithProviders(<CartPage />, {
    route: '/carrito',
  })
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('CartPage — T12.3-B', () => {
  it('presenta el estado vacío y permite volver al catálogo', () => {
    renderCartPage()

    expect(
      screen.getByRole('heading', {
        name: 'Mi carrito',
      }),
    ).toBeTruthy()

    expect(
      screen.getByText('Tu carrito está vacío.'),
    ).toBeTruthy()

    expect(
      screen.getByRole('link', {
        name: 'Ir al catálogo',
      }).getAttribute('href'),
    ).toBe('/catalogo')

    expect(
      screen.queryByRole('link', {
        name: 'Finalizar compra',
      }),
    ).toBeNull()
  })

  it('muestra los productos, las cantidades y el total', () => {
    prepareCart([
      { product: firstProduct, quantity: 2 },
      { product: secondProduct, quantity: 1 },
    ])

    renderCartPage()

    expect(screen.getByText('Cuaderno premium')).toBeTruthy()
    expect(screen.getByText('Bolígrafo premium')).toBeTruthy()
    expect(screen.getByText('3 unidades')).toBeTruthy()

    expect(
      screen.getByLabelText('Cantidad: 2').textContent,
    ).toBe('2')

    expect(
      screen.getByLabelText('Cantidad: 1').textContent,
    ).toBe('1')

    // Total: 2 × S/25.90 + S/12.50 = S/64.30
    expect(
      screen.getAllByText(/64[.,]30/).length,
    ).toBeGreaterThan(0)
  })

  it('muestra el singular cuando solo hay una unidad', () => {
    prepareCart([
      { product: firstProduct, quantity: 1 },
    ])

    renderCartPage()

    expect(screen.getByText('1 unidad')).toBeTruthy()
  })

  it('aumenta la cantidad y actualiza el subtotal', async () => {
    prepareCart([
      { product: firstProduct, quantity: 1 },
    ])

    renderCartPage()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Aumentar cantidad de Cuaderno premium',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByLabelText('Cantidad: 2').textContent,
      ).toBe('2')
    })

    expect(screen.getByText('2 unidades')).toBeTruthy()

    expect(
      screen.getAllByText(/51[.,]80/).length,
    ).toBeGreaterThan(0)
  })

  it('disminuye la cantidad sin permitir valores inferiores a uno', async () => {
    prepareCart([
      { product: firstProduct, quantity: 2 },
    ])

    renderCartPage()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Disminuir cantidad de Cuaderno premium',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByLabelText('Cantidad: 1').textContent,
      ).toBe('1')
    })

    const decreaseButton = screen.getByRole(
      'button',
      {
        name: 'Disminuir cantidad de Cuaderno premium',
      },
    ) as HTMLButtonElement

    expect(decreaseButton.disabled).toBe(true)
    expect(screen.getByText('1 unidad')).toBeTruthy()
  })

  it('impide superar el stock disponible', () => {
    prepareCart([
      { product: firstProduct, quantity: 5 },
    ])

    renderCartPage()

    const increaseButton = screen.getByRole(
      'button',
      {
        name: 'Aumentar cantidad de Cuaderno premium',
      },
    ) as HTMLButtonElement

    expect(increaseButton.disabled).toBe(true)
    expect(
      screen.getByLabelText('Cantidad: 5').textContent,
    ).toBe('5')
  })

  it('elimina un producto conservando los demás', async () => {
    prepareCart([
      { product: firstProduct, quantity: 2 },
      { product: secondProduct, quantity: 1 },
    ])

    renderCartPage()

    const removeButton = screen.getByRole('button', {
      name: 'Eliminar Cuaderno premium del carrito',
    })

    expect(removeButton.textContent).toBe('Eliminar')

    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(
        screen.queryByText('Cuaderno premium'),
      ).toBeNull()
    })

    expect(screen.getByText('Bolígrafo premium')).toBeTruthy()
    expect(screen.getByText('1 unidad')).toBeTruthy()
  })

  it('vacía el carrito y muestra el estado vacío', async () => {
    prepareCart([
      { product: firstProduct, quantity: 2 },
    ])

    renderCartPage()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Vaciar carrito',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByText('Tu carrito está vacío.'),
      ).toBeTruthy()
    })

    expect(
      screen.queryByText('Cuaderno premium'),
    ).toBeNull()
  })

  it('ofrece las rutas correctas para checkout y catálogo', () => {
    prepareCart([
      { product: firstProduct, quantity: 1 },
    ])

    renderCartPage()

    expect(
      screen.getByRole('link', {
        name: 'Finalizar compra',
      }).getAttribute('href'),
    ).toBe('/checkout')

    expect(
      screen.getByRole('link', {
        name: 'Continuar comprando',
      }).getAttribute('href'),
    ).toBe('/catalogo')
  })
})

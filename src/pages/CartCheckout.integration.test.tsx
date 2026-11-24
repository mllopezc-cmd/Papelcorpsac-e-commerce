/**
 * @vitest-environment jsdom
 */

import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import type { User } from 'firebase/auth'
import { Link, Route, Routes } from 'react-router'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../hooks/useCart'
import { renderWithProviders } from '../test/renderWithProviders'
import type {
  CheckoutRequest,
  CheckoutSuccessResponse,
} from '../types/checkout'
import type { Product } from '../types/product'
import { CartPage } from './CartPage'

const { submitCheckoutMock, randomUUIDMock } = vi.hoisted(() => ({
  submitCheckoutMock: vi.fn(),
  randomUUIDMock: vi.fn(),
}))

vi.mock('../services/checkoutService', () => {
  class CheckoutClientError extends Error {
    readonly kind: string

    constructor(kind: string) {
      super(kind)
      this.name = 'CheckoutClientError'
      this.kind = kind
    }
  }

  return {
    submitCheckout: submitCheckoutMock,
    CheckoutClientError,
  }
})

import { CheckoutPage } from './CheckoutPage'
import { CheckoutClientError } from '../services/checkoutService'

const CART_STORAGE_KEY = 'papelcorpsac:cart:v1'
const ATTEMPT_STORAGE_KEY = 'papelcorpsac:checkout-attempt:v1'

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
  stock: 10,
}

const testUser = {
  uid: 'customer-test-001',
} as unknown as User

function successfulResponse(): CheckoutSuccessResponse {
  return {
    success: true,
    order: {
      id: 'orden-integracion-001',
      status: 'pending',
      currency: 'PEN',
      totalCents: 5180,
    },
    replayed: false,
  }
}

function CatalogHarness() {
  return (
    <>
      <ProductCard
        product={firstProduct}
        isFavorite={false}
        favoritePending={false}
        onToggleFavorite={() => {}}
      />

      <Link to="/carrito">
        Ir al carrito de prueba
      </Link>
    </>
  )
}

function CartObserver() {
  const { items, totalUnits, addItem } = useCart()

  return (
    <div>
      <output data-testid="cart-units">
        {totalUnits}
      </output>

      <output data-testid="cart-product-ids">
        {items.map((item) => item.product.id).join(',')}
      </output>

      <button
        type="button"
        onClick={() => {
          void addItem(secondProduct)
        }}
      >
        Agregar bolígrafo durante solicitud
      </button>
    </div>
  )
}

function TestRoutes() {
  return (
    <Routes>
      <Route
        path="/catalogo"
        element={<CatalogHarness />}
      />

      <Route
        path="/carrito"
        element={<CartPage />}
      />

      <Route
        path="/checkout"
        element={
          <>
            <CheckoutPage />
            <CartObserver />
          </>
        }
      />
    </Routes>
  )
}

function renderFlow({
  authenticated = true,
  route = '/catalogo',
}: {
  authenticated?: boolean
  route?: string
} = {}) {
  return renderWithProviders(<TestRoutes />, {
    route,
    auth: {
      user: authenticated ? testUser : null,
    },
  })
}

function prepareCart(quantity = 2) {
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      items: [
        {
          product: firstProduct,
          quantity,
        },
      ],
    }),
  )
}

function storedCart(): {
  version: number
  items: Array<{
    product: Product
    quantity: number
  }>
} {
  const value = window.localStorage.getItem(CART_STORAGE_KEY)

  if (!value) {
    throw new Error('No se encontró el carrito persistido.')
  }

  return JSON.parse(value) as ReturnType<typeof storedCart>
}

function submittedRequest(index = 0): CheckoutRequest {
  return submitCheckoutMock.mock.calls[index][1] as CheckoutRequest
}

async function goToCheckout() {
  fireEvent.click(
    screen.getByRole('link', {
      name: 'Finalizar compra',
    }),
  )

  await screen.findByRole('heading', {
    name: 'Finalizar compra',
  })
}

function confirmOrder() {
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Confirmar pedido simulado',
    }),
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  window.localStorage.clear()
  window.sessionStorage.clear()

  randomUUIDMock.mockReturnValue(
    '11111111-1111-4111-8111-111111111111',
  )

  vi.stubGlobal('crypto', {
    randomUUID: randomUUIDMock,
  })

  submitCheckoutMock.mockResolvedValue(successfulResponse())
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()

  window.localStorage.clear()
  window.sessionStorage.clear()
})

describe('Integración carrito y checkout — T12.3-C', () => {
  it('lleva un producto del catálogo al checkout y confirma la orden', async () => {
    renderFlow()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Agregar Cuaderno premium al carrito',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByText('Disponibles para agregar: 9'),
      ).toBeTruthy()
    })

    fireEvent.click(
      screen.getByRole('link', {
        name: 'Ir al carrito de prueba',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Mi carrito',
      }),
    ).toBeTruthy()

    expect(screen.getByText('Cuaderno premium')).toBeTruthy()

    await goToCheckout()

    expect(
      screen.getByRole('heading', {
        name: 'Resumen del pedido',
      }),
    ).toBeTruthy()

    expect(screen.getByText('Cantidad: 1')).toBeTruthy()
    expect(
      screen.getByText(/No se realizarán cobros reales/),
    ).toBeTruthy()

    confirmOrder()

    await waitFor(() => {
      expect(
        screen.getByText('Tu orden fue registrada'),
      ).toBeTruthy()
    })

    expect(submitCheckoutMock).toHaveBeenCalledTimes(1)
    expect(submitCheckoutMock.mock.calls[0][0]).toBe(testUser)

    expect(submittedRequest()).toEqual({
      idempotencyKey:
        '11111111-1111-4111-8111-111111111111',
      items: [
        {
          productId: 'producto-001',
          quantity: 1,
        },
      ],
    })

    await waitFor(() => {
      expect(
        screen.getByTestId('cart-units').textContent,
      ).toBe('0')
    })

    expect(storedCart().items).toEqual([])
    expect(window.sessionStorage.getItem(ATTEMPT_STORAGE_KEY)).toBeNull()
  })

  it('envía las cantidades reales y nunca los precios del navegador', async () => {
    prepareCart(2)

    renderFlow({ route: '/carrito' })

    await goToCheckout()
    confirmOrder()

    await waitFor(() => {
      expect(submitCheckoutMock).toHaveBeenCalledTimes(1)
    })

    expect(submittedRequest()).toEqual({
      idempotencyKey:
        '11111111-1111-4111-8111-111111111111',
      items: [
        {
          productId: firstProduct.id,
          quantity: 2,
        },
      ],
    })

    expect(
      JSON.stringify(submittedRequest()),
    ).not.toContain('price')
  })

  it('conserva el carrito ante un conflicto y permite reintentar', async () => {
    submitCheckoutMock
      .mockRejectedValueOnce(
        new CheckoutClientError('conflict'),
      )
      .mockResolvedValueOnce(successfulResponse())

    prepareCart(2)

    renderFlow({ route: '/carrito' })
    await goToCheckout()

    confirmOrder()

    await waitFor(() => {
      expect(
        screen.getByRole('alert').textContent,
      ).toContain('stock disponible')
    })

    expect(storedCart().items).toHaveLength(1)
    expect(storedCart().items[0].quantity).toBe(2)
    expect(screen.getByTestId('cart-units').textContent).toBe('2')

    confirmOrder()

    await waitFor(() => {
      expect(
        screen.getByText('Tu orden fue registrada'),
      ).toBeTruthy()
    })

    expect(submitCheckoutMock).toHaveBeenCalledTimes(2)

    expect(submittedRequest(1)).toEqual(submittedRequest(0))

    await waitFor(() => {
      expect(
        screen.getByTestId('cart-units').textContent,
      ).toBe('0')
    })
  })

  it('no borra productos agregados mientras la confirmación está pendiente', async () => {
    let resolveCheckout:
      | ((value: CheckoutSuccessResponse) => void)
      | undefined

    submitCheckoutMock.mockImplementationOnce(
      () =>
        new Promise<CheckoutSuccessResponse>((resolve) => {
          resolveCheckout = resolve
        }),
    )

    prepareCart(2)

    renderFlow({ route: '/carrito' })
    await goToCheckout()

    confirmOrder()

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Confirmando pedido…',
        }),
      ).toBeTruthy()
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Agregar bolígrafo durante solicitud',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('cart-units').textContent,
      ).toBe('3')
    })

    const finishCheckout = resolveCheckout as
      | ((value: CheckoutSuccessResponse) => void)
      | undefined
    if (!finishCheckout) {
      throw new Error('No se inició la solicitud simulada.')
    }

    await act(async () => {
        finishCheckout(successfulResponse())
    })

    await waitFor(() => {
      expect(
        screen.getByText('Tu orden fue registrada'),
      ).toBeTruthy()
    })

    expect(submittedRequest().items).toEqual([
      {
        productId: firstProduct.id,
        quantity: 2,
      },
    ])

    expect(
      screen.getByTestId('cart-units').textContent,
    ).toBe('3')

    expect(
      screen.getByTestId('cart-product-ids').textContent,
    ).toBe('producto-001,producto-002')

    expect(storedCart().items).toHaveLength(2)
  })

  it('impide confirmar el pedido sin usuario autenticado', async () => {
    prepareCart(2)

    renderFlow({
      authenticated: false,
      route: '/carrito',
    })

    await goToCheckout()

    const button = screen.getByRole('button', {
      name: 'Confirmar pedido simulado',
    }) as HTMLButtonElement

    expect(button.disabled).toBe(true)

    fireEvent.click(button)

    expect(submitCheckoutMock).not.toHaveBeenCalled()
    expect(storedCart().items).toHaveLength(1)
  })

  it('no permite confirmar cuando el carrito está vacío', () => {
    renderFlow({ route: '/checkout' })

    expect(
      screen.getByText('Tu carrito está vacío'),
    ).toBeTruthy()

    expect(
      screen.queryByRole('button', {
        name: 'Confirmar pedido simulado',
      }),
    ).toBeNull()

    expect(submitCheckoutMock).not.toHaveBeenCalled()
  })
})

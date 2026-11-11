/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CartItem } from '../types/cart'
import type { Product } from '../types/product'

const {
  useAuthMock,
  useCartMock,
  submitCheckoutMock,
  clearCartMock,
  clearCartIfUnchangedMock,
  randomUUIDMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useCartMock: vi.fn(),
  submitCheckoutMock: vi.fn(),
  clearCartMock: vi.fn(),
  clearCartIfUnchangedMock: vi.fn(),
  randomUUIDMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../hooks/useCart', () => ({
  useCart: useCartMock,
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
import type {
  CheckoutRequest,
  CheckoutSuccessResponse,
} from '../types/checkout'

const testUser = { uid: 'customer-test-001' }

const firstProduct: Product = {
  id: 'producto-001',
  name: 'Cuaderno premium',
  description: 'Cuaderno de demostración',
  category: 'stationery',
  price: 25,
  published: true,
  brand: 'Papel Corp',
  stock: 10,
}

const secondProduct: Product = {
  id: 'producto-002',
  name: 'Bolígrafo premium',
  description: 'Bolígrafo de demostración',
  category: 'writing-instruments',
  price: 12.5,
  published: true,
  brand: 'Papel Corp',
  stock: 10,
}

function cartItem(
  product: Product = firstProduct,
  quantity = 2,
): CartItem {
  return { product, quantity }
}

function setCart(items: CartItem[]) {
  const subtotalCents = items.reduce(
    (total, item) =>
      total +
      Math.round(item.product.price * 100) * item.quantity,
    0,
  )

  useCartMock.mockReturnValue({
    items,
    subtotal: subtotalCents / 100,
    clearCart: clearCartMock,
    clearCartIfUnchanged: clearCartIfUnchangedMock,
  })
}

function orderResponse(
  replayed = false,
  totalCents = 5000,
): CheckoutSuccessResponse {
  return {
    success: true,
    order: {
      id: 'orden-test-001',
      status: 'pending',
      currency: 'PEN',
      totalCents,
    },
    replayed,
  }
}

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <CheckoutPage />
    </MemoryRouter>,
  )
}

function confirmButton(): HTMLButtonElement {
  return screen.getByRole('button', {
    name: 'Confirmar pedido simulado',
  }) as HTMLButtonElement
}

function submittedRequest(callIndex = 0): CheckoutRequest {
  return submitCheckoutMock.mock.calls[callIndex][1] as CheckoutRequest
}

beforeEach(() => {
  vi.clearAllMocks()

  // Evita que los UUID pendientes de otra prueba se reutilicen.
  randomUUIDMock.mockReset()

  window.sessionStorage.clear()

  useAuthMock.mockReturnValue({
    user: testUser,
  })

  setCart([cartItem()])

  randomUUIDMock.mockReturnValue(
    '11111111-1111-4111-8111-111111111111',
  )

  vi.stubGlobal('crypto', {
    randomUUID: randomUUIDMock,
  })

  submitCheckoutMock.mockResolvedValue(orderResponse())
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CheckoutPage', () => {
  it('muestra el estado vacío sin intentar crear una orden', () => {
    setCart([])

    renderCheckout()

    expect(
      screen.getByText('Tu carrito está vacío'),
    ).toBeTruthy()

    expect(
      screen.getByRole('link', {
        name: 'Explorar catálogo',
      }).getAttribute('href'),
    ).toBe('/catalogo')

    expect(
      screen.queryByRole('button', {
        name: 'Confirmar pedido simulado',
      }),
    ).toBeNull()

    expect(submitCheckoutMock).not.toHaveBeenCalled()
  })

  it('muestra productos, cantidades y total estimado', () => {
    setCart([
      cartItem(firstProduct, 2),
      cartItem(secondProduct, 1),
    ])

    renderCheckout()

    expect(screen.getByText('Cuaderno premium')).toBeTruthy()
    expect(screen.getByText('Bolígrafo premium')).toBeTruthy()

    expect(
      screen.getAllByText('Cantidad: 2'),
    ).toHaveLength(1)

    expect(
      screen.getAllByText('Cantidad: 1'),
    ).toHaveLength(1)

    expect(
      screen.getByText('Total estimado'),
    ).toBeTruthy()

    expect(
      screen.getByText(/importe definitivo se calculará/),
    ).toBeTruthy()

    expect(
      screen.getByRole('link', {
        name: 'Volver a mi carrito',
      }).getAttribute('href'),
    ).toBe('/carrito')
  })

  it('informa que no se realizan cobros reales', () => {
    renderCheckout()

    expect(
      screen.getByText(/No se realizará ningún cargo real/),
    ).toBeTruthy()

    expect(
      screen.getByText(/No ingreses información de tarjetas/),
    ).toBeTruthy()
  })

  it('deshabilita el botón cuando no hay usuario', () => {
    useAuthMock.mockReturnValue({
      user: null,
    })

    renderCheckout()

    expect(confirmButton().disabled).toBe(true)

    fireEvent.click(confirmButton())

    expect(submitCheckoutMock).not.toHaveBeenCalled()
  })

  it('impide confirmar productos sin stock suficiente', () => {
    setCart([
      cartItem({
        ...firstProduct,
        stock: 1,
      }, 2),
    ])

    renderCheckout()

    expect(confirmButton().disabled).toBe(true)

    expect(
      screen.getByText(/productos sin existencias válidas/),
    ).toBeTruthy()

    expect(submitCheckoutMock).not.toHaveBeenCalled()
  })

  it('impide confirmar cantidades superiores al límite', () => {
    setCart([
      cartItem({
        ...firstProduct,
        stock: 200,
      }, 100),
    ])

    renderCheckout()

    expect(confirmButton().disabled).toBe(true)
    expect(submitCheckoutMock).not.toHaveBeenCalled()
  })

  it('envía únicamente productos y cantidades junto con la clave', async () => {
    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(submitCheckoutMock).toHaveBeenCalledTimes(1)
    })

    expect(submitCheckoutMock.mock.calls[0][0]).toBe(testUser)

    expect(submittedRequest()).toEqual({
      idempotencyKey:
        '11111111-1111-4111-8111-111111111111',
      items: [
        {
          productId: 'producto-001',
          quantity: 2,
        },
      ],
    })

    expect(randomUUIDMock).toHaveBeenCalledTimes(1)
  })

  it('bloquea confirmaciones mientras existe una solicitud pendiente', async () => {
    let resolveRequest:
      | ((result: CheckoutSuccessResponse) => void)
      | undefined

    submitCheckoutMock.mockImplementation(
      () =>
        new Promise<CheckoutSuccessResponse>((resolve) => {
          resolveRequest = resolve
        }),
    )

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Confirmando pedido…',
        }),
      ).toBeTruthy()
    })

    const pendingButton = screen.getByRole(
      'button',
      { name: 'Confirmando pedido…' },
    ) as HTMLButtonElement

    expect(pendingButton.disabled).toBe(true)

    fireEvent.click(pendingButton)

    expect(submitCheckoutMock).toHaveBeenCalledTimes(1)

    if (!resolveRequest) {
      throw new Error('La solicitud simulada no se inició.')
    }

    resolveRequest(orderResponse())

    await waitFor(() => {
      expect(clearCartIfUnchangedMock).toHaveBeenCalledTimes(1)
    })
  })

  it('muestra la confirmación y limpia el carrito después del éxito', async () => {
    submitCheckoutMock.mockResolvedValue(
      orderResponse(false, 7500),
    )

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(
        screen.getByText('Tu orden fue registrada'),
      ).toBeTruthy()
    })

    expect(
      screen.getByText('orden-test-001'),
    ).toBeTruthy()

    expect(
      screen.getByText('Pendiente'),
    ).toBeTruthy()

    expect(
      screen.getByText('Total confirmado'),
    ).toBeTruthy()

    const totalLabel = screen.getByText('Total confirmado')
    const totalValue = totalLabel.nextElementSibling?.textContent

    const normalizedTotal = totalValue
      ?.replace(/[\u200e\u200f\u061c]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    expect(normalizedTotal).toBe('S/ 75.00')

    expect(clearCartIfUnchangedMock).toHaveBeenCalledTimes(1)

    expect(
      window.sessionStorage.getItem(
        'papelcorpsac:checkout-attempt:v1',
      ),
    ).toBeNull()

    expect(
      screen.queryByRole('button', {
        name: 'Confirmar pedido simulado',
      }),
    ).toBeNull()
  })

  it('reconoce una orden recuperada por idempotencia', async () => {
    submitCheckoutMock.mockResolvedValue(
      orderResponse(true),
    )

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(
        screen.getByText(/Se recuperó una orden confirmada anteriormente/),
      ).toBeTruthy()
    })

    expect(clearCartIfUnchangedMock).toHaveBeenCalledTimes(1)
  })

  it('muestra el error de stock sin vaciar el carrito', async () => {
    submitCheckoutMock.mockRejectedValue(
      new CheckoutClientError('conflict'),
    )

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(
        screen.getByRole('alert').textContent,
      ).toMatch(/no tenga stock disponible/)
    })

    expect(clearCartIfUnchangedMock).not.toHaveBeenCalled()

    expect(
      screen.getByText('Cuaderno premium'),
    ).toBeTruthy()
  })

  it('muestra un mensaje cuando el servicio está deshabilitado', async () => {
    submitCheckoutMock.mockRejectedValue(
      new CheckoutClientError('unavailable'),
    )

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(
        screen.getByRole('alert').textContent,
      ).toMatch(/no está disponible en este entorno/)
    })

    expect(clearCartIfUnchangedMock).not.toHaveBeenCalled()
  })

  it('conserva la clave de idempotencia al reintentar el mismo pedido', async () => {
    submitCheckoutMock
      .mockRejectedValueOnce(
        new CheckoutClientError('unavailable'),
      )
      .mockResolvedValueOnce(orderResponse())

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
    })

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(submitCheckoutMock).toHaveBeenCalledTimes(2)
    })

    expect(
      submittedRequest(0).idempotencyKey,
    ).toBe(
      submittedRequest(1).idempotencyKey,
    )

    expect(randomUUIDMock).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(clearCartIfUnchangedMock).toHaveBeenCalledTimes(1)
    })
  })

  it('genera una clave nueva si cambian las cantidades', async () => {
    randomUUIDMock
      .mockReturnValueOnce(
        '11111111-1111-4111-8111-111111111111',
      )
      .mockReturnValueOnce(
        '22222222-2222-4222-8222-222222222222',
      )

    submitCheckoutMock.mockRejectedValue(
      new CheckoutClientError('unavailable'),
    )

    const view = renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
    })

    setCart([cartItem(firstProduct, 3)])

    view.rerender(
      <MemoryRouter initialEntries={['/checkout']}>
        <CheckoutPage />
      </MemoryRouter>,
    )

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(submitCheckoutMock).toHaveBeenCalledTimes(2)
    })

    expect(
      submittedRequest(0).idempotencyKey,
    ).not.toBe(
      submittedRequest(1).idempotencyKey,
    )

    expect(submittedRequest(1).items).toEqual([
      {
        productId: 'producto-001',
        quantity: 3,
      },
    ])

    expect(randomUUIDMock).toHaveBeenCalledTimes(2)
    expect(clearCartIfUnchangedMock).not.toHaveBeenCalled()
  })

  it('muestra un error inesperado sin confirmar la compra', async () => {
    submitCheckoutMock.mockRejectedValue(
      new Error('Unexpected failure'),
    )

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(
        screen.getByRole('alert').textContent,
      ).toMatch(/Ocurrió un error inesperado/)
    })

    expect(clearCartIfUnchangedMock).not.toHaveBeenCalled()

    expect(
      screen.queryByText('Tu orden fue registrada'),
    ).toBeNull()
  })

  it('C1-A: no vacía un carrito modificado durante una solicitud pendiente', async () => {
    let resolveRequest:
      | ((result: CheckoutSuccessResponse) => void)
      | undefined

    submitCheckoutMock.mockImplementation(
      () =>
        new Promise<CheckoutSuccessResponse>((resolve) => {
          resolveRequest = resolve
        }),
    )

    const view = renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(submitCheckoutMock).toHaveBeenCalledTimes(1)
    })

    expect(submittedRequest().items).toEqual([
      {
        productId: 'producto-001',
        quantity: 2,
      },
    ])

    setCart([
      cartItem(firstProduct, 2),
      cartItem(secondProduct, 1),
    ])

    view.rerender(
      <MemoryRouter initialEntries={['/checkout']}>
        <CheckoutPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Bolígrafo premium')).toBeTruthy()

    if (!resolveRequest) {
      throw new Error('La solicitud simulada no se inició.')
    }

    resolveRequest(orderResponse())

    await waitFor(() => {
      expect(
        screen.getByText('Tu orden fue registrada'),
      ).toBeTruthy()
    })

    expect(clearCartIfUnchangedMock).toHaveBeenCalledTimes(1)

    expect(clearCartIfUnchangedMock).toHaveBeenCalledWith([
      {
        productId: 'producto-001',
        quantity: 2,
      },
    ])

    expect(clearCartMock).not.toHaveBeenCalled()
  })

  it('C1-B: conserva la clave al volver al checkout después de una respuesta incierta', async () => {
    randomUUIDMock
      .mockReturnValueOnce(
        '11111111-1111-4111-8111-111111111111',
      )
      .mockReturnValueOnce(
        '22222222-2222-4222-8222-222222222222',
      )

    submitCheckoutMock
      .mockRejectedValueOnce(
        new CheckoutClientError('unavailable'),
      )
      .mockResolvedValueOnce(orderResponse(true))

    const firstView = renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(
        screen.getByRole('alert').textContent,
      ).toMatch(/no está disponible en este entorno/)
    })

    expect(submitCheckoutMock).toHaveBeenCalledTimes(1)

    const firstRequest = submittedRequest(0)

    firstView.unmount()

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(submitCheckoutMock).toHaveBeenCalledTimes(2)
    })

    const secondRequest = submittedRequest(1)

    expect(secondRequest.items).toEqual(firstRequest.items)

    expect(secondRequest.idempotencyKey).toBe(
      firstRequest.idempotencyKey,
    )

    expect(randomUUIDMock).toHaveBeenCalledTimes(1)
  })

  it('descarta un intento corrupto y genera una clave nueva', async () => {
    window.sessionStorage.setItem(
      'papelcorpsac:checkout-attempt:v1',
      '{invalid-json',
    )

    submitCheckoutMock.mockRejectedValue(
      new CheckoutClientError('unavailable'),
    )

    renderCheckout()

    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
    })

    expect(randomUUIDMock).toHaveBeenCalledTimes(1)

    const storedValue = window.sessionStorage.getItem(
      'papelcorpsac:checkout-attempt:v1',
    )

    expect(storedValue).not.toBeNull()

    const storedAttempt = JSON.parse(storedValue!)

    expect(storedAttempt.version).toBe(1)

    expect(storedAttempt.idempotencyKey).toBe(
      '11111111-1111-4111-8111-111111111111',
    )

    expect(storedAttempt.userId).toBe(testUser.uid)
  })
})

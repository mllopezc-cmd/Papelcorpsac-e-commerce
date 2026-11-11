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
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import type { Order } from '../types/order'

const { useAuthMock, getUserOrderByIdMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getUserOrderByIdMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../services/orderService', () => ({
  getUserOrderById: getUserOrderByIdMock,
}))

import { OrderDetailPage } from './OrderDetailPage'

const testUser = {
  uid: 'customer-001',
}

function orderFixture(): Order {
  return {
    id: 'order-001',
    userId: 'customer-001',
    status: 'pending',
    currency: 'PEN',
    items: [
      {
        productId: 'producto-001',
        name: 'Cuaderno premium',
        quantity: 2,
        unitPriceCents: 1250,
        subtotalCents: 2500,
      },
      {
        productId: 'producto-002',
        name: 'Bolígrafo premium',
        quantity: 1,
        unitPriceCents: 1250,
        subtotalCents: 1250,
      },
    ],
    totalCents: 3750,
    createdAt: {
      toDate: () => new Date('2026-11-11T04:35:46.000Z'),
    } as Order['createdAt'],
  }
}

function renderOrderDetail(
  orderId = 'order-001',
) {
  return render(
    <MemoryRouter
      initialEntries={[`/mis-ordenes/${orderId}`]}
    >
      <Routes>
        <Route
          path="/mis-ordenes/:orderId"
          element={<OrderDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  useAuthMock.mockReturnValue({
    user: testUser,
  })

  getUserOrderByIdMock.mockResolvedValue(
    orderFixture(),
  )
})

afterEach(() => {
  cleanup()
})

describe('OrderDetailPage', () => {
  it('muestra el estado de carga mientras consulta la orden', () => {
    getUserOrderByIdMock.mockReturnValue(
      new Promise(() => {}),
    )

    renderOrderDetail()

    expect(
      screen.getByText('Cargando detalle de la orden…'),
    ).toBeTruthy()

    expect(getUserOrderByIdMock).toHaveBeenCalledWith(
      testUser.uid,
      'order-001',
    )
  })

  it('muestra los artículos y el importe confirmado de la orden', async () => {
    renderOrderDetail()

    expect(
      await screen.findByText('order-001'),
    ).toBeTruthy()

    expect(
      screen.getByText('Cuaderno premium'),
    ).toBeTruthy()

    expect(
      screen.getByText('Bolígrafo premium'),
    ).toBeTruthy()

    expect(
      screen.getByText('Cantidad: 2'),
    ).toBeTruthy()

    expect(
      screen.getByText('Cantidad: 1'),
    ).toBeTruthy()

    expect(
      screen.getByText('Pendiente'),
    ).toBeTruthy()

    expect(
      screen.getByText('Total confirmado'),
    ).toBeTruthy()

    expect(
      screen.getByText('S/ 37.50'),
    ).toBeTruthy()

    expect(
      screen.getByText(/No se realizaron cobros reales/),
    ).toBeTruthy()

    expect(
      screen.getByRole('link', {
        name: 'Volver a mis órdenes',
      }).getAttribute('href'),
    ).toBe('/mis-ordenes')
  })

  it('muestra un mensaje cuando la orden no existe', async () => {
    getUserOrderByIdMock.mockResolvedValue(null)

    renderOrderDetail('order-missing')

    expect(
      await screen.findByText(
        'No encontramos esta orden.',
      ),
    ).toBeTruthy()
  })

  it('muestra un error cuando falla la consulta', async () => {
    getUserOrderByIdMock.mockRejectedValue(
      new Error('Permission denied'),
    )

    renderOrderDetail()

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    expect(
      screen.getByText(
        'No fue posible consultar esta orden.',
      ),
    ).toBeTruthy()
  })

  it('permite reintentar después de un error', async () => {
    getUserOrderByIdMock
      .mockRejectedValueOnce(new Error('Firestore unavailable'))
      .mockResolvedValueOnce(orderFixture())

    renderOrderDetail()

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Reintentar',
      }),
    )

    expect(
      await screen.findByText('Cuaderno premium'),
    ).toBeTruthy()

    await waitFor(() => {
      expect(getUserOrderByIdMock).toHaveBeenCalledTimes(2)
    })
  })
})

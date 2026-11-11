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
import { MemoryRouter } from 'react-router'
import type { Order } from '../types/order'

const { useAuthMock, getUserOrdersMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getUserOrdersMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../services/orderService', () => ({
  getUserOrders: getUserOrdersMock,
}))

import { OrdersPage } from './OrdersPage'

const testUser = {
  uid: 'customer-001',
}

function orderFixture(
  overrides: Partial<Order> = {},
): Order {
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
    ],
    totalCents: 2500,
    createdAt: {
      toDate: () => new Date('2026-11-11T04:35:46.000Z'),
    } as Order['createdAt'],
    ...overrides,
  }
}

function renderOrders() {
  return render(
    <MemoryRouter initialEntries={['/mis-ordenes']}>
      <OrdersPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  useAuthMock.mockReturnValue({
    user: testUser,
  })

  getUserOrdersMock.mockResolvedValue([])
})

afterEach(() => {
  cleanup()
})

describe('OrdersPage', () => {
  it('muestra el estado de carga mientras consulta las órdenes', () => {
    getUserOrdersMock.mockReturnValue(
      new Promise(() => {}),
    )

    renderOrders()

    expect(
      screen.getByText('Cargando tus órdenes…'),
    ).toBeTruthy()

    expect(getUserOrdersMock).toHaveBeenCalledWith(
      testUser.uid,
    )
  })

  it('muestra un mensaje cuando el usuario no tiene órdenes', async () => {
    renderOrders()

    expect(
      await screen.findByText(
        'Aún no tienes órdenes registradas.',
      ),
    ).toBeTruthy()

    expect(
      screen.getByRole('link', {
        name: 'Explorar catálogo',
      }).getAttribute('href'),
    ).toBe('/catalogo')
  })

  it('muestra las órdenes y permite acceder a su detalle', async () => {
    getUserOrdersMock.mockResolvedValue([
      orderFixture({
        id: 'order-new',
        totalCents: 5000,
        status: 'completed',
      }),
      orderFixture({
        id: 'order-old',
        totalCents: 2500,
        status: 'pending',
      }),
    ])

    renderOrders()

    const newOrder = await screen.findByText('order-new')
    const oldOrder = screen.getByText('order-old')

    expect(newOrder).toBeTruthy()
    expect(oldOrder).toBeTruthy()

    expect(
      newOrder.compareDocumentPosition(oldOrder) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    expect(screen.getByText('Completada')).toBeTruthy()
    expect(screen.getByText('Pendiente')).toBeTruthy()

    const detailLinks = screen.getAllByRole('link', {
      name: 'Ver detalle',
    })

    expect(detailLinks).toHaveLength(2)
    expect(detailLinks[0].getAttribute('href')).toBe(
      '/mis-ordenes/order-new',
    )
    expect(detailLinks[1].getAttribute('href')).toBe(
      '/mis-ordenes/order-old',
    )
  })

  it('permite reintentar cuando falla la consulta', async () => {
    getUserOrdersMock
      .mockRejectedValueOnce(new Error('Firestore unavailable'))
      .mockResolvedValueOnce([
        orderFixture(),
      ])

    renderOrders()

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Reintentar',
      }),
    )

    expect(
      await screen.findByText('order-001'),
    ).toBeTruthy()

    await waitFor(() => {
      expect(getUserOrdersMock).toHaveBeenCalledTimes(2)
    })
  })
})

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
import type { Order } from '../types/order'

const {
  getAdminOrdersMock,
  updateAdminOrderStatusMock,
} = vi.hoisted(() => ({
  getAdminOrdersMock: vi.fn(),
  updateAdminOrderStatusMock: vi.fn(),
}))

vi.mock('../services/orderService', () => ({
  getAdminOrders: getAdminOrdersMock,
  updateAdminOrderStatus: updateAdminOrderStatusMock,
}))

import { AdminOrdersPage } from './AdminOrdersPage'

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
      toDate: () =>
        new Date('2026-11-11T04:35:46.000Z'),
    } as Order['createdAt'],
    ...overrides,
  }
}

const sampleOrders: Order[] = [
  orderFixture(),
  orderFixture({
    id: 'order-002',
    userId: 'customer-002',
    status: 'completed',
  }),
]

function statusSelect(orderId: string): HTMLSelectElement {
  return screen.getByRole('combobox', {
    name: `Nuevo estado de la orden ${orderId}`,
  }) as HTMLSelectElement
}

function saveButton(orderId: string): HTMLButtonElement {
  return screen.getByRole('button', {
    name: `Guardar estado de ${orderId}`,
  }) as HTMLButtonElement
}

beforeEach(() => {
  vi.clearAllMocks()
  getAdminOrdersMock.mockResolvedValue(sampleOrders)
  updateAdminOrderStatusMock.mockResolvedValue(undefined)
  vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('AdminOrdersPage — T11.3', () => {
  it('muestra el estado de carga', () => {
    getAdminOrdersMock.mockReturnValue(
      new Promise(() => {}),
    )

    render(<AdminOrdersPage />)

    expect(
      screen.getByText('Cargando órdenes…'),
    ).toBeTruthy()
  })

  it('muestra el estado vacío', async () => {
    getAdminOrdersMock.mockResolvedValue([])

    render(<AdminOrdersPage />)

    expect(
      await screen.findByText('No hay órdenes registradas.'),
    ).toBeTruthy()
  })

  it('muestra las órdenes y sus datos comerciales', async () => {
    render(<AdminOrdersPage />)

    expect(
      await screen.findByText('order-001'),
    ).toBeTruthy()

    expect(screen.getByText('order-002')).toBeTruthy()
    expect(
      screen.getAllByText('Cuaderno premium × 2'),
    ).toHaveLength(2)

    expect(
      screen.getByText('Cliente: customer-001'),
    ).toBeTruthy()

    expect(
      screen.getByText('Cliente: customer-002'),
    ).toBeTruthy()

    expect(
      screen.getByText('Mostrando 2 de 2 órdenes.'),
    ).toBeTruthy()
  })

  it('filtra por estado sin modificar Firestore', async () => {
    render(<AdminOrdersPage />)

    await screen.findByText('order-001')

    fireEvent.change(
      screen.getByRole('combobox', {
        name: 'Filtrar por estado',
      }),
      { target: { value: 'completed' } },
    )

    expect(screen.queryByText('order-001')).toBeNull()
    expect(screen.getByText('order-002')).toBeTruthy()

    expect(
      screen.getByText('Mostrando 1 de 2 órdenes.'),
    ).toBeTruthy()

    expect(
      updateAdminOrderStatusMock,
    ).not.toHaveBeenCalled()
  })

  it('muestra un mensaje si el filtro no tiene resultados', async () => {
    render(<AdminOrdersPage />)

    await screen.findByText('order-001')

    fireEvent.change(
      screen.getByRole('combobox', {
        name: 'Filtrar por estado',
      }),
      { target: { value: 'cancelled' } },
    )

    expect(
      screen.getByText(
        'No hay órdenes con el estado seleccionado.',
      ),
    ).toBeTruthy()
  })

  it('no guarda si el estado no cambió', async () => {
    render(<AdminOrdersPage />)

    await screen.findByText('order-001')

    expect(saveButton('order-001').disabled).toBe(true)

    expect(
      updateAdminOrderStatusMock,
    ).not.toHaveBeenCalled()
  })

  it('actualiza el estado después de confirmar', async () => {
    render(<AdminOrdersPage />)

    await screen.findByText('order-001')

    fireEvent.change(statusSelect('order-001'), {
      target: { value: 'processing' },
    })

    expect(
      updateAdminOrderStatusMock,
    ).not.toHaveBeenCalled()

    fireEvent.click(saveButton('order-001'))

    await waitFor(() => {
      expect(
        updateAdminOrderStatusMock,
      ).toHaveBeenCalledWith(
        'order-001',
        'processing',
      )
    })

    expect(
      await screen.findByText(
        'Estado de la orden order-001 actualizado correctamente.',
      ),
    ).toBeTruthy()

    expect(statusSelect('order-001').value).toBe('processing')

    expect(saveButton('order-001').disabled).toBe(true)
  })

  it('no modifica la orden si se cancela la confirmación', async () => {
    vi.mocked(window.confirm).mockReturnValue(false)

    render(<AdminOrdersPage />)

    await screen.findByText('order-001')

    fireEvent.change(statusSelect('order-001'), {
      target: { value: 'completed' },
    })

    fireEvent.click(saveButton('order-001'))

    expect(window.confirm).toHaveBeenCalled()
    expect(
      updateAdminOrderStatusMock,
    ).not.toHaveBeenCalled()
  })

  it('mantiene el estado anterior si falla la actualización', async () => {
    updateAdminOrderStatusMock.mockRejectedValue(
      { code: 'permission-denied' },
    )

    render(<AdminOrdersPage />)

    await screen.findByText('order-001')

    fireEvent.change(statusSelect('order-001'), {
      target: { value: 'completed' },
    })

    fireEvent.click(saveButton('order-001'))

    expect(
      await screen.findByRole('alert'),
    ).toHaveProperty(
      'textContent',
      'No tienes permisos para realizar esta operación.',
    )

    expect(statusSelect('order-001').value).toBe('completed')
    expect(saveButton('order-001').disabled).toBe(false)
  })

  it('permite reintentar después de un error de lectura', async () => {
    getAdminOrdersMock
      .mockRejectedValueOnce(new Error('Sin conexión'))
      .mockResolvedValueOnce(sampleOrders)

    render(<AdminOrdersPage />)

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
      expect(getAdminOrdersMock).toHaveBeenCalledTimes(2)
    })
  })

  it('permite actualizar manualmente el listado', async () => {
    render(<AdminOrdersPage />)

    await screen.findByText('order-001')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Actualizar listado',
      }),
    )

    await waitFor(() => {
      expect(getAdminOrdersMock).toHaveBeenCalledTimes(2)
    })
  })

  it('deshabilita cambios mientras guarda', async () => {
    updateAdminOrderStatusMock.mockReturnValue(
      new Promise(() => {}),
    )

    render(<AdminOrdersPage />)

    await screen.findByText('order-001')

    fireEvent.change(statusSelect('order-001'), {
      target: { value: 'processing' },
    })

    fireEvent.click(saveButton('order-001'))

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Guardando… de order-001',
        }),
      ).toBeTruthy()
    })

    expect(statusSelect('order-001').disabled).toBe(true)
    expect(statusSelect('order-002').disabled).toBe(true)
  })
})

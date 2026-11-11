import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const { loadFirestoreMock, firestoreMock } = vi.hoisted(() => {
  class MockTimestamp {
    readonly milliseconds: number

    constructor(milliseconds: number) {
      this.milliseconds = milliseconds
    }

    toMillis() {
      return this.milliseconds
    }
  }

  return {
    loadFirestoreMock: vi.fn(),
    firestoreMock: {
      Timestamp: MockTimestamp,
      collection: vi.fn(),
      where: vi.fn(),
      query: vi.fn(),
      getDocs: vi.fn(),
      doc: vi.fn(),
      getDoc: vi.fn(),
    },
  }
})

vi.mock('../lib/firebase', () => ({
  loadFirestore: loadFirestoreMock,
}))

import {
  getUserOrderById,
  getUserOrders,
} from './orderService'

const dbMock = {}

function orderData(
  overrides: Record<string, unknown> = {},
) {
  return {
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
    createdAt: new firestoreMock.Timestamp(1000),
    ...overrides,
  }
}

function orderDocument(
  id: string,
  data: Record<string, unknown>,
) {
  return {
    id,
    data: () => data,
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  loadFirestoreMock.mockResolvedValue({
    db: dbMock,
    firestore: firestoreMock,
  })

  firestoreMock.collection.mockReturnValue('orders-collection')
  firestoreMock.where.mockReturnValue('owner-filter')
  firestoreMock.query.mockReturnValue('orders-query')
  firestoreMock.doc.mockReturnValue('order-reference')
})

describe('getUserOrders', () => {
  it('consulta únicamente las órdenes del usuario indicado', async () => {
    firestoreMock.getDocs.mockResolvedValue({
      docs: [
        orderDocument('order-001', orderData()),
      ],
    })

    await getUserOrders('customer-001')

    expect(firestoreMock.collection).toHaveBeenCalledWith(
      dbMock,
      'orders',
    )

    expect(firestoreMock.where).toHaveBeenCalledWith(
      'userId',
      '==',
      'customer-001',
    )

    expect(firestoreMock.query).toHaveBeenCalledWith(
      'orders-collection',
      'owner-filter',
    )

    expect(firestoreMock.getDocs).toHaveBeenCalledWith(
      'orders-query',
    )
  })

  it('devuelve las órdenes ordenadas de la más reciente a la más antigua', async () => {
    firestoreMock.getDocs.mockResolvedValue({
      docs: [
        orderDocument(
          'order-old',
          orderData({
            createdAt: new firestoreMock.Timestamp(1000),
          }),
        ),
        orderDocument(
          'order-new',
          orderData({
            createdAt: new firestoreMock.Timestamp(3000),
          }),
        ),
        orderDocument(
          'order-middle',
          orderData({
            createdAt: new firestoreMock.Timestamp(2000),
          }),
        ),
      ],
    })

    const orders = await getUserOrders('customer-001')

    expect(orders.map((order) => order.id)).toEqual([
      'order-new',
      'order-middle',
      'order-old',
    ])
  })

  it('devuelve un arreglo vacío cuando el usuario no tiene órdenes', async () => {
    firestoreMock.getDocs.mockResolvedValue({
      docs: [],
    })

    const orders = await getUserOrders('customer-001')

    expect(orders).toEqual([])
  })

  it('rechaza un UID vacío o inválido sin consultar Firestore', async () => {
    await expect(getUserOrders('')).rejects.toThrow(
      'El usuario no es válido.',
    )

    await expect(getUserOrders(' customer-001')).rejects.toThrow(
      'El usuario no es válido.',
    )

    expect(loadFirestoreMock).not.toHaveBeenCalled()
  })

  it('rechaza documentos de órdenes con datos inválidos', async () => {
    firestoreMock.getDocs.mockResolvedValue({
      docs: [
        orderDocument(
          'order-invalid',
          orderData({
            totalCents: 3000,
          }),
        ),
      ],
    })

    await expect(
      getUserOrders('customer-001'),
    ).rejects.toThrow(
      'El importe de la orden no es válido.',
    )
  })

  it('rechaza artículos con subtotales incorrectos', async () => {
    firestoreMock.getDocs.mockResolvedValue({
      docs: [
        orderDocument(
          'order-invalid',
          orderData({
            items: [
              {
                productId: 'producto-001',
                name: 'Cuaderno premium',
                quantity: 2,
                unitPriceCents: 1250,
                subtotalCents: 2000,
              },
            ],
            totalCents: 2000,
          }),
        ),
      ],
    })

    await expect(
      getUserOrders('customer-001'),
    ).rejects.toThrow(
      'La orden contiene artículos inválidos.',
    )
  })
})

describe('getUserOrderById', () => {
  it('devuelve una orden existente del usuario autenticado', async () => {
    firestoreMock.getDoc.mockResolvedValue({
      id: 'order-001',
      exists: () => true,
      data: () => orderData(),
    })

    const order = await getUserOrderById(
      'customer-001',
      'order-001',
    )

    expect(firestoreMock.doc).toHaveBeenCalledWith(
      dbMock,
      'orders',
      'order-001',
    )

    expect(order).toMatchObject({
      id: 'order-001',
      userId: 'customer-001',
      status: 'pending',
      currency: 'PEN',
      totalCents: 2500,
    })
  })

  it('devuelve null cuando la orden no existe', async () => {
    firestoreMock.getDoc.mockResolvedValue({
      id: 'order-missing',
      exists: () => false,
    })

    const order = await getUserOrderById(
      'customer-001',
      'order-missing',
    )

    expect(order).toBeNull()
  })

  it('rechaza el acceso cuando la orden pertenece a otro usuario', async () => {
    firestoreMock.getDoc.mockResolvedValue({
      id: 'order-other',
      exists: () => true,
      data: () =>
        orderData({
          userId: 'customer-002',
        }),
    })

    await expect(
      getUserOrderById('customer-001', 'order-other'),
    ).rejects.toThrow(
      'No se pudo acceder a esta orden.',
    )
  })

  it('rechaza identificadores de orden inválidos sin consultar Firestore', async () => {
    await expect(
      getUserOrderById('customer-001', ''),
    ).rejects.toThrow(
      'Los datos de consulta de la orden no son válidos.',
    )

    await expect(
      getUserOrderById('customer-001', 'orders/order-001'),
    ).rejects.toThrow(
      'Los datos de consulta de la orden no son válidos.',
    )

    expect(loadFirestoreMock).not.toHaveBeenCalled()
  })

  it('rechaza una orden con un estado no admitido', async () => {
    firestoreMock.getDoc.mockResolvedValue({
      id: 'order-invalid',
      exists: () => true,
      data: () =>
        orderData({
          status: 'refunded',
        }),
    })

    await expect(
      getUserOrderById('customer-001', 'order-invalid'),
    ).rejects.toThrow(
      'La orden contiene datos inválidos.',
    )
  })
})

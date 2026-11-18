import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const { loadFirestoreMock, firestoreMock, dbMock, deleteFieldValue } =
  vi.hoisted(() => {
    const db = { name: 'test-database' }
    const deletedField = { type: 'delete-field-sentinel' }

    const firestore = {
      collection: vi.fn(),
      where: vi.fn(),
      query: vi.fn(),
      getDocs: vi.fn(),
      getDoc: vi.fn(),
      doc: vi.fn(),
      addDoc: vi.fn(),
      updateDoc: vi.fn(),
      deleteDoc: vi.fn(),
      deleteField: vi.fn(),
    }

    return {
      loadFirestoreMock: vi.fn(),
      firestoreMock: firestore,
      dbMock: db,
      deleteFieldValue: deletedField,
    }
  })

vi.mock('../lib/firebase', () => ({
  loadFirestore: loadFirestoreMock,
}))

import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getPublishedProducts,
  updateProduct,
} from './productService'

const validInput = {
  name: 'Cuaderno de prueba',
  description: 'Cuaderno para pruebas del servicio.',
  category: 'stationery' as const,
  price: 25.5,
  brand: 'PAPEL CORP',
  stock: 15,
  published: false,
}

function createDocument(id: string, data: object) {
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

  firestoreMock.collection.mockReturnValue({
    type: 'products-collection',
  })

  firestoreMock.doc.mockReturnValue({
    type: 'product-document',
  })

  firestoreMock.addDoc.mockResolvedValue({
    id: 'new-product-id',
  })

  firestoreMock.deleteField.mockReturnValue(deleteFieldValue)
  firestoreMock.updateDoc.mockResolvedValue(undefined)
  firestoreMock.deleteDoc.mockResolvedValue(undefined)
})

describe('productService', () => {
  describe('getAdminProducts', () => {
    it('consulta productos publicados y no publicados', async () => {
      const publishedProduct = createDocument('product-a', {
        ...validInput,
        published: true,
      })

      const unpublishedProduct = createDocument('product-b', {
        ...validInput,
        name: 'Archivador',
        published: false,
      })

      firestoreMock.getDocs.mockResolvedValue({
        docs: [publishedProduct, unpublishedProduct],
      })

      const products = await getAdminProducts()

      expect(products).toHaveLength(2)
      expect(products[0].name).toBe('Archivador')
      expect(products[0].published).toBe(false)
      expect(products[1].published).toBe(true)

      expect(firestoreMock.getDocs).toHaveBeenCalledTimes(1)
      expect(firestoreMock.where).not.toHaveBeenCalled()
    })

    it('devuelve una lista vacía cuando no hay productos', async () => {
      firestoreMock.getDocs.mockResolvedValue({
        docs: [],
      })

      await expect(getAdminProducts()).resolves.toEqual([])
    })
  })

  describe('createProduct', () => {
    it('crea un producto y devuelve el ID generado', async () => {
      const productId = await createProduct(validInput)

      expect(productId).toBe('new-product-id')
      expect(firestoreMock.addDoc).toHaveBeenCalledTimes(1)

      const [, productData] = firestoreMock.addDoc.mock.calls[0]

      expect(productData).toEqual({
        ...validInput,
        imageUrl: '/images/product-placeholder.svg',
      })
    })

    it('normaliza espacios en los campos de texto', async () => {
      await createProduct({
        ...validInput,
        name: '  Cuaderno especial  ',
        brand: '  PAPEL CORP  ',
      })

      const [, productData] = firestoreMock.addDoc.mock.calls[0]

      expect(productData.name).toBe('Cuaderno especial')
      expect(productData.brand).toBe('PAPEL CORP')
    })

    it('rechaza datos inválidos antes de escribir en Firestore', async () => {
      await expect(
        createProduct({
          ...validInput,
          price: 0,
        }),
      ).rejects.toThrow('Los datos del producto son inválidos.')

      expect(loadFirestoreMock).not.toHaveBeenCalled()
      expect(firestoreMock.addDoc).not.toHaveBeenCalled()
    })

    it('rechaza precios con más de dos decimales', async () => {
      await expect(
        createProduct({
          ...validInput,
          price: 12.345,
        }),
      ).rejects.toThrow('Los datos del producto son inválidos.')

      expect(firestoreMock.addDoc).not.toHaveBeenCalled()
    })

    it('rechaza stock negativo o no entero', async () => {
      await expect(
        createProduct({
          ...validInput,
          stock: -1,
        }),
      ).rejects.toThrow('Los datos del producto son inválidos.')

      await expect(
        createProduct({
          ...validInput,
          stock: 2.5,
        }),
      ).rejects.toThrow('Los datos del producto son inválidos.')

      expect(firestoreMock.addDoc).not.toHaveBeenCalled()
    })
  })

  describe('updateProduct', () => {
    it('actualiza un documento y elimina sourceUrl cuando se omite', async () => {
      await expect(
        updateProduct('product-123', {
          ...validInput,
          published: true,
        }),
      ).resolves.toBeUndefined()

      expect(firestoreMock.doc).toHaveBeenCalledWith(
        dbMock,
        'products',
        'product-123',
      )

      expect(firestoreMock.deleteField).toHaveBeenCalledTimes(1)

      expect(firestoreMock.updateDoc).toHaveBeenCalledWith(
        { type: 'product-document' },
        {
          ...validInput,
          published: true,
          imageUrl: '/images/product-placeholder.svg',
          sourceUrl: deleteFieldValue,
        },
      )

      expect(firestoreMock.addDoc).not.toHaveBeenCalled()
    })

    it('conserva sourceUrl cuando se proporciona una URL válida', async () => {
      const sourceUrl = 'https://example.com/producto'

      await expect(
        updateProduct('product-456', {
          ...validInput,
          sourceUrl,
        }),
      ).resolves.toBeUndefined()

      expect(firestoreMock.updateDoc).toHaveBeenCalledWith(
        { type: 'product-document' },
        {
          ...validInput,
          imageUrl: '/images/product-placeholder.svg',
          sourceUrl,
        },
      )

      expect(firestoreMock.deleteField).not.toHaveBeenCalled()
    })

    it('rechaza identificadores inválidos', async () => {
      await expect(
        updateProduct('', validInput),
      ).rejects.toThrow('El identificador del producto no es válido.')

      await expect(
        updateProduct('products/123', validInput),
      ).rejects.toThrow('El identificador del producto no es válido.')

      expect(loadFirestoreMock).not.toHaveBeenCalled()
      expect(firestoreMock.updateDoc).not.toHaveBeenCalled()
    })
  })

  describe('deleteProduct', () => {
    it('elimina el documento solicitado', async () => {
      await expect(
        deleteProduct('product-123'),
      ).resolves.toBeUndefined()

      expect(firestoreMock.doc).toHaveBeenCalledWith(
        dbMock,
        'products',
        'product-123',
      )

      expect(firestoreMock.deleteDoc).toHaveBeenCalledWith({
        type: 'product-document',
      })
    })

    it('rechaza identificadores inválidos', async () => {
      await expect(
        deleteProduct(''),
      ).rejects.toThrow('El identificador del producto no es válido.')

      await expect(
        deleteProduct('products/123'),
      ).rejects.toThrow('El identificador del producto no es válido.')

      expect(loadFirestoreMock).not.toHaveBeenCalled()
      expect(firestoreMock.deleteDoc).not.toHaveBeenCalled()
    })
  })

  describe('getPublishedProducts', () => {
    it('conserva el filtro público de productos publicados', async () => {
      const publishedProduct = createDocument('product-public', {
        ...validInput,
        published: true,
      })

      firestoreMock.query.mockReturnValue({
        type: 'published-query',
      })

      firestoreMock.getDocs.mockResolvedValue({
        docs: [publishedProduct],
      })

      const products = await getPublishedProducts()

      expect(products).toHaveLength(1)
      expect(products[0].published).toBe(true)

      expect(firestoreMock.where).toHaveBeenCalledWith(
        'published',
        '==',
        true,
      )

      expect(firestoreMock.query).toHaveBeenCalledTimes(1)
    })
  })
})

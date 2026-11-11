import { describe, expect, it } from 'vitest'
import { cartReducer } from './cartReducer'
import type { CartState } from '../types/cart'
import type { Product } from '../types/product'

function createProduct(
  id = 'pencil-1',
  stock = 5,
  price = 12.5,
): Product {
  return {
    id,
    name: 'Lápiz de prueba',
    description: 'Producto de prueba',
    category: 'writing-instruments',
    price,
    brand: 'Sin marca',
    stock,
    published: false,
  }
}

function createProductWithoutStock(): Product {
  return {
    id: 'product-without-stock',
    name: 'Producto sin stock',
    description: 'Producto de prueba',
    category: 'stationery',
    price: 5,
    published: false,
  }
}

function createState(product: Product, quantity = 1): CartState {
  return { items: [{ product, quantity }] }
}

describe('cartReducer', () => {
  describe('ADD_ITEM', () => {
    it('agrega un producto válido con cantidad predeterminada de 1', () => {
      const state: CartState = { items: [] }
      const product = createProduct()

      const nextState = cartReducer(state, { type: 'ADD_ITEM', product })

      expect(nextState).toEqual({ items: [{ product, quantity: 1 }] })
      expect(nextState).not.toBe(state)
      expect(nextState.items).not.toBe(state.items)
    })

    it('agrega un producto válido con cantidad explícita', () => {
      const product = createProduct()

      const nextState = cartReducer(
        { items: [] },
        { type: 'ADD_ITEM', product, quantity: 3 },
      )

      expect(nextState.items).toEqual([{ product, quantity: 3 }])
    })

    it('acumula cantidades sin duplicar la línea del producto', () => {
      const existingProduct = createProduct()
      const addedProduct = createProduct()
      const state = createState(existingProduct, 2)

      const nextState = cartReducer(state, {
        type: 'ADD_ITEM',
        product: addedProduct,
        quantity: 2,
      })

      expect(nextState.items).toHaveLength(1)
      expect(nextState.items[0]).toEqual({
        product: addedProduct,
        quantity: 4,
      })
      expect(state.items[0].quantity).toBe(2)
    })

    it('rechaza una adición que supera el stock', () => {
      const state: CartState = { items: [] }

      expect(
        cartReducer(state, {
          type: 'ADD_ITEM',
          product: createProduct('pencil-1', 2),
          quantity: 3,
        }),
      ).toBe(state)
    })

    it.each([
      { description: 'ausente', product: createProductWithoutStock() },
      { description: 'cero', product: createProduct('zero-stock', 0) },
      { description: 'negativo', product: createProduct('negative-stock', -1) },
      { description: 'decimal', product: createProduct('decimal-stock', 1.5) },
      { description: 'NaN', product: createProduct('nan-stock', Number.NaN) },
      {
        description: 'infinito',
        product: createProduct('infinite-stock', Number.POSITIVE_INFINITY),
      },
    ])('rechaza el stock $description', ({ product }) => {
      const state: CartState = { items: [] }

      expect(cartReducer(state, { type: 'ADD_ITEM', product })).toBe(state)
    })

    it.each([
      0,
      -1,
      1.5,
      Number.MAX_SAFE_INTEGER + 1,
      Number.POSITIVE_INFINITY,
    ])(
      'rechaza la cantidad inválida %s',
      (quantity) => {
        const state: CartState = { items: [] }

        expect(
          cartReducer(state, {
            type: 'ADD_ITEM',
            product: createProduct(),
            quantity,
          }),
        ).toBe(state)
      },
    )

    it.each(['', ' pencil-1', 'pencil-1 ', 'pencil/1'])(
      'rechaza el identificador inválido "%s"',
      (id) => {
        const state: CartState = { items: [] }

        expect(
          cartReducer(state, {
            type: 'ADD_ITEM',
            product: createProduct(id),
          }),
        ).toBe(state)
      },
    )

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, 1.001])(
      'rechaza el precio inválido %s',
      (price) => {
        const state: CartState = { items: [] }

        expect(
          cartReducer(state, {
            type: 'ADD_ITEM',
            product: createProduct('invalid-price', 5, price),
          }),
        ).toBe(state)
      },
    )

    it('permite un precio de cero', () => {
      const product = createProduct('free-product', 1, 0)

      const nextState = cartReducer(
        { items: [] },
        { type: 'ADD_ITEM', product },
      )

      expect(nextState.items).toEqual([{ product, quantity: 1 }])
    })

    it('no muta el estado ni el producto originales al agregar', () => {
      const state: CartState = { items: [] }
      const product = createProduct()
      const productSnapshot = { ...product }
      const originalItems = state.items

      const nextState = cartReducer(state, { type: 'ADD_ITEM', product })

      expect(state.items).toBe(originalItems)
      expect(state.items).toEqual([])
      expect(product).toEqual(productSnapshot)
      expect(nextState.items[0].product).toBe(product)
    })

    it('no muta la línea existente al acumular cantidades', () => {
      const product = createProduct()
      const state = createState(product, 2)
      const originalItems = state.items
      const originalItem = state.items[0]

      const nextState = cartReducer(state, {
        type: 'ADD_ITEM',
        product,
        quantity: 1,
      })

      expect(nextState.items).not.toBe(originalItems)
      expect(nextState.items[0]).not.toBe(originalItem)
      expect(state.items).toEqual([{ product, quantity: 2 }])
      expect(nextState.items).toEqual([{ product, quantity: 3 }])
    })
  })

  describe('UPDATE_QUANTITY', () => {
    it('actualiza una cantidad válida sin mutar el estado original', () => {
      const product = createProduct()
      const state = createState(product, 1)

      const nextState = cartReducer(state, {
        type: 'UPDATE_QUANTITY',
        id: product.id,
        quantity: 3,
      })

      expect(nextState.items).toEqual([{ product, quantity: 3 }])
      expect(nextState).not.toBe(state)
      expect(nextState.items).not.toBe(state.items)
      expect(nextState.items[0]).not.toBe(state.items[0])
      expect(state.items[0].quantity).toBe(1)
    })

    it('rechaza una cantidad superior al stock', () => {
      const product = createProduct('pencil-1', 2)
      const state = createState(product, 1)

      expect(
        cartReducer(state, {
          type: 'UPDATE_QUANTITY',
          id: product.id,
          quantity: 3,
        }),
      ).toBe(state)
    })

    it.each([
      0,
      -1,
      1.5,
      Number.MAX_SAFE_INTEGER + 1,
      Number.POSITIVE_INFINITY,
    ])(
      'rechaza la cantidad inválida %s',
      (quantity) => {
        const product = createProduct()
        const state = createState(product)

        expect(
          cartReducer(state, {
            type: 'UPDATE_QUANTITY',
            id: product.id,
            quantity,
          }),
        ).toBe(state)
      },
    )

    it('conserva la misma referencia si la cantidad no cambia', () => {
      const product = createProduct()
      const state = createState(product, 2)

      expect(
        cartReducer(state, {
          type: 'UPDATE_QUANTITY',
          id: product.id,
          quantity: 2,
        }),
      ).toBe(state)
    })

    it('conserva la misma referencia si el producto no existe', () => {
      const state: CartState = { items: [] }

      expect(
        cartReducer(state, {
          type: 'UPDATE_QUANTITY',
          id: 'missing-product',
          quantity: 2,
        }),
      ).toBe(state)
    })
  })

  describe('REMOVE_ITEM', () => {
    it('elimina el producto solicitado y conserva las demás líneas', () => {
      const firstProduct = createProduct('pencil-1')
      const secondProduct = createProduct('notebook-1')
      const state: CartState = {
        items: [
          { product: firstProduct, quantity: 1 },
          { product: secondProduct, quantity: 2 },
        ],
      }

      const nextState = cartReducer(state, {
        type: 'REMOVE_ITEM',
        id: firstProduct.id,
      })

      expect(nextState.items).toEqual([
        { product: secondProduct, quantity: 2 },
      ])
      expect(state.items).toHaveLength(2)
    })

    it('conserva el mismo estado si el producto no existe', () => {
      const state = createState(createProduct())

      expect(
        cartReducer(state, {
          type: 'REMOVE_ITEM',
          id: 'missing-product',
        }),
      ).toBe(state)
    })

    it.each(['', ' pencil-1', 'pencil/1'])(
      'conserva el mismo estado si el identificador "%s" es inválido',
      (id) => {
        const state = createState(createProduct())

        expect(cartReducer(state, { type: 'REMOVE_ITEM', id })).toBe(state)
      },
    )
  })

  describe('CLEAR_CART', () => {
    it('vacía un carrito con elementos sin mutar el estado original', () => {
      const state = createState(createProduct(), 2)

      const nextState = cartReducer(state, { type: 'CLEAR_CART' })

      expect(nextState).toEqual({ items: [] })
      expect(nextState).not.toBe(state)
      expect(state.items).toHaveLength(1)
    })

    it('conserva la misma referencia si el carrito ya está vacío', () => {
      const state: CartState = { items: [] }

      expect(cartReducer(state, { type: 'CLEAR_CART' })).toBe(state)
    })
  })

  describe('CLEAR_CART_IF_UNCHANGED', () => {
    it('vacía el carrito cuando coincide con el pedido confirmado', () => {
      const product = createProduct()
      const state = createState(product, 2)

      const nextState = cartReducer(state, {
        type: 'CLEAR_CART_IF_UNCHANGED',
        items: [
          { productId: product.id, quantity: 2 },
        ],
      })

      expect(nextState.items).toEqual([])
      expect(state.items).toHaveLength(1)
    })

    it('acepta los artículos en distinto orden', () => {
      const first = createProduct('pencil-1')
      const second = createProduct('notebook-1')

      const state: CartState = {
        items: [
          { product: first, quantity: 2 },
          { product: second, quantity: 1 },
        ],
      }

      const nextState = cartReducer(state, {
        type: 'CLEAR_CART_IF_UNCHANGED',
        items: [
          { productId: second.id, quantity: 1 },
          { productId: first.id, quantity: 2 },
        ],
      })

      expect(nextState.items).toEqual([])
    })

    it.each([
      {
        description: 'un producto adicional',
        currentItems: [
          { product: createProduct('pencil-1'), quantity: 2 },
          { product: createProduct('notebook-1'), quantity: 1 },
        ],
        expectedItems: [
          { productId: 'pencil-1', quantity: 2 },
        ],
      },
      {
        description: 'una cantidad diferente',
        currentItems: [
          { product: createProduct('pencil-1'), quantity: 3 },
        ],
        expectedItems: [
          { productId: 'pencil-1', quantity: 2 },
        ],
      },
      {
        description: 'un producto eliminado',
        currentItems: [
          { product: createProduct('notebook-1'), quantity: 1 },
        ],
        expectedItems: [
          { productId: 'pencil-1', quantity: 2 },
        ],
      },
    ])(
      'conserva el carrito si existe $description',
      ({ currentItems, expectedItems }) => {
        const state: CartState = { items: currentItems }

        const nextState = cartReducer(state, {
          type: 'CLEAR_CART_IF_UNCHANGED',
          items: expectedItems,
        })

        expect(nextState).toBe(state)
      },
    )

    it('rechaza una clave de producto duplicada', () => {
      const state = createState(createProduct(), 2)

      const nextState = cartReducer(state, {
        type: 'CLEAR_CART_IF_UNCHANGED',
        items: [
          { productId: 'pencil-1', quantity: 2 },
          { productId: 'pencil-1', quantity: 2 },
        ],
      })

      expect(nextState).toBe(state)
    })

    it('no vacía el carrito cuando el snapshot está vacío', () => {
      const state = createState(createProduct(), 2)

      const nextState = cartReducer(state, {
        type: 'CLEAR_CART_IF_UNCHANGED',
        items: [],
      })

      expect(nextState).toBe(state)
    })
  })

})

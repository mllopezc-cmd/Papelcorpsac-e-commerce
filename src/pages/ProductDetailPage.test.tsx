/**
 * @vitest-environment jsdom
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { Product } from '../types/product'

const {
  getProductMock,
  useCartMock,
  addItemMock,
} = vi.hoisted(() => ({
  getProductMock: vi.fn(),
  useCartMock: vi.fn(),
  addItemMock: vi.fn(),
}))

vi.mock('../services/productService', () => ({
  getPublishedProductById: getProductMock,
}))

vi.mock('../hooks/useCart', () => ({
  useCart: useCartMock,
}))

vi.mock('../components/ProductCard', () => ({
  ProductImage: ({ product }: { product: Product }) => (
    <div role="img" aria-label={`Imagen de ${product.name}`} />
  ),
}))

import { ProductDetailPage } from './ProductDetailPage'

const product: Product = {
  id: 'product-001',
  name: 'Cuaderno Premium',
  description: 'Cuaderno de tapa dura',
  category: 'stationery',
  price: 29.9,
  brand: 'PAPEL CORP',
  stock: 3,
  published: true,
}

function renderDetail(route = '/catalogo/product-001') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/catalogo/:productId"
          element={<ProductDetailPage />}
        />
        <Route
          path="/catalogo"
          element={<ProductDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

function deferred<T>() {
  let resolve!: (value: T) => void

  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

beforeEach(() => {
  vi.clearAllMocks()

  getProductMock.mockResolvedValue(product)
  addItemMock.mockResolvedValue(true)

  useCartMock.mockReturnValue({
    items: [],
    addItem: addItemMock,
  })
})

afterEach(() => {
  cleanup()
})

describe('ProductDetailPage — T12.5-D', () => {
  it('muestra carga mientras consulta el producto', () => {
    const request = deferred<Product | null>()
    getProductMock.mockReturnValue(request.promise)

    renderDetail()

    expect(screen.getByText('Cargando producto…')).toBeTruthy()
    expect(getProductMock).toHaveBeenCalledWith('product-001')
  })

  it('muestra los datos del producto publicado', async () => {
    renderDetail()

    expect(
      await screen.findByRole('heading', {
        name: 'Cuaderno Premium',
      }),
    ).toBeTruthy()

    expect(
      screen.getByText('Cuaderno de tapa dura'),
    ).toBeTruthy()

    expect(
      screen.getByText('Disponibles para agregar: 3'),
    ).toBeTruthy()
  })

  it('muestra un aviso cuando no existe el producto', async () => {
    getProductMock.mockResolvedValue(null)

    renderDetail()

    expect(
      await screen.findByText(
        'Este producto no existe o ya no está disponible.',
      ),
    ).toBeTruthy()
  })

  it('muestra un error cuando falla la consulta', async () => {
    getProductMock.mockRejectedValue(new Error('Error de red'))

    renderDetail()

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    expect(
      screen.getByText('No fue posible cargar el producto.'),
    ).toBeTruthy()
  })

  it('rechaza un identificador ausente sin consultar Firestore', () => {
    renderDetail('/catalogo')

    expect(
      screen.getByRole('alert').textContent,
    ).toContain('El identificador del producto no es válido.')

    expect(getProductMock).not.toHaveBeenCalled()
  })

  it('informa cuando el producto está agotado', async () => {
    getProductMock.mockResolvedValue({
      ...product,
      stock: 0,
    })

    renderDetail()

    expect(
      await screen.findByText('Producto agotado.'),
    ).toBeTruthy()

    expect(
      screen.queryByRole('button', {
        name: 'Agregar al carrito',
      }),
    ).toBeNull()
  })

  it('descuenta las unidades que ya están en el carrito', async () => {
    useCartMock.mockReturnValue({
      items: [{ product, quantity: 2 }],
      addItem: addItemMock,
    })

    renderDetail()

    expect(
      await screen.findByText('Disponibles para agregar: 1'),
    ).toBeTruthy()

    const increase = screen.getByRole('button', {
      name: 'Aumentar cantidad',
    }) as HTMLButtonElement

    expect(increase.disabled).toBe(true)
  })

  it('bloquea el agregado cuando todo el stock está en el carrito', async () => {
    useCartMock.mockReturnValue({
      items: [{ product, quantity: 3 }],
      addItem: addItemMock,
    })

    renderDetail()

    expect(
      await screen.findByText(
        'Ya tienes todas las unidades disponibles en tu carrito.',
      ),
    ).toBeTruthy()

    expect(
      screen.queryByRole('button', {
        name: 'Agregar al carrito',
      }),
    ).toBeNull()
  })

  it('permite seleccionar cantidad sin superar el stock', async () => {
    renderDetail()

    await screen.findByRole('heading', {
      name: 'Cuaderno Premium',
    })

    const increase = screen.getByRole('button', {
      name: 'Aumentar cantidad',
    }) as HTMLButtonElement

    const decrease = screen.getByRole('button', {
      name: 'Disminuir cantidad',
    }) as HTMLButtonElement

    fireEvent.click(increase)
    fireEvent.click(increase)
    fireEvent.click(increase)

    expect(
      screen.getByText('3', { selector: 'output' }),
    ).toBeTruthy()

    expect(increase.disabled).toBe(true)

    fireEvent.click(decrease)

    expect(
      screen.getByText('2', { selector: 'output' }),
    ).toBeTruthy()
  })

  it('agrega la cantidad seleccionada y la restablece si tiene éxito', async () => {
    renderDetail()

    await screen.findByRole('heading', {
      name: 'Cuaderno Premium',
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Aumentar cantidad',
      }),
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Agregar al carrito',
      }),
    )

    await waitFor(() => {
      expect(addItemMock).toHaveBeenCalledWith(product, 2)
    })

    await waitFor(() => {
      expect(
        screen.getByText('1', { selector: 'output' }),
      ).toBeTruthy()
    })
  })

  it('conserva la cantidad cuando el carrito rechaza el agregado', async () => {
    addItemMock.mockResolvedValue(false)

    renderDetail()

    await screen.findByRole('heading', {
      name: 'Cuaderno Premium',
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Aumentar cantidad',
      }),
    )

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Agregar al carrito',
        }),
      )
      await Promise.resolve()
    })

    expect(addItemMock).toHaveBeenCalledWith(product, 2)

    expect(
      screen.getByText('2', { selector: 'output' }),
    ).toBeTruthy()
  })
})

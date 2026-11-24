/**
 * @vitest-environment jsdom
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
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
  useProductsMock,
  useFavoritesMock,
  addFavoriteMock,
  removeFavoriteMock,
} = vi.hoisted(() => ({
  useProductsMock: vi.fn(),
  useFavoritesMock: vi.fn(),
  addFavoriteMock: vi.fn(),
  removeFavoriteMock: vi.fn(),
}))

vi.mock('../hooks/useProducts', () => ({
  useProducts: useProductsMock,
}))

vi.mock('../hooks/useFavorites', () => ({
  useFavorites: useFavoritesMock,
}))

vi.mock('../components/ProductCard', () => ({
  ProductCard: ({
    product,
    onToggleFavorite,
  }: {
    product: Product
    onToggleFavorite: (id: string) => void
  }) => (
    <article>
      <h2>{product.name}</h2>
      <button
        type="button"
        onClick={() => onToggleFavorite(product.id)}
      >
        Favorito: {product.id}
      </button>
    </article>
  ),
}))

import { CatalogPage } from './CatalogPage'

function makeProduct(
  index: number,
  category: Product['category'] = 'stationery',
): Product {
  return {
    id: `product-${index}`,
    name: `Producto ${String(index).padStart(2, '0')}`,
    description: 'Producto de prueba',
    category,
    price: 15,
    brand: 'PAPEL CORP',
    stock: 10,
    published: true,
  }
}

function setProducts(
  products: Product[],
  overrides: Record<string, unknown> = {},
) {
  useProductsMock.mockReturnValue({
    products,
    loading: false,
    error: null,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()

  addFavoriteMock.mockResolvedValue(true)
  removeFavoriteMock.mockResolvedValue(true)

  setProducts([])

  useFavoritesMock.mockReturnValue({
    favorites: [],
    error: null,
    pendingProductIds: [],
    addFavorite: addFavoriteMock,
    removeFavorite: removeFavoriteMock,
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('CatalogPage — T12.5-D', () => {
  it('muestra el estado de carga', () => {
    setProducts([], { loading: true })

    render(<CatalogPage />)

    expect(
      screen.getByText('Cargando productos…'),
    ).toBeTruthy()
  })

  it('muestra el error de consulta del catálogo', () => {
    setProducts([], { error: new Error('Error de red') })

    render(<CatalogPage />)

    expect(
      screen.getByRole('alert').textContent,
    ).toContain('No fue posible cargar el catálogo.')
  })

  it('presenta el estado sin productos publicados', () => {
    render(<CatalogPage />)

    expect(
      screen.getByText('Aún no hay productos publicados.'),
    ).toBeTruthy()
  })

  it('muestra los productos publicados', () => {
    setProducts([makeProduct(1), makeProduct(2)])

    render(<CatalogPage />)

    expect(screen.getByText('Producto 01')).toBeTruthy()
    expect(screen.getByText('Producto 02')).toBeTruthy()

    expect(
      screen.getByText(/Mostrando 1–2 de 2 productos/),
    ).toBeTruthy()
  })

  it('filtra productos por categoría', () => {
    setProducts([
      makeProduct(1, 'stationery'),
      makeProduct(2, 'office-supplies'),
    ])

    render(<CatalogPage />)

    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'office-supplies' },
    })

    expect(screen.getByText('Producto 02')).toBeTruthy()
    expect(screen.queryByText('Producto 01')).toBeNull()
  })

  it('busca por nombre sin distinguir mayúsculas', async () => {
    setProducts([
      {
        ...makeProduct(1),
        name: 'Cuaderno Premium',
      },
      {
        ...makeProduct(2),
        name: 'Archivador',
      },
    ])

    render(<CatalogPage />)

    fireEvent.change(
      screen.getByLabelText('Buscar por nombre'),
      { target: { value: 'CUADERNO' } },
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350))
    })

    expect(screen.getByText('Cuaderno Premium')).toBeTruthy()
    expect(screen.queryByText('Archivador')).toBeNull()
  })

  it('informa cuando los filtros no producen resultados', async () => {
    setProducts([makeProduct(1)])

    render(<CatalogPage />)

    fireEvent.change(
      screen.getByLabelText('Buscar por nombre'),
      { target: { value: 'Inexistente' } },
    )

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350))
    })

    expect(
      screen.getByText(
        'No se encontraron productos con esos criterios.',
      ),
    ).toBeTruthy()
  })

  it('permite limpiar filtros activos', () => {
    setProducts([
      makeProduct(1, 'stationery'),
      makeProduct(2, 'office-supplies'),
    ])

    render(<CatalogPage />)

    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'stationery' },
    })

    expect(screen.queryByText('Producto 02')).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: 'Limpiar filtros' }),
    )

    expect(screen.getByText('Producto 01')).toBeTruthy()
    expect(screen.getByText('Producto 02')).toBeTruthy()
  })

  it('pagina el catálogo de doce en doce', () => {
    setProducts(
      Array.from({ length: 14 }, (_, index) =>
        makeProduct(index + 1),
      ),
    )

    render(<CatalogPage />)

    expect(screen.getByText('Producto 01')).toBeTruthy()
    expect(screen.queryByText('Producto 13')).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: 'Siguiente' }),
    )

    expect(screen.getByText('Producto 13')).toBeTruthy()
    expect(screen.getByText('Producto 14')).toBeTruthy()
    expect(screen.queryByText('Producto 01')).toBeNull()

    expect(
      screen.getByText(/Mostrando 13–14 de 14 productos/),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: 'Anterior' }),
    )

    expect(screen.getByText('Producto 01')).toBeTruthy()
  })

  it('invoca agregar o quitar favoritos según el estado', () => {
    setProducts([makeProduct(1), makeProduct(2)])

    useFavoritesMock.mockReturnValue({
      favorites: ['product-2'],
      error: null,
      pendingProductIds: [],
      addFavorite: addFavoriteMock,
      removeFavorite: removeFavoriteMock,
    })

    render(<CatalogPage />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Favorito: product-1',
      }),
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Favorito: product-2',
      }),
    )

    expect(addFavoriteMock).toHaveBeenCalledWith('product-1')
    expect(removeFavoriteMock).toHaveBeenCalledWith('product-2')
  })

  it('muestra errores de sincronización de favoritos', () => {
    setProducts([makeProduct(1)])

    useFavoritesMock.mockReturnValue({
      favorites: [],
      error: Object.assign(new Error('Sin permisos'), {
        code: 'permission-denied',
      }),
      pendingProductIds: [],
      addFavorite: addFavoriteMock,
      removeFavorite: removeFavoriteMock,
    })

    render(<CatalogPage />)

    expect(
      screen.getByRole('alert').textContent,
    ).toContain('Verifica los permisos de Firestore.')
  })
})

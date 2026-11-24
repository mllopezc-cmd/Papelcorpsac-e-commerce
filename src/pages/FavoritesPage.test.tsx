/**
 * @vitest-environment jsdom
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router'
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
  useAuthMock,
  useFavoritesMock,
  getProductMock,
  removeFavoriteMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useFavoritesMock: vi.fn(),
  getProductMock: vi.fn(),
  removeFavoriteMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../hooks/useFavorites', () => ({
  useFavorites: useFavoritesMock,
}))

vi.mock('../services/productService', () => ({
  getPublishedProductById: getProductMock,
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
        Quitar {product.name}
      </button>
    </article>
  ),
}))

import { FavoritesPage } from './FavoritesPage'

const product: Product = {
  id: 'product-001',
  name: 'Cuaderno Premium',
  description: 'Producto de prueba',
  category: 'stationery',
  price: 25,
  brand: 'PAPEL CORP',
  stock: 5,
  published: true,
}

function renderFavorites() {
  return render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>,
  )
}

function setFavorites(
  favorites: string[],
  overrides: Record<string, unknown> = {},
) {
  useFavoritesMock.mockReturnValue({
    favorites,
    loading: false,
    error: null,
    pendingProductIds: [],
    removeFavorite: removeFavoriteMock,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()

  useAuthMock.mockReturnValue({
    user: { uid: 'customer-001' },
  })

  removeFavoriteMock.mockResolvedValue(true)
  getProductMock.mockResolvedValue(product)
  setFavorites([])
})

afterEach(() => {
  cleanup()
})

describe('FavoritesPage — T12.5-D', () => {
  it('muestra el estado de carga de favoritos', () => {
    setFavorites([], { loading: true })

    renderFavorites()

    expect(
      screen.getByText('Cargando tus favoritos…'),
    ).toBeTruthy()
  })

  it('muestra el estado vacío y un enlace al catálogo', async () => {
    renderFavorites()

    expect(
      await screen.findByText(
        'Aún no tienes productos favoritos.',
      ),
    ).toBeTruthy()

    expect(
      screen.getByRole('link', {
        name: 'Explorar el catálogo',
      }).getAttribute('href'),
    ).toBe('/catalogo')
  })

  it('consulta y muestra los productos guardados', async () => {
    setFavorites(['product-001'])

    renderFavorites()

    expect(
      await screen.findByText('Cuaderno Premium'),
    ).toBeTruthy()

    expect(getProductMock).toHaveBeenCalledWith('product-001')
  })

  it('permite quitar un producto disponible', async () => {
    setFavorites(['product-001'])

    renderFavorites()

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Quitar Cuaderno Premium',
      }),
    )

    expect(removeFavoriteMock).toHaveBeenCalledWith('product-001')
  })

  it('muestra productos eliminados o no publicados', async () => {
    setFavorites(['product-001'])
    getProductMock.mockResolvedValue(null)

    renderFavorites()

    expect(
      await screen.findByText(
        'Este producto fue eliminado o dejó de estar publicado.',
      ),
    ).toBeTruthy()

    expect(
      screen.getByRole('heading', {
        name: 'Producto no disponible',
      }),
    ).toBeTruthy()
  })

  it('permite quitar favoritos cuyo producto ya no existe', async () => {
    setFavorites(['product-001'])
    getProductMock.mockResolvedValue(null)

    renderFavorites()

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Quitar producto no disponible de favoritos',
      }),
    )

    expect(removeFavoriteMock).toHaveBeenCalledWith('product-001')
  })

  it('informa errores al consultar un producto favorito', async () => {
    setFavorites(['product-001'])
    getProductMock.mockRejectedValue(new Error('Error de red'))

    renderFavorites()

    expect(
      await screen.findByText(
        'No fue posible consultar este producto. Puede que ya no esté publicado.',
      ),
    ).toBeTruthy()

    expect(
      screen.getByRole('alert'),
    ).toBeTruthy()
  })

  it('muestra los errores de sincronización de favoritos', () => {
    setFavorites([], {
      error: Object.assign(new Error('Sin permisos'), {
        code: 'permission-denied',
      }),
    })

    renderFavorites()

    expect(
      screen.getByRole('alert').textContent,
    ).toContain('Verifica los permisos de Firestore.')
  })

  it('bloquea la eliminación mientras está pendiente', async () => {
    setFavorites(['product-001'], {
      pendingProductIds: ['product-001'],
    })
    getProductMock.mockResolvedValue(null)

    renderFavorites()

    const button = await screen.findByRole('button', {
      name: 'Quitar producto no disponible de favoritos',
    }) as HTMLButtonElement

    expect(button.disabled).toBe(true)

    fireEvent.click(button)

    expect(removeFavoriteMock).not.toHaveBeenCalled()
  })

  it('no consulta productos mientras carga la lista', () => {
    setFavorites(['product-001'], { loading: true })

    renderFavorites()

    expect(getProductMock).not.toHaveBeenCalled()
  })
})

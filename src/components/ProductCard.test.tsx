/**
 * @vitest-environment jsdom
 */

import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import { useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthContextValue } from '../hooks/useAuth'
import type { Product } from '../types/product'
import { renderWithProviders } from '../test/renderWithProviders'
import { ProductCard } from './ProductCard'

const STORAGE_KEY = 'papelcorpsac:cart:v1'

const product: Product = {
  id: 'producto-001',
  name: 'Cuaderno premium',
  description: 'Cuaderno de prueba',
  category: 'stationery',
  price: 25.9,
  published: true,
  brand: 'Papel Corp',
  stock: 3,
}

const onToggleFavoriteMock = vi.fn()

const authenticatedUser = {
  uid: 'customer-001',
} as AuthContextValue['user']

function LocationObserver() {
  const location = useLocation()

  return (
    <>
      <span data-testid="current-path">
        {location.pathname}
      </span>
      <span data-testid="return-path">
        {
          (location.state as { from?: string } | null)
            ?.from ?? ''
        }
      </span>
    </>
  )
}

function renderCard({
  currentProduct = product,
  auth = {},
  isFavorite = false,
  favoritePending = false,
  priorityImage = false,
  route = '/catalogo',
}: {
  currentProduct?: Product
  auth?: Partial<AuthContextValue>
  isFavorite?: boolean
  favoritePending?: boolean
  priorityImage?: boolean
  route?: string
} = {}) {
  return renderWithProviders(
    <>
      <ProductCard
        product={currentProduct}
        isFavorite={isFavorite}
        favoritePending={favoritePending}
        priorityImage={priorityImage}
        onToggleFavorite={onToggleFavoriteMock}
      />
      <LocationObserver />
    </>,
    {
      route,
      auth,
    },
  )
}

function prepareCart(quantity: number) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      items: [
        { product, quantity },
      ],
    }),
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('ProductCard — T12.3-B', () => {
  it('muestra el nombre, la categoría, el precio y el stock', () => {
    renderCard()

    expect(
      screen.getByRole('heading', {
        name: 'Cuaderno premium',
      }),
    ).toBeTruthy()

    expect(screen.getByText('Papelería')).toBeTruthy()

    expect(
      screen.getByText(/25[.,]90/),
    ).toBeTruthy()

    expect(
      screen.getByText(/Stock del producto: 3 unidades/),
    ).toBeTruthy()

    expect(
      screen.getByText(/Disponibles para agregar: 3/),
    ).toBeTruthy()
  })

  it('permite agregar un producto al carrito real', async () => {
    renderCard()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Agregar Cuaderno premium al carrito',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Disponibles para agregar: 2/),
      ).toBeTruthy()
    })

    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? '{}',
    ) as {
      version?: number
      items?: Array<{ quantity: number }>
    }

    expect(stored.version).toBe(1)
    expect(stored.items?.[0]?.quantity).toBe(1)
  })

  it('deshabilita el agregado cuando se alcanza el stock máximo', () => {
    prepareCart(3)

    renderCard()

    const addButton = screen.getByRole(
      'button',
      {
        name: 'Cuaderno premium: stock máximo en el carrito',
      },
    ) as HTMLButtonElement

    expect(addButton.disabled).toBe(true)

    expect(
      screen.getByText(/Disponibles para agregar: 0/),
    ).toBeTruthy()
  })

  it('deshabilita el agregado para un producto sin stock', () => {
    renderCard({
      currentProduct: {
        ...product,
        stock: 0,
      },
    })

    const addButton = screen.getByRole(
      'button',
      {
        name: 'Cuaderno premium sin stock disponible',
      },
    ) as HTMLButtonElement

    expect(addButton.disabled).toBe(true)

    expect(
      screen.getByText(/Stock del producto: no disponible/),
    ).toBeTruthy()
  })

  it('permite guardar favoritos a un usuario autenticado', () => {
    renderCard({
      auth: { user: authenticatedUser },
    })

    const favoriteButton = screen.getByRole(
      'button',
      {
        name: 'Guardar Cuaderno premium en favoritos',
      },
    )

    expect(
      favoriteButton.getAttribute('aria-pressed'),
    ).toBe('false')

    fireEvent.click(favoriteButton)

    expect(onToggleFavoriteMock).toHaveBeenCalledExactlyOnceWith(
      product.id,
    )
  })

  it('permite quitar un producto de favoritos', () => {
    renderCard({
      auth: { user: authenticatedUser },
      isFavorite: true,
    })

    const favoriteButton = screen.getByRole(
      'button',
      {
        name: 'Quitar Cuaderno premium de favoritos',
      },
    )

    expect(
      favoriteButton.getAttribute('aria-pressed'),
    ).toBe('true')

    fireEvent.click(favoriteButton)

    expect(onToggleFavoriteMock).toHaveBeenCalledExactlyOnceWith(
      product.id,
    )
  })

  it('bloquea favoritos mientras se verifica la sesión', () => {
    renderCard({
      auth: { loading: true },
    })

    const favoriteButton = screen.getByRole(
      'button',
      {
        name: 'Comprobando sesión para guardar Cuaderno premium',
      },
    ) as HTMLButtonElement

    expect(favoriteButton.disabled).toBe(true)

    fireEvent.click(favoriteButton)

    expect(onToggleFavoriteMock).not.toHaveBeenCalled()
  })

  it('bloquea favoritos mientras existe una operación pendiente', () => {
    renderCard({
      auth: { user: authenticatedUser },
      favoritePending: true,
    })

    const favoriteButton = screen.getByRole(
      'button',
      {
        name: 'Guardando Cuaderno premium en favoritos',
      },
    ) as HTMLButtonElement

    expect(favoriteButton.disabled).toBe(true)

    fireEvent.click(favoriteButton)

    expect(onToggleFavoriteMock).not.toHaveBeenCalled()
  })

  it('redirige al login conservando la ruta de origen', async () => {
    renderCard({
      route: '/catalogo?orden=precio',
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Inicia sesión para guardar Cuaderno premium en favoritos',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('current-path').textContent,
      ).toBe('/login')
    })

    expect(
      screen.getByTestId('return-path').textContent,
    ).toBe('/catalogo?orden=precio')

    expect(onToggleFavoriteMock).not.toHaveBeenCalled()
  })

  it('ofrece un enlace al detalle del producto', () => {
    renderCard()

    expect(
      screen.getByRole('link', {
        name: 'Ver detalles de Cuaderno premium',
      }).getAttribute('href'),
    ).toBe('/catalogo/producto-001')
  })

  it('transmite la prioridad de carga a la imagen del producto', () => {
    renderCard({
      currentProduct: {
        ...product,
        imageUrl: 'https://example.com/cuaderno.webp',
      },
      priorityImage: true,
    })

    const image = screen.getByRole('img', {
      name: 'Cuaderno premium',
    }) as HTMLImageElement

    expect(image.getAttribute('loading')).toBe('eager')
    expect(image.getAttribute('fetchpriority')).toBe('high')
  })
})

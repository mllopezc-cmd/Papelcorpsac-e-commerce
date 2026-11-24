/**
 * @vitest-environment jsdom
 */

import { cleanup, screen } from '@testing-library/react'
import { useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { renderWithProviders } from './renderWithProviders'

function TestConsumer() {
  const { user, loading } = useAuth()
  const { totalUnits, subtotal } = useCart()
  const location = useLocation()

  return (
    <div>
      <span data-testid="user">
        {user?.uid ?? 'sin-sesion'}
      </span>
      <span data-testid="loading">
        {String(loading)}
      </span>
      <span data-testid="units">
        {totalUnits}
      </span>
      <span data-testid="subtotal">
        {subtotal}
      </span>
      <span data-testid="route">
        {location.pathname}
      </span>
    </div>
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('renderWithProviders — T12.3-A', () => {
  it('proporciona autenticación anónima y carrito vacío por defecto', () => {
    renderWithProviders(<TestConsumer />)

    expect(screen.getByTestId('user').textContent).toBe(
      'sin-sesion',
    )
    expect(screen.getByTestId('loading').textContent).toBe(
      'false',
    )
    expect(screen.getByTestId('units').textContent).toBe('0')
    expect(screen.getByTestId('subtotal').textContent).toBe('0')
    expect(screen.getByTestId('route').textContent).toBe('/')
  })

  it('permite simular un usuario autenticado', () => {
    renderWithProviders(<TestConsumer />, {
      auth: {
        user: {
          uid: 'customer-test-001',
        } as ReturnType<typeof useAuth>['user'],
      },
    })

    expect(screen.getByTestId('user').textContent).toBe(
      'customer-test-001',
    )
  })

  it('permite configurar una ruta inicial', () => {
    renderWithProviders(<TestConsumer />, {
      route: '/carrito',
    })

    expect(screen.getByTestId('route').textContent).toBe(
      '/carrito',
    )
  })

  it('permite simular el estado de carga de autenticación', () => {
    renderWithProviders(<TestConsumer />, {
      auth: {
        loading: true,
      },
    })

    expect(screen.getByTestId('loading').textContent).toBe(
      'true',
    )
  })
})

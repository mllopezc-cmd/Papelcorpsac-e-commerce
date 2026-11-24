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
  render,
  screen,
} from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}))

import { ProtectedRoute } from './ProtectedRoute'

const testUser = { uid: 'customer-001' }

function LoginDestination() {
  const location = useLocation()
  const state = location.state as { from?: string } | null

  return (
    <div>
      <h1>Login de prueba</h1>
      <output data-testid="login-origin">
        {state?.from ?? ''}
      </output>
    </div>
  )
}

function renderProtectedRoute({
  path = '/checkout',
  requireAdmin = false,
}: {
  path?: string
  requireAdmin?: boolean
} = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path={path.split('?')[0]}
          element={
            <ProtectedRoute requireAdmin={requireAdmin}>
              <h1>Contenido protegido</h1>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={<LoginDestination />}
        />
        <Route
          path="/"
          element={<h1>Inicio de prueba</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  useAuthMock.mockReturnValue({
    user: null,
    profile: null,
    loading: false,
    error: null,
  })
})

afterEach(() => {
  cleanup()
})

describe('ProtectedRoute — T12.5-B2', () => {
  it('muestra la verificación mientras carga la sesión', () => {
    useAuthMock.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      error: null,
    })

    renderProtectedRoute()

    expect(
      screen.getByText('Verificando tu sesión…'),
    ).toBeTruthy()

    expect(
      screen.queryByRole('heading', {
        name: 'Contenido protegido',
      }),
    ).toBeNull()

    expect(
      screen.queryByRole('heading', {
        name: 'Login de prueba',
      }),
    ).toBeNull()
  })

  it('redirige al visitante a iniciar sesión', () => {
    renderProtectedRoute()

    expect(
      screen.getByRole('heading', {
        name: 'Login de prueba',
      }),
    ).toBeTruthy()

    expect(
      screen.queryByRole('heading', {
        name: 'Contenido protegido',
      }),
    ).toBeNull()
  })

  it('conserva la ruta y búsqueda de origen al redirigir', () => {
    renderProtectedRoute({
      path: '/checkout?origen=carrito',
    })

    expect(
      screen.getByTestId('login-origin').textContent,
    ).toBe('/checkout?origen=carrito')
  })

  it('muestra el error cuando falla la verificación del perfil', () => {
    useAuthMock.mockReturnValue({
      user: testUser,
      profile: null,
      loading: false,
      error: 'No se pudo cargar el perfil.',
    })

    renderProtectedRoute()

    expect(
      screen.getByRole('heading', {
        name: 'No se pudo verificar tu perfil',
      }),
    ).toBeTruthy()

    expect(
      screen.getByRole('alert').textContent,
    ).toBe('No se pudo cargar el perfil.')

    expect(
      screen.queryByRole('heading', {
        name: 'Contenido protegido',
      }),
    ).toBeNull()
  })

  it('bloquea el acceso cuando el perfil no está disponible', () => {
    useAuthMock.mockReturnValue({
      user: testUser,
      profile: null,
      loading: false,
      error: null,
    })

    renderProtectedRoute()

    expect(
      screen.getByRole('heading', {
        name: 'No se pudo verificar tu perfil',
      }),
    ).toBeTruthy()

    expect(
      screen.getByRole('alert').textContent,
    ).toBe('El perfil no está disponible.')
  })

  it('rechaza el acceso administrativo de Customer', () => {
    useAuthMock.mockReturnValue({
      user: testUser,
      profile: { role: 'customer' },
      loading: false,
      error: null,
    })

    renderProtectedRoute({
      path: '/admin/productos',
      requireAdmin: true,
    })

    expect(
      screen.getByRole('heading', {
        name: 'Acceso restringido',
      }),
    ).toBeTruthy()

    expect(
      screen.getByRole('link', {
        name: 'Volver al inicio',
      }).getAttribute('href'),
    ).toBe('/')

    expect(
      screen.queryByRole('heading', {
        name: 'Contenido protegido',
      }),
    ).toBeNull()
  })

  it('permite que Customer acceda a una ruta autenticada', () => {
    useAuthMock.mockReturnValue({
      user: testUser,
      profile: { role: 'customer' },
      loading: false,
      error: null,
    })

    renderProtectedRoute()

    expect(
      screen.getByRole('heading', {
        name: 'Contenido protegido',
      }),
    ).toBeTruthy()

    expect(
      screen.queryByRole('heading', {
        name: 'Acceso restringido',
      }),
    ).toBeNull()
  })

  it('permite que Admin acceda a una ruta administrativa', () => {
    useAuthMock.mockReturnValue({
      user: { uid: 'admin-001' },
      profile: { role: 'admin' },
      loading: false,
      error: null,
    })

    renderProtectedRoute({
      path: '/admin/productos',
      requireAdmin: true,
    })

    expect(
      screen.getByRole('heading', {
        name: 'Contenido protegido',
      }),
    ).toBeTruthy()

    expect(
      screen.queryByRole('heading', {
        name: 'Acceso restringido',
      }),
    ).toBeNull()
  })
})

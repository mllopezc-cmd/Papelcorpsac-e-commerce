/**
 * @vitest-environment jsdom
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const {
  useAuthMock,
  signInMock,
  googleMock,
  clearErrorMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  signInMock: vi.fn(),
  googleMock: vi.fn(),
  clearErrorMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}))

import { LoginPage } from './LoginPage'

function renderLogin(from?: string) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/login',
          state: from ? { from } : null,
        },
      ]}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/checkout"
          element={<h1>Checkout de prueba</h1>}
        />
        <Route
          path="/"
          element={<h1>Inicio de prueba</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

function fillCredentials() {
  fireEvent.change(
    screen.getByLabelText('Correo electrónico'),
    {
      target: { value: 'cliente@example.com' },
    },
  )

  fireEvent.change(
    screen.getByLabelText('Contraseña'),
    {
      target: { value: 'password123' },
    },
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  signInMock.mockResolvedValue(undefined)
  googleMock.mockResolvedValue(undefined)

  useAuthMock.mockReturnValue({
    signIn: signInMock,
    signInWithGoogle: googleMock,
    clearError: clearErrorMock,
    error: null,
  })
})

afterEach(() => {
  cleanup()
})

describe('LoginPage — T12.5-D', () => {
  it('muestra los campos y el acceso con Google', () => {
    renderLogin()

    expect(
      screen.getByRole('heading', {
        name: 'Iniciar sesión',
      }),
    ).toBeTruthy()

    expect(
      screen.getByLabelText('Correo electrónico'),
    ).toBeTruthy()

    expect(
      screen.getByLabelText('Contraseña'),
    ).toBeTruthy()

    expect(
      screen.getByRole('button', {
        name: 'Continuar con Google',
      }),
    ).toBeTruthy()
  })

  it('inicia sesión y vuelve a la ruta solicitada', async () => {
    renderLogin('/checkout')
    fillCredentials()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ingresar con correo',
      }),
    )

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        'cliente@example.com',
        'password123',
      )
    })

    expect(
      await screen.findByRole('heading', {
        name: 'Checkout de prueba',
      }),
    ).toBeTruthy()

    expect(clearErrorMock).toHaveBeenCalledTimes(1)
  })

  it('regresa al inicio cuando no existe ruta de origen', async () => {
    renderLogin()
    fillCredentials()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ingresar con correo',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Inicio de prueba',
      }),
    ).toBeTruthy()
  })

  it('rechaza una ruta de retorno externa', async () => {
    renderLogin('//example.com/checkout')
    fillCredentials()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ingresar con correo',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Inicio de prueba',
      }),
    ).toBeTruthy()
  })

  it('informa errores al iniciar sesión con correo', async () => {
    signInMock.mockRejectedValue(
      new Error('Credenciales incorrectas'),
    )

    renderLogin()
    fillCredentials()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ingresar con correo',
      }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    expect(
      screen.getByRole('alert').textContent,
    ).toContain('Credenciales incorrectas')
  })

  it('permite iniciar sesión con Google', async () => {
    renderLogin('/checkout')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Continuar con Google',
      }),
    )

    await waitFor(() => {
      expect(googleMock).toHaveBeenCalledTimes(1)
    })

    expect(
      await screen.findByRole('heading', {
        name: 'Checkout de prueba',
      }),
    ).toBeTruthy()
  })

  it('informa errores de autenticación con Google', async () => {
    googleMock.mockRejectedValue(
      new Error('Ventana de Google cancelada'),
    )

    renderLogin()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Continuar con Google',
      }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    expect(
      screen.getByRole('alert').textContent,
    ).toContain('Ventana de Google cancelada')
  })

  it('muestra errores existentes del contexto', () => {
    useAuthMock.mockReturnValue({
      signIn: signInMock,
      signInWithGoogle: googleMock,
      clearError: clearErrorMock,
      error: 'No se pudo conectar.',
    })

    renderLogin()

    expect(
      screen.getByRole('alert').textContent,
    ).toBe('No se pudo conectar.')
  })
})

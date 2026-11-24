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
import { MemoryRouter, Route, Routes } from 'react-router'
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
  registerMock,
  clearErrorMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  registerMock: vi.fn(),
  clearErrorMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}))

import { RegisterPage } from './RegisterPage'

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route
          path="/register"
          element={<RegisterPage />}
        />
        <Route
          path="/"
          element={<h1>Inicio de prueba</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

function fillRegistration(
  overrides: {
    name?: string
    email?: string
    password?: string
    confirm?: string
  } = {},
) {
  fireEvent.change(screen.getByLabelText('Nombre'), {
    target: {
      value: overrides.name ?? 'Cliente Premium',
    },
  })

  fireEvent.change(
    screen.getByLabelText('Correo electrónico'),
    {
      target: {
        value: overrides.email ?? 'cliente@example.com',
      },
    },
  )

  fireEvent.change(
    screen.getByLabelText('Contraseña', { exact: true }),
    {
      target: {
        value: overrides.password ?? 'password123',
      },
    },
  )

  fireEvent.change(
    screen.getByLabelText('Confirmar contraseña'),
    {
      target: {
        value: overrides.confirm ?? 'password123',
      },
    },
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  registerMock.mockResolvedValue(undefined)

  useAuthMock.mockReturnValue({
    register: registerMock,
    clearError: clearErrorMock,
    error: null,
  })
})

afterEach(() => {
  cleanup()
})

describe('RegisterPage — T12.5-D', () => {
  it('muestra el formulario de registro', () => {
    renderRegister()

    expect(
      screen.getByRole('heading', {
        name: 'Crear cuenta',
      }),
    ).toBeTruthy()

    expect(screen.getByLabelText('Nombre')).toBeTruthy()
    expect(
      screen.getByLabelText('Correo electrónico'),
    ).toBeTruthy()
    expect(
      screen.getByLabelText('Contraseña', { exact: true }),
    ).toBeTruthy()
    expect(
      screen.getByLabelText('Confirmar contraseña'),
    ).toBeTruthy()
  })

  it('rechaza un nombre compuesto únicamente por espacios', async () => {
    renderRegister()

    fillRegistration({ name: '   ' })

    fireEvent.click(
      screen.getByRole('button', { name: 'Registrarme' }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    expect(
      screen.getByRole('alert').textContent,
    ).toBe('Ingresa tu nombre completo.')

    expect(registerMock).not.toHaveBeenCalled()
  })

  it('rechaza contraseñas diferentes', async () => {
    renderRegister()

    fillRegistration({
      password: 'password123',
      confirm: 'password456',
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Registrarme' }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    expect(
      screen.getByRole('alert').textContent,
    ).toBe('Las contraseñas no coinciden.')

    expect(registerMock).not.toHaveBeenCalled()
  })

  it('registra al usuario y navega al inicio', async () => {
    renderRegister()
    fillRegistration()

    fireEvent.click(
      screen.getByRole('button', { name: 'Registrarme' }),
    )

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith(
        'Cliente Premium',
        'cliente@example.com',
        'password123',
      )
    })

    expect(
      await screen.findByRole('heading', {
        name: 'Inicio de prueba',
      }),
    ).toBeTruthy()
  })

  it('muestra errores del servicio de registro', async () => {
    registerMock.mockRejectedValue(
      new Error('El correo ya está registrado.'),
    )

    renderRegister()
    fillRegistration()

    fireEvent.click(
      screen.getByRole('button', { name: 'Registrarme' }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toBeTruthy()

    expect(
      screen.getByRole('alert').textContent,
    ).toBe('El correo ya está registrado.')
  })

  it('muestra errores existentes del contexto', () => {
    useAuthMock.mockReturnValue({
      register: registerMock,
      clearError: clearErrorMock,
      error: 'No se pudo conectar.',
    })

    renderRegister()

    expect(
      screen.getByRole('alert').textContent,
    ).toBe('No se pudo conectar.')
  })

  it('permite volver al inicio de sesión', () => {
    renderRegister()

    expect(
      screen.getByRole('link', {
        name: 'Inicia sesión',
      }).getAttribute('href'),
    ).toBe('/login')
  })
})

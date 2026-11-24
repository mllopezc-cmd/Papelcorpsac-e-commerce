import {
  render,
  type RenderOptions,
} from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { CartProvider } from '../contexts/CartContext'
import {
  AuthContext,
  type AuthContextValue,
} from '../hooks/useAuth'

type RenderWithProvidersOptions = Omit<
  RenderOptions,
  'wrapper'
> & {
  route?: string
  auth?: Partial<AuthContextValue>
}

function unavailableAuthOperation(): Promise<void> {
  return Promise.reject(
    new Error(
      'Operación de autenticación no configurada en la prueba.',
    ),
  )
}

const defaultAuth: AuthContextValue = {
  user: null,
  profile: null,
  loading: false,
  error: null,
  register: unavailableAuthOperation,
  signIn: unavailableAuthOperation,
  signInWithGoogle: unavailableAuthOperation,
  signOut: unavailableAuthOperation,
  clearError: () => {},
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    auth,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const authValue: AuthContextValue = {
    ...defaultAuth,
    ...auth,
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <AuthContext.Provider value={authValue}>
          <CartProvider>{children}</CartProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  })
}

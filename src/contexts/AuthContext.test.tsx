/**
 * @vitest-environment jsdom
 */

import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import type { User as FirebaseUser } from 'firebase/auth'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UserProfile } from '../hooks/useAuth'

const {
  setPersistenceMock,
  onAuthStateChangedMock,
  unsubscribeMock,
  createUserMock,
  updateProfileMock,
  signInMock,
  signInWithPopupMock,
  signOutMock,
  loadFirestoreMock,
  transactionGetMock,
  transactionSetMock,
  runTransactionMock,
  getDocMock,
  docMock,
  serverTimestampMock,
} = vi.hoisted(() => ({
  setPersistenceMock: vi.fn(),
  onAuthStateChangedMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  createUserMock: vi.fn(),
  updateProfileMock: vi.fn(),
  signInMock: vi.fn(),
  signInWithPopupMock: vi.fn(),
  signOutMock: vi.fn(),
  loadFirestoreMock: vi.fn(),
  transactionGetMock: vi.fn(),
  transactionSetMock: vi.fn(),
  runTransactionMock: vi.fn(),
  getDocMock: vi.fn(),
  docMock: vi.fn(),
  serverTimestampMock: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: { type: 'LOCAL' },
  GoogleAuthProvider: class MockGoogleAuthProvider {},
  onAuthStateChanged: onAuthStateChangedMock,
  setPersistence: setPersistenceMock,
  createUserWithEmailAndPassword: createUserMock,
  updateProfile: updateProfileMock,
  signInWithEmailAndPassword: signInMock,
  signInWithPopup: signInWithPopupMock,
  signOut: signOutMock,
}))

vi.mock('../lib/firebase', () => ({
  auth: { name: 'mock-auth' },
  loadFirestore: loadFirestoreMock,
}))

import { AuthProvider } from './AuthContext'
import { useAuth } from '../hooks/useAuth'

class MockTimestamp {
  readonly milliseconds: number

  constructor(milliseconds: number) {
    this.milliseconds = milliseconds
  }
}

const dbMock = { name: 'mock-firestore' }
const documentReference = { path: 'users/customer-001' }

const firestoreMock = {
  Timestamp: MockTimestamp,
  doc: docMock,
  runTransaction: runTransactionMock,
  getDoc: getDocMock,
  serverTimestamp: serverTimestampMock,
}

type AuthObserver = (user: FirebaseUser | null) => void
type AuthErrorObserver = (error: Error) => void

let authObserver: AuthObserver | null = null
let authErrorObserver: AuthErrorObserver | null = null

function userFixture(
  uid = 'customer-001',
): FirebaseUser {
  return {
    uid,
    email: `${uid}@example.com`,
    displayName: 'Cliente de prueba',
  } as FirebaseUser
}

function profileFixture(
  uid = 'customer-001',
  role: UserProfile['role'] = 'customer',
): UserProfile {
  return {
    uid,
    email: `${uid}@example.com`,
    displayName: 'Cliente de prueba',
    role,
    createdAt:
        new MockTimestamp(1000) as unknown as UserProfile['createdAt'],
  }
}

function profileDocument(profile: UserProfile) {
  return {
    exists: () => true,
    data: () => profile,
  }
}

function emitAuth(user: FirebaseUser | null) {
  if (!authObserver) {
    throw new Error('El observador de autenticación no está registrado.')
  }

  act(() => {
    authObserver?.(user)
  })
}

function emitAuthError(error: Error) {
  if (!authErrorObserver) {
    throw new Error('El observador de errores no está registrado.')
  }

  act(() => {
    authErrorObserver?.(error)
  })
}

function wrapper({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>
}

function renderAuthHook() {
  return renderHook(() => useAuth(), { wrapper })
}

async function waitForObserver() {
  await waitFor(() => {
    expect(onAuthStateChangedMock).toHaveBeenCalledTimes(1)
  })
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

  authObserver = null
  authErrorObserver = null

  setPersistenceMock.mockResolvedValue(undefined)
  createUserMock.mockResolvedValue({
    user: userFixture(),
  })
  updateProfileMock.mockResolvedValue(undefined)
  signInMock.mockResolvedValue(undefined)
  signInWithPopupMock.mockResolvedValue(undefined)
  signOutMock.mockResolvedValue(undefined)

  onAuthStateChangedMock.mockImplementation(
    (
      _auth: unknown,
      next: AuthObserver,
      error: AuthErrorObserver,
    ) => {
      authObserver = next
      authErrorObserver = error
      return unsubscribeMock
    },
  )

  docMock.mockReturnValue(documentReference)
  serverTimestampMock.mockReturnValue('server-timestamp')

  transactionGetMock.mockResolvedValue({
    exists: () => true,
  })

  runTransactionMock.mockImplementation(
    async (
      _db: unknown,
      callback: (transaction: {
        get: typeof transactionGetMock
        set: typeof transactionSetMock
      }) => Promise<void>,
    ) => {
      await callback({
        get: transactionGetMock,
        set: transactionSetMock,
      })
    },
  )

  getDocMock.mockResolvedValue(
    profileDocument(profileFixture()),
  )

  loadFirestoreMock.mockResolvedValue({
    db: dbMock,
    firestore: firestoreMock,
  })
})

afterEach(() => {
  cleanup()
})

describe('useAuth y AuthProvider — T12.2-A', () => {
  it('rechaza el uso del hook fuera del provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe utilizarse dentro de un AuthProvider.',
    )
  })

  it('mantiene loading hasta resolver el estado de autenticación', async () => {
    const { result } = renderAuthHook()

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()

    await waitForObserver()

    emitAuth(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(loadFirestoreMock).not.toHaveBeenCalled()
  })

  it('carga el perfil del cliente autenticado', async () => {
    const { result } = renderAuthHook()
    const user = userFixture()

    await waitForObserver()
    emitAuth(user)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.profile?.uid).toBe(user.uid)
    })

    expect(result.current.user).toBe(user)
    expect(result.current.profile?.role).toBe('customer')
    expect(result.current.error).toBeNull()

    expect(docMock).toHaveBeenCalledWith(
      dbMock,
      'users',
      user.uid,
    )

    expect(runTransactionMock).toHaveBeenCalledTimes(1)
    expect(getDocMock).toHaveBeenCalledWith(documentReference)
  })

  it('conserva el rol admin procedente del perfil de Firestore', async () => {
    getDocMock.mockResolvedValue(
      profileDocument(profileFixture('admin-001', 'admin')),
    )

    const { result } = renderAuthHook()

    await waitForObserver()
    emitAuth(userFixture('admin-001'))

    await waitFor(() => {
      expect(result.current.profile?.role).toBe('admin')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('crea el perfil customer cuando todavía no existe', async () => {
    transactionGetMock.mockResolvedValue({
      exists: () => false,
    })

    const { result } = renderAuthHook()

    await waitForObserver()
    emitAuth(userFixture())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(transactionSetMock).toHaveBeenCalledWith(
      documentReference,
      {
        uid: 'customer-001',
        email: 'customer-001@example.com',
        displayName: 'Cliente de prueba',
        role: 'customer',
        createdAt: 'server-timestamp',
      },
    )

    expect(result.current.profile?.role).toBe('customer')
  })

  it('rechaza un perfil cuyo UID no coincide con el usuario', async () => {
    getDocMock.mockResolvedValue(
      profileDocument(profileFixture('another-user')),
    )

    const { result } = renderAuthHook()

    await waitForObserver()
    emitAuth(userFixture())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(
        'El perfil de usuario tiene datos incompletos o inválidos.',
      )
    })

    expect(result.current.user?.uid).toBe('customer-001')
    expect(result.current.profile).toBeNull()
  })

  it('informa cuando no puede recuperar el perfil', async () => {
    getDocMock.mockResolvedValue({
      exists: () => false,
    })

    const { result } = renderAuthHook()

    await waitForObserver()
    emitAuth(userFixture())

    await waitFor(() => {
      expect(result.current.error).toBe(
        'No se pudo crear ni cargar el perfil de usuario.',
      )
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.profile).toBeNull()
  })

  it('informa un error recibido del observador de Firebase', async () => {
    const { result } = renderAuthHook()

    await waitForObserver()

    emitAuthError(
      new FirebaseError(
        'auth/network-request-failed',
        'Network unavailable',
      ),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBe(
      'No se pudo conectar. Comprueba tu conexión e inténtalo nuevamente.',
    )
  })

  it('inicia sesión usando el correo sin espacios exteriores', async () => {
    const { result } = renderAuthHook()

    await waitForObserver()

    await act(async () => {
      await result.current.signIn(
        '  cliente@example.com  ',
        'password-test',
      )
    })

    expect(signInMock).toHaveBeenCalledWith(
      { name: 'mock-auth' },
      'cliente@example.com',
      'password-test',
    )
  })

  it('expone y permite limpiar un error de inicio de sesión', async () => {
    signInMock.mockRejectedValue(
      new FirebaseError(
        'auth/invalid-credential',
        'Invalid credentials',
      ),
    )

    const { result } = renderAuthHook()

    await waitForObserver()

    await act(async () => {
      await expect(
        result.current.signIn('cliente@example.com', 'incorrecta'),
      ).rejects.toThrow(
        'El correo o la contraseña no son correctos.',
      )
    })

    expect(result.current.error).toBe(
      'El correo o la contraseña no son correctos.',
    )

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('registra al usuario y actualiza su nombre visible', async () => {
    const user = userFixture()

    createUserMock.mockResolvedValue({ user })

    const { result } = renderAuthHook()

    await waitForObserver()

    await act(async () => {
      await result.current.register(
        '  Cliente Premium  ',
        '  cliente@example.com  ',
        'password-test',
      )
    })

    expect(createUserMock).toHaveBeenCalledWith(
      { name: 'mock-auth' },
      'cliente@example.com',
      'password-test',
    )

    expect(updateProfileMock).toHaveBeenCalledWith(
      user,
      { displayName: 'Cliente Premium' },
    )
  })

  it('inicia sesión con Google mediante Firebase', async () => {
    const { result } = renderAuthHook()

    await waitForObserver()

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(signInWithPopupMock).toHaveBeenCalledTimes(1)
    expect(signInWithPopupMock.mock.calls[0][0]).toEqual({
      name: 'mock-auth',
    })
  })

  it('cierra sesión y elimina el estado del usuario', async () => {
    const { result } = renderAuthHook()

    await waitForObserver()
    emitAuth(userFixture())

    await waitFor(() => {
      expect(result.current.profile).not.toBeNull()
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(signOutMock).toHaveBeenCalledTimes(1)
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('no aplica un perfil antiguo después de cambiar de usuario', async () => {
    const firstProfile = deferred<ReturnType<typeof profileDocument>>()

    getDocMock
      .mockReturnValueOnce(firstProfile.promise)
      .mockResolvedValueOnce(
        profileDocument(profileFixture('customer-002')),
      )

    const { result } = renderAuthHook()

    await waitForObserver()

    emitAuth(userFixture('customer-001'))

    await waitFor(() => {
      expect(getDocMock).toHaveBeenCalledTimes(1)
    })

    emitAuth(userFixture('customer-002'))

    await waitFor(() => {
      expect(result.current.profile?.uid).toBe('customer-002')
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      firstProfile.resolve(
        profileDocument(profileFixture('customer-001')),
      )
      await firstProfile.promise
    })

    expect(result.current.user?.uid).toBe('customer-002')
    expect(result.current.profile?.uid).toBe('customer-002')
  })

  it('cancela la suscripción de Firebase al desmontarse', async () => {
    const { unmount } = renderAuthHook()

    await waitForObserver()

    unmount()

    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })
})

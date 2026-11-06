import { FirebaseError } from 'firebase/app'
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { auth, loadFirestore } from '../lib/firebase'
import {
  AuthContext,
  type AuthContextValue,
  type UserProfile,
} from '../hooks/useAuth'

type AuthProviderProps = {
  children: ReactNode
}

type AuthState = Pick<AuthContextValue, 'user' | 'profile' | 'loading' | 'error'>

function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      'auth/account-exists-with-different-credential':
        'Ya existe una cuenta con este correo. Inicia sesión con el método que utilizaste al registrarte.',
      'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
      'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
      'auth/invalid-email': 'Ingresa un correo electrónico válido.',
      'auth/network-request-failed':
        'No se pudo conectar. Comprueba tu conexión e inténtalo nuevamente.',
      'auth/popup-blocked':
        'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo nuevamente.',
      'auth/popup-closed-by-user': 'Se cerró la ventana de inicio de sesión.',
      'auth/too-many-requests':
        'Hubo demasiados intentos. Espera un momento antes de volver a intentarlo.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'permission-denied':
        'Firebase denegó el acceso al perfil. Verifica las reglas de Firestore.',
      'unavailable':
        'El servicio no está disponible temporalmente. Inténtalo nuevamente.',
    }

    return messages[error.code] ?? 'No se pudo completar la operación. Inténtalo nuevamente.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Inténtalo nuevamente.'
}

function isUserProfile(
  value: unknown,
  uid: string,
  timestampConstructor: typeof Timestamp,
): value is UserProfile {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const profile = value as Record<string, unknown>

  return (
    profile.uid === uid &&
    typeof profile.email === 'string' &&
    typeof profile.displayName === 'string' &&
    (profile.role === 'customer' || profile.role === 'admin') &&
    profile.createdAt instanceof timestampConstructor
  )
}

async function ensureUserProfile(
  user: FirebaseUser,
  preferredDisplayName?: string,
): Promise<UserProfile> {
  const { db, firestore } = await loadFirestore()
  const profileRef = firestore.doc(db, 'users', user.uid)
  const displayName =
    preferredDisplayName?.trim() ||
    user.displayName?.trim() ||
    user.email?.split('@')[0] ||
    'Cliente'

  await firestore.runTransaction(db, async (transaction) => {
    const existingProfile = await transaction.get(profileRef)

    if (!existingProfile.exists()) {
      transaction.set(profileRef, {
        uid: user.uid,
        email: user.email ?? '',
        displayName,
        role: 'customer',
        createdAt: firestore.serverTimestamp(),
      })
    }
  })

  const profileSnapshot = await firestore.getDoc(profileRef)

  if (!profileSnapshot.exists()) {
    throw new Error('No se pudo crear ni cargar el perfil de usuario.')
  }

  const profile = profileSnapshot.data()

  if (!isUserProfile(profile, user.uid, firestore.Timestamp)) {
    throw new Error('El perfil de usuario tiene datos incompletos o inválidos.')
  }

  return profile
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })
  const pendingDisplayName = useRef<string | null>(null)

  useEffect(() => {
    let active = true
    let latestRequest = 0
    let unsubscribe: (() => void) | undefined

    void setPersistence(auth, browserLocalPersistence)
      .then(() => {
        if (!active) {
          return
        }

        unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            const request = ++latestRequest

            if (!user) {
              setState({
                user: null,
                profile: null,
                loading: false,
                error: null,
              })
              return
            }

            setState((current) => ({
              ...current,
              user,
              profile: null,
              loading: true,
              error: null,
            }))

            const displayName = pendingDisplayName.current

            void ensureUserProfile(user, displayName ?? undefined)
              .then((profile) => {
                if (active && request === latestRequest) {
                  setState({
                    user,
                    profile,
                    loading: false,
                    error: null,
                  })
                }
              })
              .catch((error: unknown) => {
                if (active && request === latestRequest) {
                  setState({
                    user,
                    profile: null,
                    loading: false,
                    error: getErrorMessage(error),
                  })
                }
              })
              .finally(() => {
                if (pendingDisplayName.current === displayName) {
                  pendingDisplayName.current = null
                }
              })
          },
          (error) => {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: getErrorMessage(error),
            })
          },
        )
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: getErrorMessage(error),
          })
        }
      })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const clearError = () => {
    setState((current) => ({ ...current, error: null }))
  }

  const register: AuthContextValue['register'] = async (
    displayName,
    email,
    password,
  ) => {
    clearError()
    pendingDisplayName.current = displayName.trim()
    let registrationUid: string | null = null

    try {
      await setPersistence(auth, browserLocalPersistence)
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      )
      registrationUid = credential.user.uid
      await updateProfile(credential.user, {
        displayName: pendingDisplayName.current,
      })
    } catch (error) {
      if (!registrationUid) {
        pendingDisplayName.current = null
      }
      const message = getErrorMessage(error)
      setState((current) => ({ ...current, error: message }))
      throw new Error(message, { cause: error })
    }
  }

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    clearError()

    try {
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      )
    } catch (error) {
      const message = getErrorMessage(error)
      setState((current) => ({ ...current, error: message }))
      throw new Error(message, { cause: error })
    }
  }

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = async () => {
    clearError()

    try {
      await setPersistence(auth, browserLocalPersistence)
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (error) {
      const message = getErrorMessage(error)
      setState((current) => ({ ...current, error: message }))
      throw new Error(message, { cause: error })
    }
  }

  const signOut: AuthContextValue['signOut'] = async () => {
    clearError()

    try {
      await firebaseSignOut(auth)
      setState({ user: null, profile: null, loading: false, error: null })
    } catch (error) {
      const message = getErrorMessage(error)
      setState((current) => ({ ...current, error: message }))
      throw new Error(message, { cause: error })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        signIn,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

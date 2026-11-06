import { createContext, useContext } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'

export type UserProfile = {
  uid: string
  email: string
  displayName: string
  role: 'customer' | 'admin'
  createdAt: Timestamp
}

export type AuthContextValue = {
  user: FirebaseUser | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  register: (displayName: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider.')
  }

  return context
}

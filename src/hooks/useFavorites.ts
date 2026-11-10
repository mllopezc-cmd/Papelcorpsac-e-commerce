import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import { useAuth } from './useAuth'
import {
  addFavorite as saveFavorite,
  removeFavorite as deleteFavorite,
  subscribeToFavorites,
} from '../services/favoriteService'

type FavoritesState = {
  uid: string | null
  authUser: FirebaseUser | null
  productIds: string[]
  loading: boolean
  error: Error | null
  pendingProductIds: string[]
}

type UseFavoritesResult = {
  favorites: string[]
  loading: boolean
  error: Error | null
  pendingProductIds: string[]
  addFavorite: (productId: string) => Promise<boolean>
  removeFavorite: (productId: string) => Promise<boolean>
}

const emptyState: FavoritesState = {
  uid: null,
  authUser: null,
  productIds: [],
  loading: false,
  error: null,
  pendingProductIds: [],
}

type AuthSession = {
  user: FirebaseUser | null
  generation: number
}

export function useFavorites(): UseFavoritesResult {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const sessionRef = useRef<AuthSession>({ user: null, generation: 0 })
  const pendingOperations = useRef(new Set<string>())
  const [state, setState] = useState<FavoritesState>(emptyState)

  useLayoutEffect(() => {
    if (sessionRef.current.user !== user) {
      sessionRef.current = {
        user,
        generation: sessionRef.current.generation + 1,
      }
    }
  }, [user])

  useEffect(() => {
    let active = true
    const session = sessionRef.current

    if (!uid || !user) {
      queueMicrotask(() => {
        if (
          active &&
          sessionRef.current.user === null &&
          sessionRef.current.generation === session.generation
        ) {
          setState(emptyState)
        }
      })

      return () => {
        active = false
      }
    }

    const unsubscribe = subscribeToFavorites(
      uid,
      (productIds) => {
        if (
          active &&
          sessionRef.current.user === user &&
          sessionRef.current.generation === session.generation
        ) {
          setState((current) =>
            current.uid === uid && current.authUser === user
              ? { ...current, productIds, loading: false }
              : {
                  uid,
                  authUser: user,
                  productIds,
                  loading: false,
                  error: null,
                  pendingProductIds: [],
                },
          )
        }
      },
      (error) => {
        if (
          active &&
          sessionRef.current.user === user &&
          sessionRef.current.generation === session.generation
        ) {
          setState((current) => ({
            uid,
            authUser: user,
            productIds:
              current.uid === uid && current.authUser === user
                ? current.productIds
                : [],
            loading: false,
            error,
            pendingProductIds:
              current.uid === uid && current.authUser === user
                ? current.pendingProductIds
                : [],
          }))
        }
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [uid, user])

  const updateFavorite = async (
    productId: string,
    operation: typeof saveFavorite,
  ): Promise<boolean> => {
    const session = sessionRef.current

    if (!uid || !user || session.user !== user) {
      return false
    }

    const operationUid = uid
    const operationKey = JSON.stringify([
      session.generation,
      operationUid,
      productId,
    ])

    if (pendingOperations.current.has(operationKey)) {
      return false
    }

    pendingOperations.current.add(operationKey)
    setState((current) => ({
      uid: operationUid,
      authUser: user,
      productIds:
        current.uid === operationUid && current.authUser === user
          ? current.productIds
          : [],
      loading:
        current.uid === operationUid && current.authUser === user
          ? current.loading
          : true,
      error: null,
      pendingProductIds:
        current.uid === operationUid && current.authUser === user
          ? [...new Set([...current.pendingProductIds, productId])]
          : [productId],
    }))

    try {
      await operation(operationUid, productId)
      return true
    } catch (error: unknown) {
      setState((current) =>
        sessionRef.current.user === user &&
        sessionRef.current.generation === session.generation &&
        current.uid === operationUid &&
        current.authUser === user
          ? {
              ...current,
              error:
                error instanceof Error
                  ? error
                  : new Error(
                      'Ocurrió un error inesperado al sincronizar favoritos.',
                    ),
            }
          : current,
      )
      return false
    } finally {
      pendingOperations.current.delete(operationKey)
      setState((current) =>
        sessionRef.current.user === user &&
        sessionRef.current.generation === session.generation &&
        current.uid === operationUid &&
        current.authUser === user
          ? {
              ...current,
              pendingProductIds: current.pendingProductIds.filter(
                (pendingId) => pendingId !== productId,
              ),
            }
          : current,
      )
    }
  }

  const visibleState =
    state.uid === uid && state.authUser === user
      ? state
      : {
          uid,
          authUser: user,
          productIds: [],
          loading: uid !== null,
          error: null,
          pendingProductIds: [],
        }

  return {
    favorites: visibleState.productIds,
    loading: visibleState.loading,
    error: visibleState.error,
    pendingProductIds: visibleState.pendingProductIds,
    addFavorite: (productId) => updateFavorite(productId, saveFavorite),
    removeFavorite: (productId) => updateFavorite(productId, deleteFavorite),
  }
}

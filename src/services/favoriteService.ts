import { loadFirestore } from '../lib/firebase'

const pendingOperations = new Map<string, Promise<void>>()

function getError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error('Ocurrió un error inesperado al sincronizar favoritos.')
}

function serializeOperation(
  uid: string,
  productId: string,
  operation: () => Promise<void>,
): Promise<void> {
  const key = JSON.stringify([uid, productId])
  const previousOperation = pendingOperations.get(key)
  const currentOperation = (previousOperation ?? Promise.resolve())
    .catch(() => undefined)
    .then(operation)

  pendingOperations.set(key, currentOperation)
  void currentOperation.then(
    () => {
      if (pendingOperations.get(key) === currentOperation) {
        pendingOperations.delete(key)
      }
    },
    () => {
      if (pendingOperations.get(key) === currentOperation) {
        pendingOperations.delete(key)
      }
    },
  )

  return currentOperation
}

export function subscribeToFavorites(
  uid: string,
  onFavorites: (productIds: string[]) => void,
  onError: (error: Error) => void,
): () => void {
  let cancelled = false
  let unsubscribe: (() => void) | undefined

  void loadFirestore()
    .then(({ db, firestore }) => {
      if (cancelled) {
        return
      }

      const favoritesRef = firestore.collection(db, 'users', uid, 'favorites')
      unsubscribe = firestore.onSnapshot(
        favoritesRef,
        (snapshot) => {
          if (!cancelled) {
            onFavorites(snapshot.docs.map((favorite) => favorite.id))
          }
        },
        (error: Error) => {
          if (!cancelled) {
            onError(error)
          }
        },
      )
    })
    .catch((error: unknown) => {
      if (!cancelled) {
        onError(getError(error))
      }
    })

  return () => {
    cancelled = true
    unsubscribe?.()
  }
}

export function addFavorite(uid: string, productId: string): Promise<void> {
  return serializeOperation(uid, productId, async () => {
    const { db, firestore } = await loadFirestore()
    const favoriteRef = firestore.doc(
      db,
      'users',
      uid,
      'favorites',
      productId,
    )

    await firestore.runTransaction(db, async (transaction) => {
      const favorite = await transaction.get(favoriteRef)

      if (!favorite.exists()) {
        transaction.set(favoriteRef, {
          productId,
          createdAt: firestore.serverTimestamp(),
        })
      }
    })
  })
}

export function removeFavorite(uid: string, productId: string): Promise<void> {
  return serializeOperation(uid, productId, async () => {
    const { db, firestore } = await loadFirestore()
    await firestore.deleteDoc(
      firestore.doc(db, 'users', uid, 'favorites', productId),
    )
  })
}

export function getFavoriteErrorMessage(error: Error): string {
  const code =
    'code' in error && typeof error.code === 'string' ? error.code : ''

  if (code === 'permission-denied') {
    return 'No se pudo acceder a tus favoritos. Verifica los permisos de Firestore.'
  }

  if (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'network-request-failed'
  ) {
    return 'No se pudo conectar con Firestore. Comprueba tu conexión e inténtalo nuevamente.'
  }

  return 'No se pudieron sincronizar tus favoritos. Inténtalo nuevamente.'
}

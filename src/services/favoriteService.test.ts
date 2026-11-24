import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  loadFirestoreMock,
  collectionMock,
  onSnapshotMock,
  docMock,
  runTransactionMock,
  transactionGetMock,
  transactionSetMock,
  deleteDocMock,
  serverTimestampMock,
  unsubscribeMock,
} = vi.hoisted(() => ({
  loadFirestoreMock: vi.fn(),
  collectionMock: vi.fn(),
  onSnapshotMock: vi.fn(),
  docMock: vi.fn(),
  runTransactionMock: vi.fn(),
  transactionGetMock: vi.fn(),
  transactionSetMock: vi.fn(),
  deleteDocMock: vi.fn(),
  serverTimestampMock: vi.fn(),
  unsubscribeMock: vi.fn(),
}))

vi.mock('../lib/firebase', () => ({
  loadFirestore: loadFirestoreMock,
}))

import {
  addFavorite,
  getFavoriteErrorMessage,
  removeFavorite,
  subscribeToFavorites,
} from './favoriteService'

const dbMock = { name: 'test-firestore' }
const collectionRef = { path: 'users/customer-001/favorites' }
const documentRef = {
  path: 'users/customer-001/favorites/product-001',
}

type FavoriteSnapshot = {
  docs: Array<{ id: string }>
}

let snapshotNext!: (snapshot: FavoriteSnapshot) => void
let snapshotError!: (error: Error) => void

function deferred() {
  let resolve!: () => void

  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

beforeEach(() => {
  vi.clearAllMocks()

  const firestoreMock = {
    collection: collectionMock,
    onSnapshot: onSnapshotMock,
    doc: docMock,
    runTransaction: runTransactionMock,
    deleteDoc: deleteDocMock,
    serverTimestamp: serverTimestampMock,
  }

  loadFirestoreMock.mockResolvedValue({
    db: dbMock,
    firestore: firestoreMock,
  })

  collectionMock.mockReturnValue(collectionRef)
  docMock.mockReturnValue(documentRef)
  serverTimestampMock.mockReturnValue('test-timestamp')
  deleteDocMock.mockResolvedValue(undefined)
  transactionGetMock.mockResolvedValue({
    exists: () => false,
  })

  onSnapshotMock.mockImplementation(
    (
      _reference: unknown,
      next: (snapshot: FavoriteSnapshot) => void,
      error: (cause: Error) => void,
    ) => {
      snapshotNext = next
      snapshotError = error
      return unsubscribeMock
    },
  )

  runTransactionMock.mockImplementation(
    async (
      _database: unknown,
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
})

describe('favoriteService — T12.5-B', () => {
  it('se suscribe y devuelve los identificadores de favoritos', async () => {
    const onFavorites = vi.fn()
    const onError = vi.fn()

    const unsubscribe = subscribeToFavorites(
      'customer-001',
      onFavorites,
      onError,
    )

    await vi.waitFor(() => {
      expect(onSnapshotMock).toHaveBeenCalledTimes(1)
    })

    expect(collectionMock).toHaveBeenCalledWith(
      dbMock,
      'users',
      'customer-001',
      'favorites',
    )

    snapshotNext({
      docs: [
        { id: 'product-001' },
        { id: 'product-002' },
      ],
    })

    expect(onFavorites).toHaveBeenCalledWith([
      'product-001',
      'product-002',
    ])
    expect(onError).not.toHaveBeenCalled()

    unsubscribe()
    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })

  it('propaga errores de la suscripción', async () => {
    const onFavorites = vi.fn()
    const onError = vi.fn()

    const unsubscribe = subscribeToFavorites(
      'customer-001',
      onFavorites,
      onError,
    )

    await vi.waitFor(() => {
      expect(onSnapshotMock).toHaveBeenCalledTimes(1)
    })

    const failure = new Error('Sin permisos')
    snapshotError(failure)

    expect(onError).toHaveBeenCalledWith(failure)
    expect(onFavorites).not.toHaveBeenCalled()

    unsubscribe()
  })

  it('impide notificaciones al cancelar antes de inicializar', async () => {
    let resolveFirestore!: (value: unknown) => void

    const pending = new Promise<unknown>((resolve) => {
      resolveFirestore = resolve
    })

    loadFirestoreMock.mockReturnValueOnce(pending)

    const onFavorites = vi.fn()
    const onError = vi.fn()

    const unsubscribe = subscribeToFavorites(
      'customer-001',
      onFavorites,
      onError,
    )

    unsubscribe()

    resolveFirestore({
      db: dbMock,
      firestore: {
        collection: collectionMock,
        onSnapshot: onSnapshotMock,
      },
    })

    await pending
    await Promise.resolve()

    expect(onSnapshotMock).not.toHaveBeenCalled()
    expect(onFavorites).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('crea un favorito mediante una transacción', async () => {
    await addFavorite('customer-001', 'product-001')

    expect(docMock).toHaveBeenCalledWith(
      dbMock,
      'users',
      'customer-001',
      'favorites',
      'product-001',
    )

    expect(transactionGetMock).toHaveBeenCalledWith(documentRef)
    expect(transactionSetMock).toHaveBeenCalledWith(
      documentRef,
      {
        productId: 'product-001',
        createdAt: 'test-timestamp',
      },
    )
    expect(runTransactionMock).toHaveBeenCalledTimes(1)
  })

  it('no vuelve a crear un favorito existente', async () => {
    transactionGetMock.mockResolvedValue({
      exists: () => true,
    })

    await addFavorite('customer-001', 'product-001')

    expect(transactionGetMock).toHaveBeenCalledTimes(1)
    expect(transactionSetMock).not.toHaveBeenCalled()
  })

  it('elimina el documento del favorito solicitado', async () => {
    await removeFavorite('customer-001', 'product-001')

    expect(docMock).toHaveBeenCalledWith(
      dbMock,
      'users',
      'customer-001',
      'favorites',
      'product-001',
    )

    expect(deleteDocMock).toHaveBeenCalledWith(documentRef)
  })

  it('serializa las operaciones consecutivas sobre el mismo producto', async () => {
    const firstRequest = deferred()
    deleteDocMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValueOnce(undefined)

    const first = removeFavorite(
      'customer-001',
      'product-001',
    )

    await vi.waitFor(() => {
      expect(deleteDocMock).toHaveBeenCalledTimes(1)
    })

    const second = removeFavorite(
      'customer-001',
      'product-001',
    )

    expect(deleteDocMock).toHaveBeenCalledTimes(1)

    firstRequest.resolve()

    await Promise.all([first, second])

    expect(deleteDocMock).toHaveBeenCalledTimes(2)
  })

  it('traduce errores de permisos, conexión y errores generales', () => {
    const permissionError = Object.assign(
      new Error('Denied'),
      { code: 'permission-denied' },
    )

    const unavailableError = Object.assign(
      new Error('Offline'),
      { code: 'unavailable' },
    )

    const deadlineError = Object.assign(
      new Error('Timeout'),
      { code: 'deadline-exceeded' },
    )

    expect(getFavoriteErrorMessage(permissionError)).toBe(
      'No se pudo acceder a tus favoritos. Verifica los permisos de Firestore.',
    )

    expect(getFavoriteErrorMessage(unavailableError)).toBe(
      'No se pudo conectar con Firestore. Comprueba tu conexión e inténtalo nuevamente.',
    )

    expect(getFavoriteErrorMessage(deadlineError)).toBe(
      'No se pudo conectar con Firestore. Comprueba tu conexión e inténtalo nuevamente.',
    )

    expect(
      getFavoriteErrorMessage(new Error('Error desconocido')),
    ).toBe(
      'No se pudieron sincronizar tus favoritos. Inténtalo nuevamente.',
    )
  })
})

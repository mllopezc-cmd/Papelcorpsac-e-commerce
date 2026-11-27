/**
 * @vitest-environment jsdom
 */

import { randomUUID } from 'node:crypto'
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest'
import {
  deleteApp as deleteAdminApp,
  initializeApp as initializeAdminApp,
  type App as AdminApp,
} from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import {
  getFirestore as getAdminFirestore,
} from 'firebase-admin/firestore'
import {
  deleteApp,
  initializeApp,
  type FirebaseApp,
} from 'firebase/app'
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  type Auth,
} from 'firebase/auth'
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore'

const PROJECT_ID = 'demo-papelcorpsac'

const RUN_INTEGRATION =
  process.env.PAPELCORPSAC_RUN_RULES_INTEGRATION === 'true'

const imageKey =
  'products/11111111-1111-4111-8111-111111111111.webp'

const productData = {
  name: 'Cuaderno de prueba',
  description: 'Producto para comprobar las reglas Firestore.',
  category: 'stationery',
  price: 25.5,
  brand: 'PAPEL CORP',
  stock: 10,
  imageUrl: '/images/product-placeholder.svg',
  published: true,
}

type TestClient = {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  uid: string
}

let adminApp: AdminApp
let adminClient: TestClient
let customerClient: TestClient
let publicApp: FirebaseApp
let publicDb: Firestore

const productIds: string[] = []
const userIds: string[] = []

function assertSafeEnvironment(): void {
  if (
    process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099' ||
    process.env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Estas pruebas requieren los emuladores locales de Firebase.',
    )
  }

  for (const name of [
    'FIREBASE_PROJECT_ID',
    'GCLOUD_PROJECT',
    'GOOGLE_CLOUD_PROJECT',
  ]) {
    const value = process.env[name]

    if (value !== undefined && value !== PROJECT_ID) {
      throw new Error(
        'Las pruebas requieren el proyecto demo-papelcorpsac.',
      )
    }
  }
}

function createClientApp(): FirebaseApp {
  return initializeApp(
    {
      apiKey: 'demo-api-key',
      authDomain: `${PROJECT_ID}.firebaseapp.com`,
      projectId: PROJECT_ID,
      appId: `demo-app-${randomUUID()}`,
    },
    `rules-test-${randomUUID()}`,
  )
}

function connectClientFirestore(app: FirebaseApp): Firestore {
  const db = getFirestore(app)

  connectFirestoreEmulator(db, '127.0.0.1', 8080)

  return db
}

async function createAuthenticatedClient(): Promise<TestClient> {
  const app = createClientApp()
  const auth = getAuth(app)

  connectAuthEmulator(
    auth,
    'http://127.0.0.1:9099',
    { disableWarnings: true },
  )

  const db = connectClientFirestore(app)
  const email = `rules-${randomUUID()}@example.test`
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    'TestPassword123!',
  )

  userIds.push(credential.user.uid)

  return {
    app,
    auth,
    db,
    uid: credential.user.uid,
  }
}

async function seedProduct(
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const id = `rules-${randomUUID()}`

  await getAdminFirestore(adminApp)
    .collection('products')
    .doc(id)
    .set({
      ...productData,
      ...overrides,
    })

  productIds.push(id)

  return id
}

describe.skipIf(!RUN_INTEGRATION)(
  'Reglas Firestore — imágenes S3 privadas T10.4-C',
  () => {
    beforeAll(async () => {
      assertSafeEnvironment()

      adminApp = initializeAdminApp(
        { projectId: PROJECT_ID },
        `rules-admin-${randomUUID()}`,
      )

      adminClient = await createAuthenticatedClient()
      customerClient = await createAuthenticatedClient()

      publicApp = createClientApp()
      publicDb = connectClientFirestore(publicApp)

      await getAdminFirestore(adminApp)
        .collection('users')
        .doc(adminClient.uid)
        .set({ role: 'admin' })

      await getAdminFirestore(adminApp)
        .collection('users')
        .doc(customerClient.uid)
        .set({ role: 'customer' })
    }, 30_000)

    afterAll(async () => {
      if (!adminApp) return

      const db = getAdminFirestore(adminApp)

      for (const id of productIds) {
        await db.collection('products').doc(id).delete()
      }

      for (const uid of userIds) {
        await db.collection('users').doc(uid).delete()
        await getAdminAuth(adminApp).deleteUser(uid)
      }

      if (adminClient?.app) await deleteApp(adminClient.app)
      if (customerClient?.app) await deleteApp(customerClient.app)
      if (publicApp) await deleteApp(publicApp)

      await deleteAdminApp(adminApp)
    }, 30_000)

    it('permite al administrador crear un producto con imageKey válido', async () => {
      const id = `rules-${randomUUID()}`
      productIds.push(id)

      await expect(
        setDoc(doc(adminClient.db, 'products', id), {
          ...productData,
          imageKey,
        }),
      ).resolves.toBeUndefined()

      const snapshot = await getDoc(
        doc(adminClient.db, 'products', id),
      )

      expect(snapshot.data()?.imageKey).toBe(imageKey)
    })

    it('rechaza una clave S3 con formato inválido', async () => {
      const id = `rules-${randomUUID()}`
      productIds.push(id)

      await expect(
        setDoc(doc(adminClient.db, 'products', id), {
          ...productData,
          imageKey: '../private/imagen.webp',
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('rechaza extensiones distintas de JPEG, PNG y WebP', async () => {
      const id = `rules-${randomUUID()}`
      productIds.push(id)

      await expect(
        setDoc(doc(adminClient.db, 'products', id), {
          ...productData,
          imageKey:
            'products/11111111-1111-4111-8111-111111111111.svg',
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('mantiene la compatibilidad con productos sin imageKey', async () => {
      const id = `rules-${randomUUID()}`
      productIds.push(id)

      await expect(
        setDoc(
          doc(adminClient.db, 'products', id),
          productData,
        ),
      ).resolves.toBeUndefined()

      const snapshot = await getDoc(
        doc(publicDb, 'products', id),
      )

      expect(snapshot.exists()).toBe(true)
      expect(snapshot.data()?.imageKey).toBeUndefined()
    })

    it('rechaza la escritura de productos por clientes', async () => {
      const id = `rules-${randomUUID()}`
      productIds.push(id)

      await expect(
        setDoc(doc(customerClient.db, 'products', id), {
          ...productData,
          imageKey,
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('mantiene el acceso público a productos publicados', async () => {
      const id = await seedProduct({
        imageKey,
        published: true,
      })

      const snapshot = await getDoc(
        doc(publicDb, 'products', id),
      )

      expect(snapshot.exists()).toBe(true)
      expect(snapshot.data()?.imageKey).toBe(imageKey)
    })

    it('impide la lectura pública de productos no publicados', async () => {
      const id = await seedProduct({
        imageKey,
        published: false,
      })

      await expect(
        getDoc(doc(publicDb, 'products', id)),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })

      const adminSnapshot = await getDoc(
        doc(adminClient.db, 'products', id),
      )

      expect(adminSnapshot.exists()).toBe(true)
    })

    it('mantiene el filtro de consultas del catálogo público', async () => {
      await seedProduct({
        published: true,
        imageKey,
      })

      const result = await getDocs(
        query(
          collection(publicDb, 'products'),
          where('published', '==', true),
        ),
      )

      expect(
        result.docs.every(
          (snapshot) => snapshot.data().published === true,
        ),
      ).toBe(true)
    })

    it('rechaza consultas públicas sin filtro de publicación', async () => {
      await expect(
        getDocs(collection(publicDb, 'products')),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('no permite que un cliente publique productos ajenos', async () => {
      const id = await seedProduct({
        published: false,
      })

      await expect(
        setDoc(doc(customerClient.db, 'products', id), {
          ...productData,
          published: true,
          imageKey,
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('permite actualizar stock de un producto heredado con id coincidente', async () => {
      const id = `rules-${randomUUID()}`

      await getAdminFirestore(adminApp)
        .collection('products')
        .doc(id)
        .set({ ...productData, id })

      productIds.push(id)

      await expect(
        updateDoc(doc(adminClient.db, 'products', id), {
          stock: 40,
        }),
      ).resolves.toBeUndefined()

      const result = await getDoc(
        doc(adminClient.db, 'products', id),
      )

      expect(result.data()?.stock).toBe(40)
      expect(result.data()?.id).toBe(id)
    })

    it('permite actualizar stock sin un campo id almacenado', async () => {
      const id = await seedProduct()

      await expect(
        updateDoc(doc(adminClient.db, 'products', id), {
          stock: 40,
        }),
      ).resolves.toBeUndefined()

      expect(
        (await getDoc(doc(adminClient.db, 'products', id)))
          .data()?.stock,
      ).toBe(40)
    })

    it('rechaza un id diferente al crear o actualizar', async () => {
      const id = `rules-${randomUUID()}`
      productIds.push(id)

      await expect(
        setDoc(doc(adminClient.db, 'products', id), {
          ...productData,
          id: 'otro-id',
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })

      await getAdminFirestore(adminApp)
        .collection('products')
        .doc(id)
        .set({ ...productData, id })

      await expect(
        updateDoc(doc(adminClient.db, 'products', id), {
          id: 'otro-id',
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('mantiene los controles de stock, precio y campos adicionales', async () => {
      const id = await seedProduct()

      await expect(
        updateDoc(doc(adminClient.db, 'products', id), {
          stock: -1,
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })

      await expect(
        updateDoc(doc(adminClient.db, 'products', id), {
          price: 25.555,
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })

      await expect(
        updateDoc(doc(adminClient.db, 'products', id), {
          unknownField: true,
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('impide que Customer modifique stock o elimine productos', async () => {
      const id = await seedProduct()

      await expect(
        updateDoc(doc(customerClient.db, 'products', id), {
          stock: 40,
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })

      await expect(
        deleteDoc(doc(customerClient.db, 'products', id)),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('mantiene la eliminación administrativa', async () => {
      const id = await seedProduct()

      await expect(
        deleteDoc(doc(adminClient.db, 'products', id)),
      ).resolves.toBeUndefined()
    })
  },
)

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
  Timestamp,
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

type TestClient = {
  app: FirebaseApp
  db: Firestore
  uid: string
}

let adminApp: AdminApp
let adminClient: TestClient
let customerClient: TestClient
let otherCustomer: TestClient
let publicApp: FirebaseApp
let publicDb: Firestore

const orderIds: string[] = []
const userIds: string[] = []

function assertSafeEnvironment(): void {
  if (
    process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099' ||
    process.env.NODE_ENV === 'production' ||
    (
      process.env.VERCEL_ENV !== undefined &&
      process.env.VERCEL_ENV !== 'development'
    )
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
    `orders-test-${randomUUID()}`,
  )
}

function createClientFirestore(app: FirebaseApp): Firestore {
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

  const db = createClientFirestore(app)
  const email = `orders-${randomUUID()}@example.test`

  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    'TestPassword123!',
  )

  userIds.push(credential.user.uid)

  return {
    app,
    db,
    uid: credential.user.uid,
  }
}

async function seedOrder(userId: string): Promise<string> {
  const id = `orders-test-${randomUUID()}`

  await getAdminFirestore(adminApp)
    .collection('orders')
    .doc(id)
    .set({
      userId,
      status: 'pending',
      currency: 'PEN',
      items: [
        {
          productId: 'producto-demo',
          name: 'Cuaderno de prueba',
          quantity: 1,
          unitPriceCents: 2500,
          subtotalCents: 2500,
        },
      ],
      totalCents: 2500,
      createdAt: Timestamp.now(),
    })

  orderIds.push(id)

  return id
}

describe.skipIf(!RUN_INTEGRATION)(
  'Reglas Firestore — órdenes administrativas T11.2',
  () => {
    beforeAll(async () => {
      assertSafeEnvironment()

      adminApp = initializeAdminApp(
        { projectId: PROJECT_ID },
        `orders-admin-${randomUUID()}`,
      )

      adminClient = await createAuthenticatedClient()
      customerClient = await createAuthenticatedClient()
      otherCustomer = await createAuthenticatedClient()

      publicApp = createClientApp()
      publicDb = createClientFirestore(publicApp)

      const db = getAdminFirestore(adminApp)

      await db.collection('users').doc(adminClient.uid).set({
        role: 'admin',
      })

      await db.collection('users').doc(customerClient.uid).set({
        role: 'customer',
      })

      await db.collection('users').doc(otherCustomer.uid).set({
        role: 'customer',
      })
    }, 30_000)

    afterAll(async () => {
      if (!adminApp) {
        return
      }

      const db = getAdminFirestore(adminApp)

      try {
        for (const id of orderIds) {
          await db.collection('orders').doc(id).delete()
        }

        for (const uid of userIds) {
          await db.collection('users').doc(uid).delete()
          await getAdminAuth(adminApp).deleteUser(uid)
        }
      } finally {
        for (const client of [
          adminClient,
          customerClient,
          otherCustomer,
        ]) {
          if (client?.app) {
            await deleteApp(client.app)
          }
        }

        if (publicApp) {
          await deleteApp(publicApp)
        }

        await deleteAdminApp(adminApp)
      }
    }, 30_000)

    it('permite que Admin consulte órdenes de distintos clientes', async () => {
      const firstId = await seedOrder(customerClient.uid)
      const secondId = await seedOrder(otherCustomer.uid)

      const snapshot = await getDocs(
        collection(adminClient.db, 'orders'),
      )

      const ids = snapshot.docs.map((item) => item.id)

      expect(ids).toContain(firstId)
      expect(ids).toContain(secondId)
    })

    it('permite que Customer consulte su orden', async () => {
      const id = await seedOrder(customerClient.uid)

      const snapshot = await getDoc(
        doc(customerClient.db, 'orders', id),
      )

      expect(snapshot.exists()).toBe(true)
    })

    it('impide que Customer lea una orden ajena', async () => {
      const id = await seedOrder(otherCustomer.uid)

      await expect(
        getDoc(doc(customerClient.db, 'orders', id)),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('permite el historial filtrado por propietario', async () => {
      const ownId = await seedOrder(customerClient.uid)
      await seedOrder(otherCustomer.uid)

      const snapshot = await getDocs(
        query(
          collection(customerClient.db, 'orders'),
          where('userId', '==', customerClient.uid),
        ),
      )

      expect(snapshot.docs.map((item) => item.id)).toContain(ownId)
      expect(
        snapshot.docs.every(
          (item) => item.data().userId === customerClient.uid,
        ),
      ).toBe(true)
    })

    it('rechaza el listado global para Customer', async () => {
      await expect(
        getDocs(collection(customerClient.db, 'orders')),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('rechaza la lectura anónima', async () => {
      const id = await seedOrder(customerClient.uid)

      await expect(
        getDoc(doc(publicDb, 'orders', id)),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('permite a Admin actualizar únicamente status', async () => {
      const id = await seedOrder(customerClient.uid)

      await updateDoc(
        doc(adminClient.db, 'orders', id),
        { status: 'processing' },
      )

      const snapshot = await getDoc(
        doc(adminClient.db, 'orders', id),
      )

      expect(snapshot.data()?.status).toBe('processing')
      expect(snapshot.data()?.totalCents).toBe(2500)
      expect(snapshot.data()?.userId).toBe(customerClient.uid)
    })

    it('rechaza que Customer modifique el estado', async () => {
      const id = await seedOrder(customerClient.uid)

      await expect(
        updateDoc(
          doc(customerClient.db, 'orders', id),
          { status: 'processing' },
        ),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('rechaza estados no admitidos para Admin', async () => {
      const id = await seedOrder(customerClient.uid)

      await expect(
        updateDoc(
          doc(adminClient.db, 'orders', id),
          { status: 'refunded' },
        ),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('impide que Admin modifique importes', async () => {
      const id = await seedOrder(customerClient.uid)

      await expect(
        updateDoc(
          doc(adminClient.db, 'orders', id),
          {
            status: 'completed',
            totalCents: 100,
          },
        ),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('impide que Admin modifique el propietario', async () => {
      const id = await seedOrder(customerClient.uid)

      await expect(
        updateDoc(
          doc(adminClient.db, 'orders', id),
          {
            status: 'completed',
            userId: otherCustomer.uid,
          },
        ),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('impide crear órdenes directamente como Admin', async () => {
      const id = `orders-test-${randomUUID()}`
      orderIds.push(id)

      await expect(
        setDoc(doc(adminClient.db, 'orders', id), {
          userId: customerClient.uid,
          status: 'pending',
          currency: 'PEN',
          items: [],
          totalCents: 2500,
          createdAt: new Date(),
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('impide crear órdenes directamente como Customer', async () => {
      const id = `orders-test-${randomUUID()}`
      orderIds.push(id)

      await expect(
        setDoc(doc(customerClient.db, 'orders', id), {
          userId: customerClient.uid,
          status: 'pending',
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('impide eliminar órdenes como Admin', async () => {
      const id = await seedOrder(customerClient.uid)

      await expect(
        deleteDoc(doc(adminClient.db, 'orders', id)),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })

    it('impide eliminar órdenes como Customer', async () => {
      const id = await seedOrder(customerClient.uid)

      await expect(
        deleteDoc(doc(customerClient.db, 'orders', id)),
      ).rejects.toMatchObject({
        code: 'permission-denied',
      })
    })
  },
)

import { randomUUID, createHash } from 'node:crypto'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  deleteApp,
  initializeApp,
  type App,
} from 'firebase-admin/app'
import {
  getFirestore,
  type DocumentReference,
  type Firestore,
} from 'firebase-admin/firestore'
import {
  CheckoutServiceError,
  createCheckoutOrder,
} from './checkoutService.js'

const DEMO_PROJECT_ID = 'demo-papelcorpsac'
const FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
const RUN_INTEGRATION =
  process.env.PAPELCORPSAC_RUN_FIRESTORE_INTEGRATION === 'true'

let app: App | undefined
let db: Firestore

const documentsToClean: DocumentReference[] = []

function assertSafeEnvironment(): void {
  if (
    process.env.FIRESTORE_EMULATOR_HOST !== FIRESTORE_EMULATOR_HOST ||
    process.env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Integration tests require the local Firestore Emulator.',
    )
  }

  for (const name of [
    'FIREBASE_PROJECT_ID',
    'GCLOUD_PROJECT',
    'GOOGLE_CLOUD_PROJECT',
  ]) {
    const value = process.env[name]

    if (value !== undefined && value !== DEMO_PROJECT_ID) {
      throw new Error(
        'Integration tests require demo-papelcorpsac.',
      )
    }
  }
}

function newCustomerId(): string {
  return `integration-user-${randomUUID()}`
}

function orderReference(
  userId: string,
  idempotencyKey: string,
): DocumentReference {
  const orderId = createHash('sha256')
    .update(`${userId}\0${idempotencyKey}`)
    .digest('hex')

  const reference = db.collection('orders').doc(orderId)
  documentsToClean.push(reference)

  return reference
}

async function createProduct(
  overrides: Record<string, unknown> = {},
): Promise<DocumentReference> {
  const reference = db
    .collection('products')
    .doc(`integration-${randomUUID()}`)

  documentsToClean.push(reference)

  await reference.set({
    name: 'Cuaderno de prueba',
    published: true,
    price: 12.5,
    stock: 5,
    ...overrides,
  })

  return reference
}

function checkoutRequest(
  productId: string,
  quantity: number,
  idempotencyKey = randomUUID(),
) {
  return {
    idempotencyKey,
    items: [{ productId, quantity }],
  }
}

describe.skipIf(!RUN_INTEGRATION)(
  'createCheckoutOrder con Firestore Emulator',
  () => {
    beforeAll(async () => {
      assertSafeEnvironment()

      app = initializeApp(
        { projectId: DEMO_PROJECT_ID },
        `papelcorpsac-integration-${randomUUID()}`,
      )

      db = getFirestore(app)
    })

    afterEach(async () => {
      for (const reference of documentsToClean.reverse()) {
        await reference.delete()
      }

      documentsToClean.length = 0
    })

    afterAll(async () => {
      if (app) {
        await deleteApp(app)
      }
    })

    it('crea una orden pending y descuenta stock', async () => {
      const product = await createProduct()
      const userId = newCustomerId()
      const request = checkoutRequest(product.id, 2)
      const order = orderReference(
        userId,
        request.idempotencyKey,
      )

      const result = await createCheckoutOrder(
        db,
        userId,
        request,
      )

      const productSnapshot = await product.get()
      const orderSnapshot = await order.get()

      expect(result).toMatchObject({
        success: true,
        replayed: false,
        order: {
          id: order.id,
          status: 'pending',
          currency: 'PEN',
          totalCents: 2500,
        },
      })

      expect(productSnapshot.data()?.stock).toBe(3)
      expect(orderSnapshot.exists).toBe(true)
      expect(orderSnapshot.data()).toMatchObject({
        userId,
        status: 'pending',
        currency: 'PEN',
        totalCents: 2500,
        items: [
          {
            productId: product.id,
            quantity: 2,
            unitPriceCents: 1250,
            subtotalCents: 2500,
          },
        ],
      })
      expect(orderSnapshot.data()?.createdAt).toBeDefined()
    })

    it('no crea una orden si el stock es insuficiente', async () => {
      const product = await createProduct({ stock: 1 })
      const userId = newCustomerId()
      const request = checkoutRequest(product.id, 2)
      const order = orderReference(
        userId,
        request.idempotencyKey,
      )

      await expect(
        createCheckoutOrder(db, userId, request),
      ).rejects.toMatchObject({
        kind: 'insufficient_stock',
      })

      expect((await product.get()).data()?.stock).toBe(1)
      expect((await order.get()).exists).toBe(false)
    })

    it('reutiliza una orden sin descontar stock dos veces', async () => {
      const product = await createProduct()
      const userId = newCustomerId()
      const request = checkoutRequest(product.id, 2)
      const order = orderReference(
        userId,
        request.idempotencyKey,
      )

      const first = await createCheckoutOrder(
        db,
        userId,
        request,
      )

      const second = await createCheckoutOrder(
        db,
        userId,
        request,
      )

      expect(first.replayed).toBe(false)
      expect(second.replayed).toBe(true)
      expect(second.order.id).toBe(first.order.id)
      expect((await product.get()).data()?.stock).toBe(3)
      expect((await order.get()).exists).toBe(true)
    })

    it('rechaza reutilizar una clave con otra cantidad', async () => {
      const product = await createProduct()
      const userId = newCustomerId()
      const idempotencyKey = randomUUID()
      const order = orderReference(userId, idempotencyKey)

      await createCheckoutOrder(
        db,
        userId,
        checkoutRequest(product.id, 1, idempotencyKey),
      )

      await expect(
        createCheckoutOrder(
          db,
          userId,
          checkoutRequest(product.id, 2, idempotencyKey),
        ),
      ).rejects.toMatchObject({
        kind: 'conflict',
      })

      expect((await product.get()).data()?.stock).toBe(4)
      expect((await order.get()).data()?.totalCents).toBe(1250)
    })

    it('rechaza productos no publicados sin modificar datos', async () => {
      const product = await createProduct({
        published: false,
      })

      const userId = newCustomerId()
      const request = checkoutRequest(product.id, 1)
      const order = orderReference(
        userId,
        request.idempotencyKey,
      )

      await expect(
        createCheckoutOrder(db, userId, request),
      ).rejects.toMatchObject({
        kind: 'product_unavailable',
      })

      expect((await product.get()).data()?.stock).toBe(5)
      expect((await order.get()).exists).toBe(false)
    })

    it('rechaza un producto sin stock válido', async () => {
      const product = await createProduct({
        stock: null,
      })

      const userId = newCustomerId()
      const request = checkoutRequest(product.id, 1)
      const order = orderReference(
        userId,
        request.idempotencyKey,
      )

      await expect(
        createCheckoutOrder(db, userId, request),
      ).rejects.toMatchObject({
        kind: 'product_unavailable',
      })

      expect((await order.get()).exists).toBe(false)
    })

    it('no realiza escrituras parciales cuando falla un producto', async () => {
      const availableProduct = await createProduct({
        stock: 5,
      })

      const unavailableProduct = await createProduct({
        stock: 0,
      })

      const userId = newCustomerId()
      const idempotencyKey = randomUUID()
      const order = orderReference(userId, idempotencyKey)

      await expect(
        createCheckoutOrder(db, userId, {
          idempotencyKey,
          items: [
            {
              productId: availableProduct.id,
              quantity: 2,
            },
            {
              productId: unavailableProduct.id,
              quantity: 1,
            },
          ],
        }),
      ).rejects.toMatchObject({
        kind: 'insufficient_stock',
      })

      expect(
        (await availableProduct.get()).data()?.stock,
      ).toBe(5)

      expect(
        (await unavailableProduct.get()).data()?.stock,
      ).toBe(0)

      expect((await order.get()).exists).toBe(false)
    })

    it(
      'evita vender dos veces la última unidad disponible',
      async () => {
        const product = await createProduct({
          stock: 1,
        })

        const userId = newCustomerId()

        const firstRequest = checkoutRequest(product.id, 1)
        const secondRequest = checkoutRequest(product.id, 1)

        const firstOrder = orderReference(
          userId,
          firstRequest.idempotencyKey,
        )

        const secondOrder = orderReference(
          userId,
          secondRequest.idempotencyKey,
        )

        const outcomes = await Promise.allSettled([
          createCheckoutOrder(db, userId, firstRequest),
          createCheckoutOrder(db, userId, secondRequest),
        ])

        const successful = outcomes.filter(
          (result) => result.status === 'fulfilled',
        )

        const rejected = outcomes.filter(
          (result) => result.status === 'rejected',
        )

        expect(successful).toHaveLength(1)
        expect(rejected).toHaveLength(1)

        if (rejected[0].status === 'rejected') {
          expect(rejected[0].reason).toBeInstanceOf(
            CheckoutServiceError,
          )

          expect(rejected[0].reason).toMatchObject({
            kind: 'insufficient_stock',
          })
        }

        expect((await product.get()).data()?.stock).toBe(0)

        const orderSnapshots = await Promise.all([
          firstOrder.get(),
          secondOrder.get(),
        ])

        expect(
          orderSnapshots.filter((snapshot) => snapshot.exists),
        ).toHaveLength(1)
      },
      60_000,
    )
  },
)

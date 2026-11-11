import { describe, expect, it, vi } from "vitest";
import type { Firestore } from "firebase-admin/firestore";
import {
  CheckoutServiceError,
  createCheckoutOrder,
} from "./checkoutService.js";

const validKey = "c1b8d7e3-96f2-4a51-a82b-3278a0c99421";
const secondKey = "b6f5f063-275f-467b-9673-a1a6cbb91ef8";

type DocumentReferenceFake = {
  id: string;
  path: string;
};

type DocumentDataFake = Record<string, unknown>;

type TransactionFake = {
  get: (reference: DocumentReferenceFake) => Promise<{
    exists: boolean;
    data: () => DocumentDataFake | undefined;
  }>;
  create: (reference: DocumentReferenceFake, data: DocumentDataFake) => void;
  update: (reference: DocumentReferenceFake, data: DocumentDataFake) => void;
};

function createFakeFirestore() {
  const documents = new Map<string, DocumentDataFake>();
  let previousTransaction: Promise<unknown> = Promise.resolve();

  const runTransaction = vi.fn(
    (callback: (transaction: TransactionFake) => Promise<unknown>) => {
      const operation = previousTransaction.then(async () => {
        const pendingWrites: Array<() => void> = [];

        const transaction: TransactionFake = {
          get: async (reference) => ({
            exists: documents.has(reference.path),
            data: () => documents.get(reference.path),
          }),

          create: (reference, data) => {
            pendingWrites.push(() => {
              if (documents.has(reference.path)) {
                throw new Error("Document already exists");
              }

              documents.set(reference.path, data);
            });
          },

          update: (reference, data) => {
            pendingWrites.push(() => {
              const existing = documents.get(reference.path);

              if (!existing) {
                throw new Error("Document does not exist");
              }

              documents.set(reference.path, {
                ...existing,
                ...data,
              });
            });
          },
        };

        const result = await callback(transaction);

        for (const write of pendingWrites) {
          write();
        }

        return result;
      });

      previousTransaction = operation.then(
        () => undefined,
        () => undefined,
      );

      return operation;
    },
  );

  const db = {
    collection: (collectionName: string) => ({
      doc: (id: string): DocumentReferenceFake => ({
        id,
        path: `${collectionName}/${id}`,
      }),
    }),
    runTransaction,
  } as unknown as Firestore;

  function addProduct(id: string, overrides: DocumentDataFake = {}): void {
    documents.set(`products/${id}`, {
      name: "Cuaderno premium",
      published: true,
      price: 12.5,
      stock: 5,
      ...overrides,
    });
  }

  function getProduct(id: string): DocumentDataFake | undefined {
    return documents.get(`products/${id}`);
  }

  function getOrders(): DocumentDataFake[] {
    return [...documents.entries()]
      .filter(([path]) => path.startsWith("orders/"))
      .map(([, data]) => data);
  }

  return {
    db,
    addProduct,
    getProduct,
    getOrders,
    runTransaction,
  };
}

function validRequest() {
  return {
    idempotencyKey: validKey,
    items: [{ productId: "producto-001", quantity: 2 }],
  };
}

describe("createCheckoutOrder", () => {
  it("crea una orden pending y descuenta stock", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    const result = await createCheckoutOrder(
      store.db,
      "customer-1",
      validRequest(),
    );

    expect(result).toEqual({
      success: true,
      order: {
        id: expect.any(String),
        status: "pending",
        currency: "PEN",
        totalCents: 2500,
      },
      replayed: false,
    });

    expect(store.getProduct("producto-001")?.stock).toBe(3);
    expect(store.getOrders()).toHaveLength(1);
    expect(store.getOrders()[0]).toMatchObject({
      userId: "customer-1",
      status: "pending",
      currency: "PEN",
      totalCents: 2500,
      idempotencyKey: validKey,
      requestFingerprint: expect.any(String),
      items: [
        {
          productId: "producto-001",
          name: "Cuaderno premium",
          quantity: 2,
          unitPriceCents: 1250,
          subtotalCents: 2500,
        },
      ],
    });
    expect(store.getOrders()[0].createdAt).toBeDefined();
  });

  it("calcula varios productos usando precios de Firestore", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { price: 12.5 });
    store.addProduct("producto-002", {
      name: "Lapicero",
      price: 3.75,
      stock: 10,
    });

    const result = await createCheckoutOrder(store.db, "customer-1", {
      idempotencyKey: validKey,
      items: [
        { productId: "producto-001", quantity: 2 },
        { productId: "producto-002", quantity: 3 },
      ],
    });

    expect(result.order.totalCents).toBe(3625);
    expect(store.getProduct("producto-001")?.stock).toBe(3);
    expect(store.getProduct("producto-002")?.stock).toBe(7);
    expect(store.getOrders()[0].items).toHaveLength(2);
  });

  it("acepta comprar la última unidad disponible", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { stock: 2 });

    await createCheckoutOrder(store.db, "customer-1", validRequest());

    expect(store.getProduct("producto-001")?.stock).toBe(0);
    expect(store.getOrders()).toHaveLength(1);
  });

  it("no acepta precios enviados por el cliente", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    await expect(
      createCheckoutOrder(store.db, "customer-1", {
        ...validRequest(),
        totalCents: 1,
      }),
    ).rejects.toMatchObject({
      kind: "invalid_request",
    });

    expect(store.runTransaction).not.toHaveBeenCalled();
    expect(store.getProduct("producto-001")?.stock).toBe(5);
  });

  it("rechaza un UID vacío", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    await expect(
      createCheckoutOrder(store.db, "", validRequest()),
    ).rejects.toMatchObject({
      kind: "invalid_request",
    });

    expect(store.runTransaction).not.toHaveBeenCalled();
  });

  it("rechaza una solicitud inválida antes de consultar Firestore", async () => {
    const store = createFakeFirestore();

    await expect(
      createCheckoutOrder(store.db, "customer-1", {
        idempotencyKey: validKey,
        items: [],
      }),
    ).rejects.toMatchObject({
      kind: "invalid_request",
    });

    expect(store.runTransaction).not.toHaveBeenCalled();
  });

  it("rechaza productos inexistentes sin crear órdenes", async () => {
    const store = createFakeFirestore();

    await expect(
      createCheckoutOrder(store.db, "customer-1", validRequest()),
    ).rejects.toMatchObject({
      kind: "product_unavailable",
    });

    expect(store.getOrders()).toHaveLength(0);
  });

  it("rechaza productos no publicados", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { published: false });

    await expect(
      createCheckoutOrder(store.db, "customer-1", validRequest()),
    ).rejects.toMatchObject({
      kind: "product_unavailable",
    });

    expect(store.getProduct("producto-001")?.stock).toBe(5);
    expect(store.getOrders()).toHaveLength(0);
  });

  it.each([
    ["ausente", undefined],
    ["negativo", -1],
    ["decimal", 2.5],
    ["texto", "5"],
    ["NaN", Number.NaN],
  ])("rechaza stock %s", async (_description, stock) => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { stock });

    await expect(
      createCheckoutOrder(store.db, "customer-1", validRequest()),
    ).rejects.toMatchObject({
      kind: "product_unavailable",
    });

    expect(store.getOrders()).toHaveLength(0);
  });

  it("rechaza stock insuficiente", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { stock: 1 });

    await expect(
      createCheckoutOrder(store.db, "customer-1", validRequest()),
    ).rejects.toMatchObject({
      kind: "insufficient_stock",
    });

    expect(store.getProduct("producto-001")?.stock).toBe(1);
    expect(store.getOrders()).toHaveLength(0);
  });

  it.each([
    ["ausente", undefined],
    ["cero", 0],
    ["negativo", -1],
    ["decimal con tres cifras", 1.001],
    ["texto", "12.50"],
    ["NaN", Number.NaN],
    ["infinito", Number.POSITIVE_INFINITY],
    ["importe excesivo", Number.MAX_SAFE_INTEGER],
  ])("rechaza precio %s", async (_description, price) => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { price });

    await expect(
      createCheckoutOrder(store.db, "customer-1", validRequest()),
    ).rejects.toMatchObject({
      kind: "product_unavailable",
    });

    expect(store.getProduct("producto-001")?.stock).toBe(5);
    expect(store.getOrders()).toHaveLength(0);
  });

  it("rechaza nombres de producto inválidos", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { name: "  " });

    await expect(
      createCheckoutOrder(store.db, "customer-1", validRequest()),
    ).rejects.toMatchObject({
      kind: "product_unavailable",
    });

    expect(store.getOrders()).toHaveLength(0);
  });

  it("no aplica escrituras parciales si falla otro producto", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { stock: 5 });
    store.addProduct("producto-002", { stock: 1 });

    await expect(
      createCheckoutOrder(store.db, "customer-1", {
        idempotencyKey: validKey,
        items: [
          { productId: "producto-001", quantity: 2 },
          { productId: "producto-002", quantity: 2 },
        ],
      }),
    ).rejects.toMatchObject({
      kind: "insufficient_stock",
    });

    expect(store.getProduct("producto-001")?.stock).toBe(5);
    expect(store.getProduct("producto-002")?.stock).toBe(1);
    expect(store.getOrders()).toHaveLength(0);
  });

  it("devuelve la misma orden al repetir la misma solicitud", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    const first = await createCheckoutOrder(
      store.db,
      "customer-1",
      validRequest(),
    );
    const second = await createCheckoutOrder(
      store.db,
      "customer-1",
      validRequest(),
    );

    expect(first.replayed).toBe(false);
    expect(second.replayed).toBe(true);
    expect(second.order).toEqual(first.order);
    expect(store.getProduct("producto-001")?.stock).toBe(3);
    expect(store.getOrders()).toHaveLength(1);
  });

  it("reconoce reintentos aunque cambie el orden de los items", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");
    store.addProduct("producto-002");

    const first = await createCheckoutOrder(store.db, "customer-1", {
      idempotencyKey: validKey,
      items: [
        { productId: "producto-001", quantity: 1 },
        { productId: "producto-002", quantity: 2 },
      ],
    });

    const second = await createCheckoutOrder(store.db, "customer-1", {
      idempotencyKey: validKey,
      items: [
        { productId: "producto-002", quantity: 2 },
        { productId: "producto-001", quantity: 1 },
      ],
    });

    expect(second.replayed).toBe(true);
    expect(second.order.id).toBe(first.order.id);
    expect(store.getOrders()).toHaveLength(1);
    expect(store.getProduct("producto-001")?.stock).toBe(4);
    expect(store.getProduct("producto-002")?.stock).toBe(3);
  });

  it("rechaza reutilizar una clave con otras cantidades", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    await createCheckoutOrder(store.db, "customer-1", validRequest());

    await expect(
      createCheckoutOrder(store.db, "customer-1", {
        idempotencyKey: validKey,
        items: [{ productId: "producto-001", quantity: 3 }],
      }),
    ).rejects.toMatchObject({
      kind: "conflict",
    });

    expect(store.getProduct("producto-001")?.stock).toBe(3);
    expect(store.getOrders()).toHaveLength(1);
  });

  it("diferencia claves de compra distintas del mismo usuario", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    const first = await createCheckoutOrder(
      store.db,
      "customer-1",
      validRequest(),
    );

    const second = await createCheckoutOrder(store.db, "customer-1", {
      ...validRequest(),
      idempotencyKey: secondKey,
    });

    expect(second.order.id).not.toBe(first.order.id);
    expect(second.replayed).toBe(false);
    expect(store.getOrders()).toHaveLength(2);
    expect(store.getProduct("producto-001")?.stock).toBe(1);
  });

  it("diferencia compras de usuarios distintos", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    const first = await createCheckoutOrder(
      store.db,
      "customer-1",
      validRequest(),
    );
    const second = await createCheckoutOrder(
      store.db,
      "customer-2",
      validRequest(),
    );

    expect(first.order.id).not.toBe(second.order.id);
    expect(store.getOrders()).toHaveLength(2);
    expect(
      store
        .getOrders()
        .map((order) => order.userId)
        .sort(),
    ).toEqual(["customer-1", "customer-2"]);
    expect(store.getProduct("producto-001")?.stock).toBe(1);
  });

  it("no duplica una compra enviada simultáneamente", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    const [first, second] = await Promise.all([
      createCheckoutOrder(store.db, "customer-1", validRequest()),
      createCheckoutOrder(store.db, "customer-1", validRequest()),
    ]);

    expect(first.order.id).toBe(second.order.id);
    expect([first.replayed, second.replayed].sort()).toEqual([false, true]);
    expect(store.getOrders()).toHaveLength(1);
    expect(store.getProduct("producto-001")?.stock).toBe(3);
  });

  it("rechaza compras concurrentes que exceden el stock", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001", { stock: 2 });

    const results = await Promise.allSettled([
      createCheckoutOrder(store.db, "customer-1", validRequest()),
      createCheckoutOrder(store.db, "customer-2", validRequest()),
    ]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
    expect(store.getOrders()).toHaveLength(1);
    expect(store.getProduct("producto-001")?.stock).toBe(0);
  });

  it("convierte errores inesperados de Firestore en unavailable", async () => {
    const store = createFakeFirestore();
    store.addProduct("producto-001");

    store.runTransaction.mockRejectedValueOnce(
      new Error("Detalle interno de conexión"),
    );

    await expect(
      createCheckoutOrder(store.db, "customer-1", validRequest()),
    ).rejects.toMatchObject({
      name: "CheckoutServiceError",
      kind: "unavailable",
      message: "unavailable",
    });

    expect(store.getOrders()).toHaveLength(0);
    expect(store.getProduct("producto-001")?.stock).toBe(5);
  });

  it("utiliza errores tipados para los rechazos comerciales", () => {
    const error = new CheckoutServiceError("insufficient_stock");

    expect(error).toBeInstanceOf(Error);
    expect(error.kind).toBe("insufficient_stock");
    expect(error.message).toBe("insufficient_stock");
  });
});

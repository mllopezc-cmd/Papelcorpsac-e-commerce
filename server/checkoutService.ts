import { createHash } from "node:crypto";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { CheckoutSuccessResponse } from "../src/types/checkout.js";
import { parseCheckoutRequest } from "./checkoutValidation.js";

export type CheckoutServiceErrorKind =
  | "invalid_request"
  | "product_unavailable"
  | "insufficient_stock"
  | "conflict"
  | "unavailable";

export class CheckoutServiceError extends Error {
  constructor(readonly kind: CheckoutServiceErrorKind) {
    super(kind);
    this.name = "CheckoutServiceError";
  }
}

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
};

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isValidPrice(value: unknown): value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return false;
  }

  const cents = value * 100;

  return (
    Number.isFinite(cents) &&
    Number.isSafeInteger(Math.round(cents)) &&
    Math.abs(cents - Math.round(cents)) <= 1e-8
  );
}

function isValidStock(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export async function createCheckoutOrder(
  db: Firestore,
  uid: string,
  input: unknown,
): Promise<CheckoutSuccessResponse> {
  if (typeof uid !== "string" || uid.length === 0 || uid.trim() !== uid) {
    throw new CheckoutServiceError("invalid_request");
  }

  const request = parseCheckoutRequest(input);

  if (!request) {
    throw new CheckoutServiceError("invalid_request");
  }

  const normalizedItems = [...request.items].sort((a, b) =>
    a.productId < b.productId ? -1 : a.productId > b.productId ? 1 : 0,
  );

  const requestFingerprint = hashValue(JSON.stringify(normalizedItems));
  const orderId = hashValue(`${uid}\0${request.idempotencyKey}`);
  const orderRef = db.collection("orders").doc(orderId);

  try {
    return await db.runTransaction(async (transaction) => {
      const existingOrder = await transaction.get(orderRef);

      if (existingOrder.exists) {
        const savedOrder = existingOrder.data();

        if (
          savedOrder?.userId !== uid ||
          savedOrder.requestFingerprint !== requestFingerprint ||
          savedOrder.currency !== "PEN" ||
          !Number.isSafeInteger(savedOrder.totalCents) ||
          savedOrder.totalCents <= 0
        ) {
          throw new CheckoutServiceError("conflict");
        }

        return {
          success: true,
          order: {
            id: orderId,
            status: "pending",
            currency: "PEN",
            totalCents: savedOrder.totalCents,
          },
          replayed: true,
        };
      }

      const productReferences = request.items.map((item) =>
        db.collection("products").doc(item.productId),
      );

      const productSnapshots = [];

      for (const productRef of productReferences) {
        productSnapshots.push(await transaction.get(productRef));
      }

      const orderItems: OrderItem[] = [];
      const stockUpdates: {
        reference: (typeof productReferences)[number];
        stock: number;
      }[] = [];

      let totalCents = 0;

      for (let index = 0; index < request.items.length; index++) {
        const requestedItem = request.items[index];
        const snapshot = productSnapshots[index];

        if (!snapshot.exists) {
          throw new CheckoutServiceError("product_unavailable");
        }

        const product = snapshot.data();

        if (
          product?.published !== true ||
          typeof product.name !== "string" ||
          product.name.trim().length === 0 ||
          !isValidPrice(product.price) ||
          !isValidStock(product.stock)
        ) {
          throw new CheckoutServiceError("product_unavailable");
        }

        if (product.stock < requestedItem.quantity) {
          throw new CheckoutServiceError("insufficient_stock");
        }

        const unitPriceCents = Math.round(product.price * 100);
        const subtotalCents = unitPriceCents * requestedItem.quantity;

        if (
          !Number.isSafeInteger(subtotalCents) ||
          subtotalCents <= 0 ||
          !Number.isSafeInteger(totalCents + subtotalCents)
        ) {
          throw new CheckoutServiceError("product_unavailable");
        }

        totalCents += subtotalCents;

        orderItems.push({
          productId: requestedItem.productId,
          name: product.name,
          quantity: requestedItem.quantity,
          unitPriceCents,
          subtotalCents,
        });

        stockUpdates.push({
          reference: productReferences[index],
          stock: product.stock - requestedItem.quantity,
        });
      }

      transaction.create(orderRef, {
        userId: uid,
        status: "pending",
        currency: "PEN",
        items: orderItems,
        totalCents,
        idempotencyKey: request.idempotencyKey,
        requestFingerprint,
        createdAt: FieldValue.serverTimestamp(),
      });

      for (const update of stockUpdates) {
        transaction.update(update.reference, {
          stock: update.stock,
        });
      }

      return {
        success: true,
        order: {
          id: orderId,
          status: "pending",
          currency: "PEN",
          totalCents,
        },
        replayed: false,
      };
    });
  } catch (error: unknown) {
    if (error instanceof CheckoutServiceError) {
      throw error;
    }

    throw new CheckoutServiceError("unavailable");
  }
}

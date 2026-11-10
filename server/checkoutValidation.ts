import type { CheckoutRequest } from "../src/types/checkout.js";

export const MAX_CHECKOUT_ITEMS = 50;
export const MAX_CHECKOUT_QUANTITY = 99;
export const MAX_PRODUCT_ID_LENGTH = 128;

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function isValidProductId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_PRODUCT_ID_LENGTH &&
    value.trim() === value &&
    !value.includes("/") &&
    !hasControlCharacters(value)
  );
}

function isValidQuantity(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= MAX_CHECKOUT_QUANTITY
  );
}

export function parseCheckoutRequest(value: unknown): CheckoutRequest | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["idempotencyKey", "items"])) {
    return null;
  }

  const { idempotencyKey, items } = value;

  if (
    typeof idempotencyKey !== "string" ||
    !UUID_V4_PATTERN.test(idempotencyKey) ||
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > MAX_CHECKOUT_ITEMS
  ) {
    return null;
  }

  const validatedItems: CheckoutRequest["items"] = [];
  const productIds = new Set<string>();

  for (const item of items) {
    if (
      !isRecord(item) ||
      !hasOnlyKeys(item, ["productId", "quantity"]) ||
      !isValidProductId(item.productId) ||
      !isValidQuantity(item.quantity) ||
      productIds.has(item.productId)
    ) {
      return null;
    }

    productIds.add(item.productId);
    validatedItems.push({
      productId: item.productId,
      quantity: item.quantity,
    });
  }

  return {
    idempotencyKey: idempotencyKey.toLowerCase(),
    items: validatedItems,
  };
}

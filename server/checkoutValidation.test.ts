import { describe, expect, it } from "vitest";
import {
  MAX_CHECKOUT_ITEMS,
  MAX_CHECKOUT_QUANTITY,
  MAX_PRODUCT_ID_LENGTH,
  parseCheckoutRequest,
} from "./checkoutValidation.js";

const validKey = "c1b8d7e3-96f2-4a51-a82b-3278a0c99421";

function validRequest() {
  return {
    idempotencyKey: validKey,
    items: [{ productId: "producto-001", quantity: 2 }],
  };
}

describe("parseCheckoutRequest", () => {
  it("acepta una compra válida", () => {
    expect(parseCheckoutRequest(validRequest())).toEqual(validRequest());
  });

  it("acepta varios productos diferentes", () => {
    const request = {
      idempotencyKey: validKey,
      items: [
        { productId: "lapiz-1", quantity: 2 },
        { productId: "cuaderno-1", quantity: 3 },
      ],
    };

    expect(parseCheckoutRequest(request)).toEqual(request);
  });

  it("normaliza la clave de idempotencia a minúsculas", () => {
    const request = {
      ...validRequest(),
      idempotencyKey: validKey.toUpperCase(),
    };

    expect(parseCheckoutRequest(request)).toEqual(validRequest());
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["cadena", "checkout"],
    ["número", 123],
    ["arreglo", []],
    ["booleano", true],
  ])("rechaza un cuerpo %s", (_description, value) => {
    expect(parseCheckoutRequest(value)).toBeNull();
  });

  it("rechaza solicitudes sin clave de idempotencia", () => {
    expect(
      parseCheckoutRequest({
        items: validRequest().items,
      }),
    ).toBeNull();
  });

  it.each([
    "",
    "clave-simple",
    "12345678-1234-1234-1234-123456789012",
    "c1b8d7e3-96f2-4a51-782b-3278a0c99421",
    "c1b8d7e3-96f2-4a51-082b-3278a0c99421",
    " c1b8d7e3-96f2-4a51-a82b-3278a0c99421",
  ])("rechaza la clave de idempotencia inválida %s", (key) => {
    expect(
      parseCheckoutRequest({
        ...validRequest(),
        idempotencyKey: key,
      }),
    ).toBeNull();
  });

  it("rechaza una clave de idempotencia que no sea texto", () => {
    expect(
      parseCheckoutRequest({
        ...validRequest(),
        idempotencyKey: 123,
      }),
    ).toBeNull();
  });

  it.each([
    ["ausente", undefined],
    ["null", null],
    ["cadena", "producto-001"],
    ["objeto", {}],
    ["vacío", []],
  ])("rechaza items %s", (_description, items) => {
    expect(
      parseCheckoutRequest({
        idempotencyKey: validKey,
        items,
      }),
    ).toBeNull();
  });

  it("rechaza más productos que el límite establecido", () => {
    const items = Array.from(
      { length: MAX_CHECKOUT_ITEMS + 1 },
      (_, index) => ({
        productId: `producto-${index}`,
        quantity: 1,
      }),
    );

    expect(
      parseCheckoutRequest({ idempotencyKey: validKey, items }),
    ).toBeNull();
  });

  it("acepta exactamente el máximo de productos permitidos", () => {
    const items = Array.from({ length: MAX_CHECKOUT_ITEMS }, (_, index) => ({
      productId: `producto-${index}`,
      quantity: 1,
    }));

    expect(parseCheckoutRequest({ idempotencyKey: validKey, items })).toEqual({
      idempotencyKey: validKey,
      items,
    });
  });

  it("rechaza identificadores duplicados", () => {
    const request = {
      idempotencyKey: validKey,
      items: [
        { productId: "producto-001", quantity: 1 },
        { productId: "producto-001", quantity: 2 },
      ],
    };

    expect(parseCheckoutRequest(request)).toBeNull();
  });

  it.each([
    "",
    " ",
    " producto-001",
    "producto-001 ",
    "producto/001",
    "producto\n001",
    "producto\u007f001",
    "x".repeat(MAX_PRODUCT_ID_LENGTH + 1),
  ])("rechaza el identificador inválido %s", (productId) => {
    expect(
      parseCheckoutRequest({
        idempotencyKey: validKey,
        items: [{ productId, quantity: 1 }],
      }),
    ).toBeNull();
  });

  it("acepta un identificador con la longitud máxima permitida", () => {
    const request = {
      idempotencyKey: validKey,
      items: [
        {
          productId: "x".repeat(MAX_PRODUCT_ID_LENGTH),
          quantity: 1,
        },
      ],
    };

    expect(parseCheckoutRequest(request)).toEqual(request);
  });

  it("rechaza identificadores que no sean texto", () => {
    expect(
      parseCheckoutRequest({
        idempotencyKey: validKey,
        items: [{ productId: 123, quantity: 1 }],
      }),
    ).toBeNull();
  });

  it.each([
    0,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
    MAX_CHECKOUT_QUANTITY + 1,
    "2",
    null,
    undefined,
  ])("rechaza la cantidad inválida %s", (quantity) => {
    expect(
      parseCheckoutRequest({
        idempotencyKey: validKey,
        items: [{ productId: "producto-001", quantity }],
      }),
    ).toBeNull();
  });

  it("acepta la cantidad máxima permitida", () => {
    const request = {
      idempotencyKey: validKey,
      items: [
        {
          productId: "producto-001",
          quantity: MAX_CHECKOUT_QUANTITY,
        },
      ],
    };

    expect(parseCheckoutRequest(request)).toEqual(request);
  });

  it("rechaza elementos del carrito que no sean objetos", () => {
    expect(
      parseCheckoutRequest({
        idempotencyKey: validKey,
        items: [null],
      }),
    ).toBeNull();

    expect(
      parseCheckoutRequest({
        idempotencyKey: validKey,
        items: ["producto-001"],
      }),
    ).toBeNull();
  });

  it("rechaza campos comerciales adicionales en la solicitud", () => {
    expect(
      parseCheckoutRequest({
        ...validRequest(),
        userId: "otro-usuario",
      }),
    ).toBeNull();

    expect(
      parseCheckoutRequest({
        ...validRequest(),
        totalCents: 1,
      }),
    ).toBeNull();
  });

  it("rechaza precios enviados dentro de los productos", () => {
    expect(
      parseCheckoutRequest({
        idempotencyKey: validKey,
        items: [
          {
            productId: "producto-001",
            quantity: 2,
            price: 0.01,
          },
        ],
      }),
    ).toBeNull();
  });

  it("rechaza campos adicionales dentro de los productos", () => {
    expect(
      parseCheckoutRequest({
        idempotencyKey: validKey,
        items: [
          {
            productId: "producto-001",
            quantity: 2,
            stock: 1000,
          },
        ],
      }),
    ).toBeNull();
  });

  it("no modifica la solicitud original", () => {
    const request = validRequest();
    const originalItems = request.items;
    const originalItem = request.items[0];

    const result = parseCheckoutRequest(request);

    expect(request).toEqual(validRequest());
    expect(request.items).toBe(originalItems);
    expect(request.items[0]).toBe(originalItem);
    expect(result).not.toBe(request);
    expect(result?.items).not.toBe(originalItems);
    expect(result?.items[0]).not.toBe(originalItem);
  });
});

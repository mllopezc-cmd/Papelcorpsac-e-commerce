import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import {
  EXPECTED_PRODUCT_SEED_COUNT,
  EXPECTED_PRODUCT_SEED_STOCK,
  PRODUCT_SEED_EXPECTATIONS,
  productsSeed,
  type ProductSeed,
} from "../src/data/products.seed.ts";
import { PRODUCT_CATEGORIES } from "../src/types/product.ts";

type ValidationResult = {
  errors: string[];
  stockTotal: number;
};

const VERIFIED_PRODUCT_IMAGE_URLS: Readonly<Record<string, string>> = {
  "uniball-zento-x4":
    "https://www.verquiperu.com/cdn/shop/files/71zXzkGPEiL._AC_SL1500_1800x1800.jpg?v=1762991137",
  "sabonis-8051":
    "https://www.verquiperu.com/cdn/shop/files/BOLI054_720x.jpg?v=1751058368",
  "donga-my-metal-07x7":
    "https://www.verquiperu.com/cdn/shop/files/BOLI031_720x.jpg?v=1693497511",
  "iris-color-a4-negro-160h":
    "https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/c/u/cuaderno-anillado-iris-color-a4-cuadriculado-negro-tapa-dura-160-hojas-79691004-default-1.jpg",
  "agenda-2027-a5-cafe":
    "https://lapapelaria.pe/cdn/shop/files/PU601427.webp?v=1784672335&width=925",
  "notas-alpha-neon-2x2":
    "https://www.verquiperu.com/cdn/shop/files/POST012_540x.jpg?v=1725307768",
  "engrapadora-ove-25h":
    "https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/e/n/engrapador-25-hojas-con-sacagrapas-ove-23473-default-1.png",
  "perforador-vinifan-mh15":
    "https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/p/e/perforador-m-h15-negro-vinifan-29153002-default-1.jpg",
  "tijera-vinifan-oficina":
    "https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/t/i/tijera-7-pulgadas-para-oficina-10120-default-1.jpg",
  "soporte-roadtrip-abh070":
    "https://coolboxpe.vtexassets.com/arquivos/ids/329823/ABH-070_1.jpg?v=638362617412930000",
  "organizador-ove-8810":
    "https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/o/r/organizador-de-escritorio-ove-negro-tipo-rejilla-8810-default-1.jpg",
  "portalapices-ove-cuadrado":
    "https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/p/o/porta-lapiz-cuadrangular-ove-negro-tipo-rejilla-16579001-default-1.jpg",
};
const VERIFIED_PRODUCT_IMAGE_IDS: string[] = Object.keys(
  VERIFIED_PRODUCT_IMAGE_URLS,
);
const VERIFIED_PRODUCT_SOURCE_IDS: ReadonlySet<string> = new Set([
  "uniball-zento-x4",
  "sabonis-8051",
  "donga-my-metal-07x7",
  "iris-color-a4-negro-160h",
  "agenda-2027-a5-cafe",
  "notas-alpha-neon-2x2",
  "engrapadora-ove-25h",
  "perforador-vinifan-mh15",
  "tijera-vinifan-oficina",
  "soporte-roadtrip-abh070",
  "organizador-ove-8810",
  "portalapices-ove-cuadrado",
]);
const APPROVED_FIREBASE_PROJECT_ID = "papelcorpsac";
const SEED_WRITE_ENABLED = false;

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.length > 0 &&
      url.username.length === 0 &&
      url.password.length === 0
    );
  } catch {
    return false;
  }
}

function isValidPrice(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value > 0 &&
    Math.abs(value * 100 - Math.round(value * 100)) <= 1e-8
  );
}

function validateSeed(records: readonly ProductSeed[]): ValidationResult {
  const errors: string[] = [];
  const expectedById = new Map<
    string,
    (typeof PRODUCT_SEED_EXPECTATIONS)[number]
  >(PRODUCT_SEED_EXPECTATIONS.map((product) => [product.id, product]));
  const seenIds = new Set<string>();
  const stockTotal = records.reduce(
    (total, product) =>
      total + (Number.isInteger(product.stock) ? product.stock : 0),
    0,
  );

  if (records.length !== EXPECTED_PRODUCT_SEED_COUNT) {
    errors.push(
      `Se esperaban ${EXPECTED_PRODUCT_SEED_COUNT} productos y se encontraron ${records.length}.`,
    );
  }

  if (stockTotal !== EXPECTED_PRODUCT_SEED_STOCK) {
    errors.push(
      `El stock total debe ser ${EXPECTED_PRODUCT_SEED_STOCK}; se encontró ${stockTotal}.`,
    );
  }

  for (const [index, product] of records.entries()) {
    const label = product.id || `registro ${index + 1}`;
    const expected = expectedById.get(product.id);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)) {
      errors.push(`${label}: identificador inválido.`);
    }

    if (seenIds.has(product.id)) {
      errors.push(`${label}: identificador duplicado.`);
    }
    seenIds.add(product.id);

    if (!expected) {
      errors.push(`${label}: no pertenece a la lista aprobada de IDs.`);
    } else if (
      product.name !== expected.name ||
      product.brand !== expected.brand ||
      product.description !== expected.description ||
      product.category !== expected.category ||
      product.price !== expected.price ||
      product.stock !== expected.stock ||
      product.sourceUrl !== expected.sourceUrl
    ) {
      errors.push(
        `${label}: nombre, marca, descripción, categoría, precio, stock o URL difiere de la referencia aprobada.`,
      );
    }

    if (!PRODUCT_CATEGORIES.some((category) => category === product.category)) {
      errors.push(`${label}: categoría inválida.`);
    }
    if (!product.name.trim()) {
      errors.push(`${label}: falta el nombre aprobado.`);
    }
    if (!product.brand.trim()) {
      errors.push(`${label}: falta la marca aprobada.`);
    }
    if (!product.description.trim()) {
      errors.push(`${label}: falta la descripción aprobada.`);
    }
    if (!isValidPrice(product.price)) {
      errors.push(
        `${label}: precio inválido; debe ser positivo y tener hasta 2 decimales.`,
      );
    }
    if (!Number.isInteger(product.stock) || product.stock < 0) {
      errors.push(`${label}: stock inválido; debe ser un entero no negativo.`);
    }
    if (!isHttpsUrl(product.sourceUrl)) {
      errors.push(
        `${label}: falta una URL comercial HTTPS válida y verificada.`,
      );
    } else if (!VERIFIED_PRODUCT_SOURCE_IDS.has(product.id)) {
      errors.push(`${label}: la ficha comercial no está verificada.`);
    }
    if (!isHttpsUrl(product.imageUrl)) {
      errors.push(
        `${label}: falta una URL HTTPS directa de imagen verificada.`,
      );
    } else if (
      !VERIFIED_PRODUCT_IMAGE_IDS.includes(product.id) ||
      VERIFIED_PRODUCT_IMAGE_URLS[product.id] !== product.imageUrl
    ) {
      errors.push(
        `${label}: la procedencia directa de la imagen no está verificada.`,
      );
    }
    if (product.published !== false) {
      errors.push(
        `${label}: los productos del seed deben iniciar sin publicar.`,
      );
    }
  }

  for (const expected of PRODUCT_SEED_EXPECTATIONS) {
    if (!seenIds.has(expected.id)) {
      errors.push(`${expected.id}: falta un ID de la lista aprobada.`);
    }
  }

  return { errors, stockTotal };
}

function printPreview(result: ValidationResult): void {
  console.log("Vista previa local del seed de PAPEL CORP");
  console.log(
    `Registros: ${productsSeed.length}/${EXPECTED_PRODUCT_SEED_COUNT}`,
  );
  console.log(
    `Stock: ${result.stockTotal}/${EXPECTED_PRODUCT_SEED_STOCK} unidades demostrativas`,
  );
  console.log("No se inicializó Firebase ni se leyeron credenciales.");

  if (result.errors.length > 0) {
    console.error("Carga bloqueada por datos faltantes o inválidos:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
  } else {
    console.log(
      "Validación local correcta. La escritura aún requiere autorización posterior.",
    );
  }
}

async function writeProducts(targetProjectId: string): Promise<void> {
  const terminal = createInterface({ input: stdin, output: stdout });
  const confirmation = await terminal.question(
    `Escribe el ID del proyecto Firebase de destino (${targetProjectId}) para confirmar: `,
  );
  terminal.close();

  if (confirmation !== targetProjectId) {
    throw new Error(
      "Confirmación de proyecto incorrecta; no se escribió nada.",
    );
  }

  const { applicationDefault, initializeApp } =
    await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  const app = initializeApp(
    {
      credential: applicationDefault(),
      projectId: targetProjectId,
    },
    "papelcorpsac-product-seeder",
  );

  if (app.options.projectId !== targetProjectId) {
    throw new Error(
      "El proyecto Firebase inicializado no coincide con el destino.",
    );
  }

  const db = getFirestore(app);
  const references = productsSeed.map((product) =>
    db.collection("products").doc(product.id),
  );
  const existingDocuments = await db.getAll(...references);
  const existingIds = existingDocuments
    .filter((document) => document.exists)
    .map((document) => document.id);

  if (existingIds.length > 0) {
    throw new Error(
      `Conflicto: ya existen documentos con estos IDs: ${existingIds.join(", ")}. No se modificó ninguno.`,
    );
  }

  await db.runTransaction(async (transaction) => {
    const documents = await Promise.all(
      references.map((reference) => transaction.get(reference)),
    );
    const conflicts = documents
      .filter((document) => document.exists)
      .map((document) => document.id);

    if (conflicts.length > 0) {
      throw new Error(
        `Conflicto detectado durante la transacción: ${conflicts.join(", ")}.`,
      );
    }

    productsSeed.forEach((product, index) => {
      transaction.create(references[index], product);
    });
  });

  console.log(
    `Se crearon ${productsSeed.length} productos sin publicar en ${targetProjectId}.`,
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const writeMode = args.length === 1 && args[0] === "--write";

  if (args.length > 0 && !writeMode) {
    throw new Error(
      "Uso: seed-products.ts [--write]. Sin argumentos solo muestra vista previa.",
    );
  }

  const validation = validateSeed(productsSeed);
  printPreview(validation);

  if (validation.errors.length > 0) {
    process.exitCode = 1;
    if (writeMode) {
      console.error(
        "La escritura está bloqueada hasta completar y verificar los 12 registros.",
      );
    }
    return;
  }

  if (!writeMode) {
    return;
  }

  const targetProjectId = process.env.FIREBASE_SEED_PROJECT_ID;
  if (!targetProjectId) {
    throw new Error(
      "La escritura requiere FIREBASE_SEED_PROJECT_ID. No se intentó conectar a Firebase.",
    );
  }
  if (targetProjectId !== APPROVED_FIREBASE_PROJECT_ID) {
    throw new Error(
      `Proyecto Firebase no aprobado: solo se permite ${APPROVED_FIREBASE_PROJECT_ID}. No se conectó a Firebase.`,
    );
  }
  if (!SEED_WRITE_ENABLED) {
    throw new Error(
      "La escritura está deshabilitada hasta verificar independientemente el proyecto aprobado y la identidad ADC.",
    );
  }

  await writeProducts(targetProjectId);
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Error inesperado durante la vista previa del seeder.",
  );
  process.exitCode = 1;
});

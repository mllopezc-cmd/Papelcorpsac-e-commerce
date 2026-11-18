import { useEffect, useState, type FormEvent } from "react";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProduct,
} from "../services/productService";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  type Product,
  type ProductCategory,
  type ProductInput,
} from "../types/product";

type ProductForm = {
  name: string;
  description: string;
  category: ProductCategory;
  brand: string;
  price: string;
  stock: string;
  published: boolean;
  imageUrl?: string;
  sourceUrl?: string;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category: PRODUCT_CATEGORIES[0],
  brand: "",
  price: "",
  stock: "0",
  published: false,
};

const inputClass =
  "mt-2 w-full min-h-11 rounded-sm border border-line bg-page px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-50";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "permission-denied"
  ) {
    return "No tienes permisos para realizar esta operación.";
  }

  return error instanceof Error
    ? error.message
    : "No se pudo completar la operación.";
}

function toForm(product: Product): ProductForm {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand ?? "",
    price: String(product.price),
    stock:
      product.stock === undefined
        ? ""
        : String(product.stock),
    published: product.published,
    imageUrl: product.imageUrl,
    sourceUrl: product.sourceUrl,
  };
}

function validateForm(form: ProductForm): string | null {
  const price = Number(form.price);
  const stock = Number(form.stock);

  if (!form.name.trim() || form.name.trim().length > 120) {
    return "El nombre debe contener entre 1 y 120 caracteres.";
  }

  if (
    !form.description.trim() ||
    form.description.trim().length > 1000
  ) {
    return "La descripción debe contener entre 1 y 1000 caracteres.";
  }

  if (!form.brand.trim() || form.brand.trim().length > 80) {
    return "La marca debe contener entre 1 y 80 caracteres.";
  }

  if (
    !form.price.trim() ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 1_000_000 ||
    Math.abs(price * 100 - Math.round(price * 100)) > 1e-8
  ) {
    return "Introduce un precio positivo de hasta dos decimales.";
  }

  if (
    !form.stock.trim() ||
    !Number.isSafeInteger(stock) ||
    stock < 0 ||
    stock > 1_000_000
  ) {
    return "El stock debe ser un entero entre 0 y 1 000 000.";
  }

  return null;
}

function toInput(form: ProductForm): ProductInput {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category,
    brand: form.brand.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
    published: form.published,
    ...(form.imageUrl === undefined
      ? {}
      : { imageUrl: form.imageUrl }),
    ...(form.sourceUrl === undefined
      ? {}
      : { sourceUrl: form.sourceUrl }),
  };
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyForm });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const result = await getAdminProducts();

        if (active) {
          setProducts(result);
        }
      } catch (loadFailure) {
        if (active) {
          setLoadError(getErrorMessage(loadFailure));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [reload]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError(null);
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm(toForm(product));
    setError(null);
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError(null);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (busy) {
      return;
    }

    setError(null);
    setNotice(null);

    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);

    try {
      const input = toInput(form);
      const wasEditing = editingId !== null;

      if (editingId !== null) {
        await updateProduct(editingId, input);
      } else {
        await createProduct(input);
      }

      closeForm();
      setNotice(
        wasEditing
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente.",
      );
      setReload((value) => value + 1);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async (product: Product) => {
    if (busy) {
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar "${product.name}"?\n\nSe eliminará el producto de Firestore. Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      await deleteProduct(product.id);

      if (editingId === product.id) {
        closeForm();
      }

      setNotice(`Producto "${product.name}" eliminado.`);
      setReload((value) => value + 1);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="admin-products-title"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
            Administración
          </p>

          <h1
            id="admin-products-title"
            className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl"
          >
            Productos
          </h1>

          <p className="mt-4 max-w-2xl text-muted">
            Gestiona los productos publicados y no publicados
            de Papelcorpsac.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={busy}
          className={`${buttonClass} bg-deep-blue text-cream hover:bg-graphite`}
        >
          Nuevo producto
        </button>
      </div>

      <p className="mt-5 text-sm text-muted">
        La carga de imágenes privadas se implementará en T10.4.
        Los productos nuevos utilizan una imagen local provisional.
      </p>

      {notice && (
        <p
          role="status"
          className="mt-6 rounded-sm border border-line bg-surface p-4 text-sm text-ink"
        >
          {notice}
        </p>
      )}

      {error && !formOpen && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-line bg-surface p-4 text-sm text-ink"
        >
          {error}
        </p>
      )}

      {formOpen && (
        <section
          aria-labelledby="admin-product-form-title"
          className="mt-8 rounded-sm border border-line bg-surface p-5 sm:p-8"
        >
          <h2
            id="admin-product-form-title"
            className="font-display text-2xl font-medium text-ink"
          >
            {editingId === null ? "Crear producto" : "Editar producto"}
          </h2>

          {editingId !== null && (
            <p className="mt-2 break-all text-xs text-muted">
              ID: {editingId}
            </p>
          )}

          <form
            onSubmit={(event) => void submitForm(event)}
            className="mt-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-ink">
                Nombre
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={form.name}
                  disabled={busy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-semibold text-ink">
                Marca
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={form.brand}
                  disabled={busy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brand: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-semibold text-ink">
                Categoría
                <select
                  value={form.category}
                  disabled={busy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as ProductCategory,
                    }))
                  }
                  className={inputClass}
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {PRODUCT_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-ink">
                Precio (S/)
                <input
                  type="number"
                  required
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  value={form.price}
                  disabled={busy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-semibold text-ink">
                Stock
                <input
                  type="number"
                  required
                  min="0"
                  max="1000000"
                  step="1"
                  value={form.stock}
                  disabled={busy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-semibold text-ink sm:col-span-2">
                Descripción
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={form.description}
                  disabled={busy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>
            </div>

            <label className="mt-6 flex items-center gap-3 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.published}
                disabled={busy}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    published: event.target.checked,
                  }))
                }
                className="size-5 accent-deep-blue"
              />
              Publicado en el catálogo
            </label>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-sm border border-line bg-page p-4 text-sm text-ink"
              >
                {error}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className={`${buttonClass} bg-deep-blue text-cream hover:bg-graphite`}
              >
                {busy
                  ? "Guardando…"
                  : editingId === null
                    ? "Crear producto"
                    : "Guardar cambios"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                disabled={busy}
                className={`${buttonClass} border border-line text-ink hover:bg-page`}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section aria-labelledby="product-list-title" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="product-list-title"
            className="font-display text-2xl font-medium text-ink"
          >
            Productos registrados
          </h2>

          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
            disabled={loading || busy}
            className={`${buttonClass} border border-line text-ink hover:bg-surface`}
          >
            Actualizar
          </button>
        </div>

        {loading && (
          <p role="status" className="mt-5 text-sm text-muted">
            Cargando productos…
          </p>
        )}

        {loadError && (
          <div role="alert" className="mt-5 text-sm text-ink">
            <p>{loadError}</p>
            <button
              type="button"
              disabled={loading || busy}
              onClick={() => setReload((value) => value + 1)}
              className={`${buttonClass} mt-3 border border-line`}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !loadError && products.length === 0 && (
          <p className="mt-5 rounded-sm border border-line bg-surface p-5 text-muted">
            No hay productos registrados.
          </p>
        )}

        {!loading && !loadError && products.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-muted">
              {products.length} productos
            </p>

            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-sm border border-line bg-surface p-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gold-text uppercase">
                    {PRODUCT_CATEGORY_LABELS[product.category]}
                  </p>

                  <h3 className="mt-2 font-display text-xl text-ink">
                    {product.name}
                  </h3>

                  <p className="mt-2 break-all text-xs text-muted">
                    ID: {product.id}
                  </p>

                  <p className="mt-3 text-sm text-muted">
                    S/ {product.price.toFixed(2)}
                    {" · "}
                    Stock: {product.stock ?? "Sin registrar"}
                    {" · "}
                    {product.published ? "Publicado" : "No publicado"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openEdit(product)}
                    className={`${buttonClass} border border-line text-ink hover:bg-page`}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeProduct(product)}
                    className={`${buttonClass} border border-line text-ink hover:bg-page`}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProduct,
} from "../services/productService";
import { deleteProductImage } from "../services/productImageDeleteService";
import {
  uploadProductImage,
  validateProductImage,
} from "../services/productImageUploadService";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  type Product,
  type ProductCategory,
  type ProductInput,
} from "../types/product";

type CategoryFilter = ProductCategory | "all";
type PublicationFilter = "all" | "published" | "unpublished";

const PRODUCTS_PER_PAGE = 12;

type PendingAction =
  | { type: "product"; product: Product }
  | { type: "image"; key: string };

type ProductForm = {
  name: string;
  description: string;
  category: ProductCategory;
  brand: string;
  price: string;
  stock: string;
  published: boolean;
  imageUrl?: string;
  imageKey?: string;
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
    imageKey: product.imageKey,
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

function toInput(
  form: ProductForm,
  uploadedKey: string | null,
): ProductInput {
  const imageKey = uploadedKey ?? form.imageKey;

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
    ...(imageKey === undefined
      ? {}
      : { imageKey }),
    ...(form.sourceUrl === undefined
      ? {}
      : { sourceUrl: form.sourceUrl }),
  };
}

export function AdminProductsPage() {
  const { user } = useAuth();
  const formRef = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>("all");
  const [page, setPage] = useState(1);

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

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [uploadError, setUploadError] =
    useState<string | null>(null);
  const [imageNotice, setImageNotice] =
    useState<string | null>(null);
  const [uploadedKey, setUploadedKey] =
    useState<string | null>(null);
  const [pendingAction, setPendingAction] =
    useState<PendingAction | null>(null);

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

  useEffect(() => {
    if (formOpen) {
      const prefersReducedMotion =
        window.matchMedia?.(
          "(prefers-reduced-motion: reduce)",
        ).matches ?? false;

      formRef.current?.scrollIntoView?.({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [formOpen, editingId]);

  const searchTerm = search.trim().toLocaleLowerCase("es");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLocaleLowerCase("es").includes(searchTerm) ||
      (product.brand ?? "").toLocaleLowerCase("es").includes(searchTerm);

    const matchesCategory =
      categoryFilter === "all" ||
      product.category === categoryFilter;

    const matchesPublication =
      publicationFilter === "all" ||
      product.published === (publicationFilter === "published");

    return matchesSearch && matchesCategory && matchesPublication;
  });

  const pageCount = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  const currentPage = Math.min(page, pageCount);

  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const mobilePageNumbers = [
    ...new Set([1, currentPage, pageCount]),
  ].sort((first, second) => first - second);

  const firstVisible =
    filteredProducts.length === 0
      ? 0
      : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

  const lastVisible = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    filteredProducts.length,
  );

  const resetUpload = () => {
    setSelectedImage(null);
    setUploadError(null);
    setImageNotice(null);
    setUploadedKey(null);
  };

  const openCreate = () => {
    if (busy || uploading || deletingImage) {
      return;
    }

    setEditingId(null);
    setForm({ ...emptyForm });
    setError(null);
    setNotice(null);
    resetUpload();
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    if (busy || uploading || deletingImage) {
      return;
    }

    setEditingId(product.id);
    setForm(toForm(product));
    setError(null);
    setNotice(null);
    resetUpload();
    setFormOpen(true);
  };

  const closeForm = () => {
    if (busy || uploading || deletingImage) {
      return;
    }

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError(null);
    resetUpload();
  };

  const selectImage = (file: File | null) => {
    if (
      busy ||
      uploading ||
      deletingImage ||
      uploadedKey !== null
    ) {
      return;
    }

    setSelectedImage(file);
    setUploadedKey(null);
    setImageNotice(null);
    setUploadError(
      file ? validateProductImage(file) : null,
    );
  };

  const uploadImage = async () => {
    if (
      busy ||
      uploading ||
      deletingImage ||
      uploadedKey !== null ||
      !selectedImage
    ) {
      return;
    }

    const validationError = validateProductImage(selectedImage);

    if (validationError) {
      setUploadError(validationError);
      return;
    }

    if (!user) {
      setUploadError("Debes iniciar sesión para subir imágenes.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setImageNotice(null);
    setUploadedKey(null);

    try {
      const result = await uploadProductImage(user, selectedImage);
      setUploadedKey(result.key);
    } catch (failure) {
      setUploadError(getErrorMessage(failure));
    } finally {
      setUploading(false);
    }
  };

  const requestRemoveImage = () => {
    if (
      busy ||
      uploading ||
      deletingImage ||
      pendingAction ||
      !uploadedKey ||
      !user
    ) {
      return;
    }

    setPendingAction({
      type: "image",
      key: uploadedKey,
    });
  };

  const removeUploadedImage = async (key: string) => {
    if (
      busy ||
      uploading ||
      deletingImage ||
      !user ||
      uploadedKey !== key
    ) {
      return;
    }

    setDeletingImage(true);
    setUploadError(null);
    setImageNotice(null);

    try {
      await deleteProductImage(user, key);
      setUploadedKey(null);
      setSelectedImage(null);
      setImageNotice(
        "Imagen no asociada eliminada correctamente.",
      );
    } catch (failure) {
      setUploadError(getErrorMessage(failure));
    } finally {
      setDeletingImage(false);
    }
  };

  const submitForm = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (busy || uploading || deletingImage) {
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
      const input = toInput(form, uploadedKey);
      const wasEditing = editingId !== null;

      if (editingId !== null) {
        await updateProduct(editingId, input);
      } else {
        await createProduct(input);
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setError(null);
      resetUpload();

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

  const requestRemoveProduct = (product: Product) => {
    if (busy || uploading || deletingImage || pendingAction) {
      return;
    }

    setPendingAction({
      type: "product",
      product,
    });
  };

  const removeProduct = async (product: Product) => {
    if (busy || uploading || deletingImage) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      await deleteProduct(product.id);

      if (editingId === product.id) {
        setFormOpen(false);
        setEditingId(null);
        setForm({ ...emptyForm });
        resetUpload();
      }

      setNotice(`Producto "${product.name}" eliminado.`);
      setReload((value) => value + 1);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusy(false);
    }
  };

  const confirmPendingAction = () => {
    const action = pendingAction;

    if (!action) return;

    setPendingAction(null);

    if (action.type === "image") {
      void removeUploadedImage(action.key);
    } else {
      void removeProduct(action.product);
    }
  };

  const controlsDisabled =
    busy || uploading || deletingImage || pendingAction !== null;

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
          disabled={controlsDisabled}
          className={`${buttonClass} bg-deep-blue text-cream hover:bg-graphite`}
        >
          Nuevo producto
        </button>
      </div>

      <p className="mt-5 text-sm text-muted">
        Las imágenes se suben al bucket privado de AWS S3.
        Para asociar una imagen al producto, súbela y guarda
        el formulario.
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
          ref={formRef}
          aria-labelledby="admin-product-form-title"
          className="mt-8 rounded-sm border border-line bg-surface p-5 sm:p-8"
        >
          <h2
            id="admin-product-form-title"
            className="font-display text-2xl font-medium text-ink"
          >
            {editingId === null
              ? "Crear producto"
              : "Editar producto"}
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
                  disabled={controlsDisabled}
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
                  disabled={controlsDisabled}
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
                  disabled={controlsDisabled}
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
                  disabled={controlsDisabled}
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
                  disabled={controlsDisabled}
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
                  disabled={controlsDisabled}
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

            <fieldset className="mt-6 rounded-sm border border-line bg-page p-4 sm:p-5">
              <legend className="px-2 text-sm font-semibold text-ink">
                Imagen del producto — AWS S3
              </legend>

              <p className="text-sm text-muted">
                Formatos JPEG, PNG y WebP; máximo 5 MiB.
                La selección no inicia una subida.
              </p>

              {form.imageKey && (
                <div className="mt-4 rounded-sm border border-line bg-surface p-4">
                  <p className="text-sm font-semibold text-ink">
                    Imagen S3 asociada actualmente
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-muted">
                    Clave S3: {form.imageKey}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Si guardas sin subir otra imagen, se
                    conservará esta referencia.
                  </p>
                </div>
              )}

              <label
                htmlFor="admin-product-image"
                className="mt-4 block text-sm font-semibold text-ink"
              >
                Seleccionar imagen
              </label>

              <input
                id="admin-product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={controlsDisabled || uploadedKey !== null}
                onChange={(event) => {
                  const file =
                    event.currentTarget.files?.[0] ?? null;

                  selectImage(file);
                  event.currentTarget.value = "";
                }}
                className={`${inputClass} file:mr-3 file:rounded-sm file:border-0 file:bg-deep-blue file:px-3 py-2 text-sm text-ink`}
              />

              {selectedImage && (
                <p className="mt-3 break-all text-sm text-muted">
                  Archivo: {selectedImage.name}
                </p>
              )}

              <button
                type="button"
                disabled={
                  controlsDisabled ||
                  uploadedKey !== null ||
                  !user ||
                  !selectedImage ||
                  validateProductImage(selectedImage) !== null
                }
                onClick={() => void uploadImage()}
                className={`${buttonClass} mt-4 border border-line bg-surface text-ink hover:bg-page`}
              >
                {uploading
                  ? "Subiendo imagen…"
                  : "Subir imagen a S3"}
              </button>

              {uploading && (
                <p role="status" className="mt-3 text-sm text-muted">
                  Subiendo imagen a AWS S3…
                </p>
              )}

              {uploadError && (
                <p
                  role="alert"
                  className="mt-3 text-sm text-ink"
                >
                  {uploadError}
                </p>
              )}

              {imageNotice && (
                <p
                  role="status"
                  className="mt-3 text-sm text-ink"
                >
                  {imageNotice}
                </p>
              )}

              {uploadedKey && (
                <div className="mt-4 rounded-sm border border-line bg-surface p-4">
                  <p
                    role="status"
                    className="text-sm font-semibold text-ink"
                  >
                    Imagen subida correctamente a S3.
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-ink">
                    Clave S3: {uploadedKey}
                  </p>

                  <p className="mt-3 text-sm text-muted">
                    Esta imagen se asociará al producto
                    cuando guardes el formulario.
                    Si el guardado falla, podrás reintentarlo
                    sin volver a subir el archivo.
                    Para seleccionar otra imagen, guarda el
                    producto o elimina esta imagen pendiente.
                  </p>

                  <button
                    type="button"
                    disabled={controlsDisabled || !user}
                    onClick={requestRemoveImage}
                    className={`${buttonClass} mt-4 border border-line bg-page text-ink hover:bg-surface`}
                  >
                    {deletingImage
                      ? "Eliminando imagen…"
                      : "Eliminar imagen no asociada"}
                  </button>

                  <p className="mt-2 text-xs text-muted">
                    Solo se intentará eliminar esta imagen
                    recién subida. El servidor comprobará
                    que ningún producto la utilice.
                  </p>
                </div>
              )}

              <p className="mt-4 text-sm text-muted">
                Las imágenes ya asociadas a productos no se
                eliminan automáticamente al editar o borrar
                productos. La eliminación manual se limita
                a imágenes recién subidas y no asociadas.
              </p>
            </fieldset>

            <label className="mt-6 flex items-center gap-3 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.published}
                disabled={controlsDisabled}
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
                disabled={controlsDisabled}
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
                disabled={controlsDisabled}
                className={`${buttonClass} border border-line text-ink hover:bg-page`}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section
        aria-labelledby="product-list-title"
        className="mt-10"
      >
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
            disabled={loading || controlsDisabled}
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
              disabled={loading || controlsDisabled}
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
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted">
              {products.length} productos registrados
            </p>

            <div className="grid gap-4 rounded-sm border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block text-sm font-semibold text-ink">
                Buscar por nombre o marca
                <input
                  type="search"
                  value={search}
                  placeholder="Buscar producto…"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-semibold text-ink">
                Filtrar por categoría
                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(
                      event.target.value as CategoryFilter,
                    );
                    setPage(1);
                  }}
                  className={inputClass}
                >
                  <option value="all">
                    Todas las categorías
                  </option>

                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {PRODUCT_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-ink">
                Filtrar por publicación
                <select
                  value={publicationFilter}
                  onChange={(event) => {
                    setPublicationFilter(
                      event.target.value as PublicationFilter,
                    );
                    setPage(1);
                  }}
                  className={inputClass}
                >
                  <option value="all">Todos</option>
                  <option value="published">Publicados</option>
                  <option value="unpublished">No publicados</option>
                </select>
              </label>
            </div>

            <p role="status" className="text-sm text-muted">
              {filteredProducts.length} resultados · Mostrando{" "}
              {firstVisible}–{lastVisible}
            </p>

            {filteredProducts.length === 0 ? (
              <p className="rounded-sm border border-line bg-surface p-5 text-muted">
                No se encontraron productos con estos filtros.
              </p>
            ) : (
              <div className="space-y-3">
                {visibleProducts.map((product) => (
                  <article
                    key={product.id}
                    className="flex flex-col gap-4 rounded-sm border border-line bg-surface p-5 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 w-full flex-1">
                      <p className="text-xs font-semibold text-gold-text uppercase">
                        {PRODUCT_CATEGORY_LABELS[product.category]}
                      </p>

                      <h3 className="mt-2 font-display text-xl text-ink wrap-break-word">
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
                        {product.published
                          ? "Publicado"
                          : "No publicado"}
                      </p>
                    </div>

                    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
                      <button
                        type="button"
                        aria-label={`Editar ${product.name}`}
                        disabled={controlsDisabled}
                        onClick={() => openEdit(product)}
                        className={`${buttonClass} flex-1 border border-line text-ink hover:bg-page sm:flex-none`}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        aria-label={`Eliminar ${product.name}`}
                        disabled={controlsDisabled}
                        onClick={() => requestRemoveProduct(product)}
                        className={`${buttonClass} flex-1 border border-line text-ink hover:bg-page sm:flex-none`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}

                {pageCount > 1 && (
                  <nav
                    aria-label="Paginación de productos administrativos"
                    className="mt-8 flex flex-wrap items-center justify-center gap-2"
                  >
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                      className={`${buttonClass} border border-line text-ink hover:bg-page`}
                    >
                      Anterior
                    </button>

                    {Array.from(
                      { length: pageCount },
                      (_, index) => {
                        const pageNumber = index + 1;
                        const isCurrent =
                          pageNumber === currentPage;
                        const isMobile =
                          mobilePageNumbers.includes(pageNumber);
                        const previousMobile =
                          mobilePageNumbers[
                            mobilePageNumbers.indexOf(
                              pageNumber,
                            ) - 1
                          ];

                        return (
                          <Fragment key={pageNumber}>
                            {isMobile &&
                              previousMobile !== undefined &&
                              pageNumber - previousMobile > 1 && (
                                <span
                                  aria-hidden="true"
                                  className="px-1 text-sm text-muted sm:hidden"
                                >
                                  …
                                </span>
                              )}

                            <button
                              type="button"
                              aria-label={`Página ${pageNumber}`}
                              aria-current={
                                isCurrent ? "page" : undefined
                              }
                              onClick={() => setPage(pageNumber)}
                              className={`size-11 rounded-sm border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text ${
                                isCurrent
                                  ? "border-gold-text bg-deep-blue text-cream"
                                  : "border-line bg-page text-ink hover:border-gold/60 hover:bg-surface"
                              } ${
                                isMobile
                                  ? ""
                                  : "hidden sm:inline-block"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          </Fragment>
                        );
                      },
                    )}

                    <button
                      type="button"
                      disabled={currentPage === pageCount}
                      onClick={() => setPage(currentPage + 1)}
                      className={`${buttonClass} border border-line text-ink hover:bg-page`}
                    >
                      Siguiente
                    </button>
                  </nav>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction?.type === "image"
            ? "Eliminar imagen temporal"
            : "Eliminar producto"
        }
        description={
          pendingAction?.type === "image"
            ? `¿Eliminar esta imagen de AWS S3?\n\n${pendingAction.key}\n\nLa imagen todavía no se ha asociado al producto mediante este formulario. Esta acción no se puede deshacer.`
            : pendingAction?.type === "product"
              ? `¿Eliminar "${pendingAction.product.name}"?\n\nSe eliminará el producto de Firestore. Esta acción no se puede deshacer.`
              : ""
        }
        confirmLabel={
          pendingAction?.type === "image"
            ? "Eliminar imagen"
            : "Eliminar producto"
        }
        destructive
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </section>
  );
}

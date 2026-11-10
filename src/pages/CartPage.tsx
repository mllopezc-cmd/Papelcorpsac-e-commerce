import { Link } from "react-router";
import { ProductImage } from "../components/ProductCard";
import { useCart } from "../hooks/useCart";

const priceFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function CartPage() {
  const { items, totalUnits, subtotal, updateQuantity, removeItem, clearCart } =
    useCart();

  return (
    <section
      aria-labelledby="cart-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>
      <h1
        id="cart-title"
        className="font-display text-3xl font-medium text-ink sm:text-5xl"
      >
        Mi carrito
      </h1>
      <div className="mt-8 rounded-sm border border-line bg-surface p-5 sm:p-8">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="font-display text-xl text-ink">
              Tu carrito está vacío.
            </p>
            <p className="mt-3 text-muted">
              Explora el catálogo y agrega tus productos favoritos.
            </p>
            <Link
              to="/catalogo"
              className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-semibold text-ink">
                {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
              </p>
              <button
                type="button"
                onClick={clearCart}
                className="min-h-11 rounded-sm px-3 py-2 text-sm font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
              >
                Vaciar carrito
              </button>
            </div>

            <ul className="mt-5 divide-y divide-line border-y border-line">
              {items.map(({ product, quantity }) => {
                const hasStock =
                  typeof product.stock === "number" &&
                  Number.isSafeInteger(product.stock) &&
                  product.stock > 0;

                return (
                  <li
                    key={product.id}
                    className="grid gap-4 py-5 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="aspect-square w-28 overflow-hidden border border-line bg-page">
                      <ProductImage product={product} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="wrap-break-word font-display text-lg font-medium text-ink">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        Precio unitario: {priceFormatter.format(product.price)}
                      </p>
                      <p className="mt-1 font-semibold text-ink">
                        Subtotal:{" "}
                        {priceFormatter.format(
                          (Math.round(product.price * 100) * quantity) / 100,
                        )}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Disminuir cantidad de ${product.name}`}
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          disabled={quantity <= 1}
                          className="flex size-11 items-center justify-center rounded-sm border border-line bg-page text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          −
                        </button>
                        <span
                          aria-label={`Cantidad: ${quantity}`}
                          className="min-w-10 text-center font-semibold text-ink"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Aumentar cantidad de ${product.name}`}
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          disabled={
                            !hasStock || quantity >= (product.stock ?? 0)
                          }
                          className="flex size-11 items-center justify-center rounded-sm border border-line bg-page text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="min-h-11 rounded-sm px-3 py-2 text-sm font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-col gap-5 sm:ml-auto sm:max-w-sm">
              <dl className="space-y-3">
                <div className="flex justify-between gap-4 text-ink">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold">
                    {priceFormatter.format(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-line pt-3 font-display text-xl text-ink">
                  <dt>Total</dt>
                  <dd>{priceFormatter.format(subtotal)}</dd>
                </div>
              </dl>
              <Link
                to="/catalogo"
                className="inline-flex min-h-11 items-center justify-center rounded-sm border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
              >
                Continuar comprando
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { PRODUCT_CATEGORY_LABELS, type Product } from '../types/product'

const priceFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

type ProductImageProps = {
  product: Product
  className?: string
}

export function ProductImage({ product, className = '' }: ProductImageProps) {
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`Imagen no disponible para ${product.name}`}
      className={`flex h-full w-full items-center justify-center bg-surface p-6 ${className}`}
    >
      <span className="border border-gold/35 px-5 py-4 font-display text-xs tracking-[0.2em] text-gold-text">
        PAPEL CORP
      </span>
    </div>
  )
}

type ProductCardProps = {
  product: Product
  isFavorite: boolean
  favoritePending: boolean
  onToggleFavorite: (productId: string) => void
}

export function ProductCard({
  product,
  isFavorite,
  favoritePending,
  onToggleFavorite,
}: ProductCardProps) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleFavoriteClick = () => {
    if (loading) {
      return
    }

    if (!user) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      })
      return
    }

    onToggleFavorite(product.id)
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-sm border border-line bg-page">
      <div className="relative aspect-4/3 overflow-hidden bg-surface">
        <ProductImage product={product} />
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={loading || favoritePending}
          aria-label={
            loading
              ? `Comprobando sesión para guardar ${product.name}`
              : favoritePending
                ? `${isFavorite ? 'Quitando' : 'Guardando'} ${product.name} ${
                    isFavorite ? 'de' : 'en'
                  } favoritos`
                : user
                  ? `${isFavorite ? 'Quitar' : 'Guardar'} ${product.name} ${
                      isFavorite ? 'de' : 'en'
                    } favoritos`
                  : `Inicia sesión para guardar ${product.name} en favoritos`
          }
          aria-pressed={isFavorite}
          className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full border border-line bg-page/95 text-gold-text shadow-sm transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text disabled:cursor-wait disabled:opacity-70"
        >
          {favoritePending ? (
            <span aria-hidden="true" className="text-sm">
              …
            </span>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              className="size-5"
            >
              <path
                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-gold-text uppercase">
          {PRODUCT_CATEGORY_LABELS[product.category]}
        </p>
        <h2 className="mt-2 font-display text-lg font-medium text-ink">
          {product.name}
        </h2>
        <p className="mt-3 text-lg font-semibold text-ink">
          {priceFormatter.format(product.price)}
        </p>
        <Link
          to={`/catalogo/${encodeURIComponent(product.id)}`}
          aria-label={`Ver detalles de ${product.name}`}
          className="mt-5 inline-flex w-fit items-center rounded-sm bg-deep-blue px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
        >
          Ver detalles
        </Link>
      </div>
    </article>
  )
}

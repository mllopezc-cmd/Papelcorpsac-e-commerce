import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <p className="font-display text-6xl text-gold-text" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-medium text-ink">
        Página no encontrada
      </h1>
      <p className="mt-4 leading-7 text-muted">
        La dirección que buscas no está disponible.
      </p>
      <Link
        to="/"
        className="mt-7 rounded-sm border border-gold px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
      >
        Volver al inicio
      </Link>
    </section>
  );
}

import { Link } from "react-router";

export function HomePage() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-28">
      <div>
        <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
          PAPELERÍA · ESCRITURA · OFICINA
        </p>
        <h1 className="max-w-3xl font-display text-4xl leading-tight font-medium text-ink sm:text-6xl">
          Ideas que merecen{" "}
          <span className="text-gold-text">tomar forma.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
          Te damos la bienvenida a PAPEL CORP, un espacio para descubrir
          papelería y herramientas que acompañan cada proyecto.
        </p>
        <Link
          to="/catalogo"
          className="mt-8 inline-flex items-center gap-3 rounded-sm bg-deep-blue px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
        >
          Conoce nuestra propuesta
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="relative flex min-h-72 items-center justify-center overflow-hidden border border-line bg-surface px-6 py-12 sm:min-h-96">
        <div
          aria-hidden="true"
          className="absolute inset-5 border border-gold/35 sm:inset-8"
        />
        <div className="relative flex flex-col items-center text-center">
          <img
            src="/logo-papelcorpsac.png"
            alt="Emblema PAPEL CORP"
            className="mb-5 size-28 object-contain sm:size-36"
          />
          <p className="font-display text-lg tracking-[0.14em] text-ink sm:text-xl">
            PAPEL CORP
          </p>
          <p className="mt-2 text-xs tracking-[0.16em] text-muted uppercase">
            Da vida a tus ideas
          </p>
        </div>
      </div>
    </section>
  );
}

export function CatalogPage() {
  return (
    <section
      aria-labelledby="catalog-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>
      <h1
        id="catalog-title"
        className="font-display text-3xl font-medium text-ink sm:text-5xl"
      >
        Nuestro catálogo
      </h1>
      <div className="mt-8 rounded-sm border border-line bg-surface p-6 sm:p-10">
        <p className="font-display text-xl text-ink sm:text-2xl">
          Una selección especial está tomando forma.
        </p>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Esta vista es temporal. Los productos y las opciones para explorar el
          catálogo se incorporarán en una etapa posterior.
        </p>
      </div>
    </section>
  );
}

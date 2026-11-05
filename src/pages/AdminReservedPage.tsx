export function AdminReservedPage() {
  return (
    <section
      aria-labelledby="admin-reserved-title"
      className="mx-auto flex min-h-[55vh] max-w-3xl flex-col justify-center px-5 py-16 text-center sm:px-8"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        PAPEL CORP
      </p>
      <h1
        id="admin-reserved-title"
        className="font-display text-3xl font-medium text-ink sm:text-4xl"
      >
        Sección en preparación
      </h1>
      <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
        Esta ruta queda reservada para la futura sección administrativa. La
        autenticación y la protección de acceso todavía no están implementadas.
      </p>
    </section>
  );
}

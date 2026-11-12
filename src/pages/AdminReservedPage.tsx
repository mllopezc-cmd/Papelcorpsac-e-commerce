import { Link } from "react-router";

export function AdminReservedPage() {
  return (
    <section
      aria-labelledby="admin-title"
      className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
        Panel administrativo
      </p>

      <h1
        id="admin-title"
        className="mt-4 font-display text-3xl font-medium text-ink sm:text-4xl"
      >
        Gestión de PAPEL CORP
      </h1>

      <p className="mt-5 max-w-2xl leading-7 text-muted">
        Bienvenido al área administrativa de Papelcorpsac.
        Desde aquí podrás gestionar los productos y sus imágenes
        cuando se incorporen las herramientas correspondientes.
      </p>

      <div className="mt-10 max-w-2xl rounded-sm border border-line bg-surface p-6 sm:p-8">
        <h2 className="font-display text-xl font-medium text-ink">
          Gestión de productos
        </h2>

        <p className="mt-3 leading-7 text-muted">
          La consulta, creación, edición y eliminación de productos
          se implementarán en la siguiente subtarea de T10.
        </p>

        <p className="mt-3 text-sm text-muted">
          La integración con imágenes privadas de AWS S3 también
          se encuentra pendiente.
        </p>

        <Link
          to="/catalogo"
          className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
        >
          Ver catálogo público
        </Link>
      </div>
    </section>
  );
}

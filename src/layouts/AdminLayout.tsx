import { NavLink, Outlet } from "react-router";

const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center rounded-sm px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text ${
    isActive
      ? "bg-deep-blue text-cream"
      : "text-ink hover:bg-surface"
  }`;

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-page text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-papelcorpsac.png"
              alt=""
              className="size-11 object-contain"
            />
            <div>
              <p className="font-display text-lg font-semibold tracking-[0.12em] text-ink">
                PAPEL CORP
              </p>
              <p className="text-xs font-semibold tracking-[0.12em] text-gold-text uppercase">
                Administración
              </p>
            </div>
          </div>

          <nav
            aria-label="Navegación administrativa"
            className="flex flex-wrap items-center gap-2"
          >
            <NavLink to="/admin" end className={adminLinkClass}>
              Panel
            </NavLink>

            <NavLink
              to="/catalogo"
              className={adminLinkClass}
            >
              Ver tienda
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line px-5 py-5 text-center text-xs tracking-wide text-muted sm:px-8">
        PAPEL CORP <span aria-hidden="true">·</span> Área administrativa
      </footer>
    </div>
  );
}

import { NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";

const navigationLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-sm px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text ${
    isActive
      ? "text-gold-text"
      : "text-ink hover:text-gold-text"
  }`;

type HeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="border-b border-line bg-page">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-4 sm:flex-row sm:px-8">
        <NavLink
          to="/"
          aria-label="PAPEL CORP, inicio"
          className="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
        >
          <img
            src="/logo-papelcorpsac.png"
            alt=""
            className="size-11 object-contain"
          />
          <span className="font-display text-lg font-semibold tracking-[0.12em] text-ink">
            PAPEL CORP
          </span>
        </NavLink>

        <nav aria-label="Navegación principal" className="flex items-center gap-2">
          <NavLink to="/" end className={navigationLinkClass}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className={navigationLinkClass}>
            Catálogo
          </NavLink>
          {user && (
            <NavLink to="/favoritos" className={navigationLinkClass}>
              Favoritos
            </NavLink>
          )}
          <button
            type="button"
            aria-label="Modo oscuro"
            aria-pressed={theme === "dark"}
            onClick={onToggleTheme}
            className="flex size-11 items-center justify-center rounded-full border border-line text-gold-text transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
          >
            {theme === "light" ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
              >
                <path
                  d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminReservedPage } from "./pages/AdminReservedPage";
import { CatalogPage } from "./pages/CatalogPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useAuth } from "./hooks/useAuth";

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem("papelcorpsac-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const { user, profile, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("papelcorpsac-theme", nextTheme);
  };

  const handleSignOut = async () => {
    setSignOutError(null);

    try {
      await signOut();
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "No se pudo cerrar sesión.",
      );
    }
  };

  return (
    <>
      {user && profile && (
        <div className="border-b border-line bg-surface px-5 py-2 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted">
              Hola, <span className="font-semibold text-ink">{profile.displayName}</span>
            </p>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="rounded-sm px-3 py-2 font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-text"
            >
              Cerrar sesión
            </button>
          </div>
          {signOutError && (
            <p role="alert" className="mx-auto mt-1 max-w-7xl text-sm text-ink">
              {signOutError}
            </p>
          )}
        </div>
      )}
      <Routes>
        <Route
          element={
            <PublicLayout theme={theme} onToggleTheme={toggleTheme} />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <AdminReservedPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

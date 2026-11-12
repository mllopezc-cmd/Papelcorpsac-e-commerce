import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CartAddNotification } from "./components/CartAddNotification";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";

type Theme = "light" | "dark";

const CatalogPage = lazy(() =>
  import("./pages/CatalogPage").then(({ CatalogPage }) => ({
    default: CatalogPage,
  })),
);

const CartPage = lazy(() =>
  import("./pages/CartPage").then(({ CartPage }) => ({
    default: CartPage,
  })),
);

const CheckoutPage = lazy(() =>
  import("./pages/CheckoutPage").then(({ CheckoutPage }) => ({
    default: CheckoutPage,
  })),
);

const OrdersPage = lazy(() =>
  import("./pages/OrdersPage").then(({ OrdersPage }) => ({
    default: OrdersPage,
  })),
);

const OrderDetailPage = lazy(() =>
  import("./pages/OrderDetailPage").then(({ OrderDetailPage }) => ({
    default: OrderDetailPage,
  })),
);

const ProductDetailPage = lazy(() =>
  import("./pages/ProductDetailPage").then(({ ProductDetailPage }) => ({
    default: ProductDetailPage,
  })),
);

const FavoritesPage = lazy(() =>
  import("./pages/FavoritesPage").then(({ FavoritesPage }) => ({
    default: FavoritesPage,
  })),
);

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then(({ LoginPage }) => ({
    default: LoginPage,
  })),
);

const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then(({ RegisterPage }) => ({
    default: RegisterPage,
  })),
);

const AdminReservedPage = lazy(() =>
  import("./pages/AdminReservedPage").then(({ AdminReservedPage }) => ({
    default: AdminReservedPage,
  })),
);

const pageLoadingFallback = (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="flex min-h-[55vh] flex-col items-center justify-center gap-3 px-5 py-16 text-center"
  >
    <span className="font-display text-sm font-semibold tracking-[0.2em] text-gold-text">
      PAPEL CORP
    </span>
    <span className="text-sm text-muted">Cargando página…</span>
  </div>
);

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
        error instanceof Error
          ? error.message
          : "No se pudo cerrar sesión.",
      );
    }
  };

  return (
    <>
      {user && profile && (
        <div className="border-b border-line bg-surface px-5 py-2 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted">
              Hola,{" "}
              <span className="font-semibold text-ink">
                {profile.displayName}
              </span>
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
            <p
              role="alert"
              className="mx-auto mt-1 max-w-7xl text-sm text-ink"
            >
              {signOutError}
            </p>
          )}
        </div>
      )}

      <Routes>
        <Route
          element={
            <PublicLayout
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        >
          <Route index element={<HomePage />} />

          <Route
            path="catalogo"
            element={
              <Suspense fallback={pageLoadingFallback}>
                <CatalogPage />
              </Suspense>
            }
          />

          <Route
            path="carrito"
            element={
              <Suspense fallback={pageLoadingFallback}>
                <CartPage />
              </Suspense>
            }
          />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Suspense fallback={pageLoadingFallback}>
                  <CheckoutPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="mis-ordenes"
            element={
              <ProtectedRoute>
                <Suspense fallback={pageLoadingFallback}>
                  <OrdersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="mis-ordenes/:orderId"
            element={
              <ProtectedRoute>
                <Suspense fallback={pageLoadingFallback}>
                  <OrderDetailPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="catalogo/:productId"
            element={
              <Suspense fallback={pageLoadingFallback}>
                <ProductDetailPage />
              </Suspense>
            }
          />

          <Route
            path="favoritos"
            element={
              <ProtectedRoute>
                <Suspense fallback={pageLoadingFallback}>
                  <FavoritesPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="login"
            element={
              <Suspense fallback={pageLoadingFallback}>
                <LoginPage />
              </Suspense>
            }
          />

          <Route
            path="register"
            element={
              <Suspense fallback={pageLoadingFallback}>
                <RegisterPage />
              </Suspense>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={pageLoadingFallback}>
                <AdminReservedPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      <CartAddNotification />
    </>
  );
}

export default App;

import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'

type ProtectedRouteProps = {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, profile, loading, error } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        aria-live="polite"
        className="flex min-h-[55vh] items-center justify-center px-5 py-16"
      >
        <p className="text-sm text-muted">Verificando tu sesión…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (error || !profile) {
    return (
      <section
        aria-labelledby="profile-error-title"
        className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center"
      >
        <h1 id="profile-error-title" className="font-display text-2xl text-ink">
          No se pudo verificar tu perfil
        </h1>
        <p role="alert" className="mt-4 leading-7 text-muted">
          {error ?? 'El perfil no está disponible.'}
        </p>
      </section>
    )
  }

  if (requireAdmin && profile.role !== 'admin') {
    return (
      <section
        aria-labelledby="access-denied-title"
        className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center"
      >
        <h1 id="access-denied-title" className="font-display text-2xl text-ink">
          Acceso restringido
        </h1>
        <p className="mt-4 leading-7 text-muted">
          Esta sección está disponible únicamente para el personal administrador.
        </p>
        <Link
          to="/"
          className="mt-7 rounded-sm bg-deep-blue px-5 py-3 text-sm font-semibold text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
        >
          Volver al inicio
        </Link>
      </section>
    )
  }

  return children
}

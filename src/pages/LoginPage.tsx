import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

type LocationState = {
  from?: string
}

export function LoginPage() {
  const { signIn, signInWithGoogle, clearError, error } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const requestedReturn = (location.state as LocationState | null)?.from
  const returnTo =
    requestedReturn?.startsWith('/') && !requestedReturn.startsWith('//')
      ? requestedReturn
      : '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    clearError()
    setSubmitting(true)

    try {
      await signIn(email, password)
      navigate(returnTo, { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo iniciar sesión.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setFormError(null)
    clearError()
    setSubmitting(true)

    try {
      await signInWithGoogle()
      navigate(returnTo, { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión con Google.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const displayedError = formError ?? error

  return (
    <section className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
      <div className="w-full max-w-md border border-line bg-page p-6 shadow-sm sm:p-9">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-gold-text uppercase">
          PAPEL CORP
        </p>
        <h1 className="mt-3 text-center font-display text-3xl font-medium text-ink">
          Iniciar sesión
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-muted">
          Ingresa para continuar con tus compras.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-sm border border-line bg-page px-3 py-3 text-ink outline-none focus-visible:border-gold-text focus-visible:ring-2 focus-visible:ring-gold-text"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-sm border border-line bg-page px-3 py-3 text-ink outline-none focus-visible:border-gold-text focus-visible:ring-2 focus-visible:ring-gold-text"
            />
          </div>

          {displayedError && (
            <p
              role="alert"
              aria-live="polite"
              className="border border-line bg-surface p-3 text-sm text-ink"
            >
              {displayedError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-deep-blue px-5 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Ingresando…' : 'Ingresar con correo'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
          <span>o continúa con</span>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleGoogleSignIn()}
          className="w-full rounded-sm border border-line px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continuar con Google
        </button>

        <p className="mt-7 text-center text-sm text-muted">
          ¿Aún no tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </section>
  )
}

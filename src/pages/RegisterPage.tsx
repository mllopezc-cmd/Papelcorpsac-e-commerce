import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register, clearError, error } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    clearError()

    if (!displayName.trim()) {
      setFormError('Ingresa tu nombre completo.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)

    try {
      await register(displayName, email, password)
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo crear la cuenta.',
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
          Crear cuenta
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-muted">
          Regístrate para descubrir nuestra papelería.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="register-name"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Nombre
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-sm border border-line bg-page px-3 py-3 text-ink outline-none focus-visible:border-gold-text focus-visible:ring-2 focus-visible:ring-gold-text"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Correo electrónico
            </label>
            <input
              id="register-email"
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
              htmlFor="register-password"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-sm border border-line bg-page px-3 py-3 text-ink outline-none focus-visible:border-gold-text focus-visible:ring-2 focus-visible:ring-gold-text"
            />
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Confirmar contraseña
            </label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            {submitting ? 'Creando cuenta…' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-text"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  )
}

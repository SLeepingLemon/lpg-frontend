import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthCard, FormAlert, SplitAuthLayout } from '../../components/auth/AuthLayout'
import FormField from '../../components/auth/FormField'
import GoogleButton, { OrDivider } from '../../components/auth/GoogleButton'
import PasswordField from '../../components/auth/PasswordField'
import Button from '../../components/common/Button'
import { ROUTES } from '../../config/routes'
import { useAuth } from '../../hooks/useAuth'
import { collectErrors, validateEmail, validateLoginPassword } from '../../utils/validators'

const validate = ({ email, password }) =>
  collectErrors({
    email: () => validateEmail(email),
    password: () => validateLoginPassword(password),
  })

function focusFirstError(form, errors) {
  const first = Object.keys(errors)[0]
  if (first) form.elements.namedItem(first)?.focus()
}

export default function Login() {
  const { login, loginWithGoogle, error, clearError, isMockAuth } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'reset'

  useEffect(() => clearError, [clearError])

  return (
    <SplitAuthLayout>
      <div className="w-full max-w-md">
        {mode === 'signin' ? (
          <SignInForm
            login={login}
            loginWithGoogle={loginWithGoogle}
            error={error}
            isMockAuth={isMockAuth}
            onForgot={() => {
              clearError()
              setMode('reset')
            }}
          />
        ) : (
          <ResetPasswordForm
            error={error}
            onBack={() => {
              clearError()
              setMode('signin')
            }}
          />
        )}
      </div>
    </SplitAuthLayout>
  )
}

function SignInForm({ login, loginWithGoogle, error, isMockAuth, onForgot }) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(null) // 'email' | 'google' | null

  // Errors appear after the first submit attempt, then update live.
  const errors = submitted ? validate(values) : {}
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    const found = validate(values)
    if (Object.keys(found).length) return focusFirstError(e.currentTarget, found)

    setPending('email')
    try {
      await login(values.email, values.password, { remember })
      // PublicOnlyRoute redirects once the auth state updates.
    } catch {
      setPending(null)
    }
  }

  async function handleGoogle() {
    setPending('google')
    try {
      await loginWithGoogle({ remember })
    } catch {
      setPending(null)
    }
  }

  return (
    <AuthCard eyebrow="Account access" title="Welcome back" subtitle="Enter your credentials to access your Smart LPG account.">
      <form noValidate onSubmit={handleSubmit} className="grid gap-5">
        {isMockAuth && <FormAlert tone="info">Demo mode: any email and password will sign you in.</FormAlert>}
        <FormAlert>{error}</FormAlert>

        <FormField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={values.email}
          onChange={onChange}
          error={errors.email}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={onChange}
          error={errors.password}
        />

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-slate-300 accent-brand-500"
            />
            Remember me
          </label>
          <button type="button" onClick={onForgot} className="rounded text-sm font-semibold text-brand-500 hover:text-brand-700 hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" fullWidth loading={pending === 'email'} disabled={Boolean(pending)}>
          Sign in
        </Button>
        <OrDivider />
        <GoogleButton onClick={handleGoogle} loading={pending === 'google'} disabled={Boolean(pending)} />

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.register} className="rounded font-semibold text-brand-500 hover:text-brand-700 hover:underline">
            Create account
          </Link>
        </p>
      </form>

      <p className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
        Your account helps keep your LPG information organized and accessible.
      </p>
    </AuthCard>
  )
}

function ResetPasswordForm({ error, onBack }) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const inputRef = useRef(null)

  const emailError = submitted ? validateEmail(email) : ''

  useEffect(() => inputRef.current?.focus(), [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    if (validateEmail(email)) return inputRef.current?.focus()
    setPending(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      // error shown via context
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard eyebrow="Account access" title="Reset password" subtitle="We'll email you a link to set a new password.">
      <form noValidate onSubmit={handleSubmit} className="grid gap-5">
        <FormAlert>{error}</FormAlert>
        {sent && (
          <FormAlert tone="success">
            If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way. Check your inbox and spam folder.
          </FormAlert>
        )}
        <FormField
          id="reset-email"
          ref={inputRef}
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
        />
        <Button type="submit" size="lg" fullWidth loading={pending}>
          {sent ? 'Resend link' : 'Send reset link'}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 rounded text-sm font-semibold text-brand-500 hover:text-brand-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to sign in
        </button>
      </form>
    </AuthCard>
  )
}

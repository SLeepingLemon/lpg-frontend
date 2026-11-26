import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthCard, CenteredAuthLayout, FormAlert } from '../../components/auth/AuthLayout'
import FormField from '../../components/auth/FormField'
import GoogleButton, { OrDivider } from '../../components/auth/GoogleButton'
import PasswordField from '../../components/auth/PasswordField'
import Button from '../../components/common/Button'
import { ROUTES } from '../../config/routes'
import { useAuth } from '../../hooks/useAuth'
import {
  collectErrors,
  normalizePhone,
  validateEmail,
  validateFullName,
  validateNewPassword,
  validatePasswordMatch,
  validatePhone,
  validateUsername,
} from '../../utils/validators'

const INITIAL = { fullName: '', email: '', phone: '', username: '', password: '', confirmPassword: '' }

const validate = (v) =>
  collectErrors({
    fullName: () => validateFullName(v.fullName),
    email: () => validateEmail(v.email),
    phone: () => validatePhone(v.phone),
    username: () => validateUsername(v.username),
    password: () => validateNewPassword(v.password),
    confirmPassword: () => validatePasswordMatch(v.password, v.confirmPassword),
  })

export default function Register() {
  const { register, loginWithGoogle, error, clearError, isMockAuth } = useAuth()
  const [values, setValues] = useState(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(null) // 'email' | 'google' | null

  useEffect(() => clearError, [clearError])

  const errors = submitted ? validate(values) : {}
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    const found = validate(values)
    const first = Object.keys(found)[0]
    if (first) return e.currentTarget.elements.namedItem(first)?.focus()

    setPending('email')
    try {
      await register({ ...values, phone: normalizePhone(values.phone) })
      // PublicOnlyRoute redirects to the dashboard once signed in.
    } catch {
      setPending(null)
    }
  }

  async function handleGoogle() {
    setPending('google')
    try {
      await loginWithGoogle()
    } catch {
      setPending(null)
    }
  }

  return (
    <CenteredAuthLayout>
      <AuthCard
        className="max-w-lg"
        eyebrow="Get started"
        title="Create your account"
        subtitle="Enter your details to register for Smart LPG."
      >
        <form noValidate onSubmit={handleSubmit} className="grid gap-4">
          {isMockAuth && <FormAlert tone="info">Demo mode: your account is stored only in this browser.</FormAlert>}
          <FormAlert>{error}</FormAlert>

          <FormField
            id="fullName"
            label="Full name"
            autoComplete="name"
            placeholder="Enter your full name"
            value={values.fullName}
            onChange={onChange}
            error={errors.fullName}
          />
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
          <FormField
            id="phone"
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="ex.09xx-xxx-xxxx"
            value={values.phone}
            onChange={onChange}
            error={errors.phone}
          />
          <FormField
            id="username"
            label="Username"
            autoComplete="username"
            placeholder="Username"
            helper="You can use letters, numbers & periods."
            value={values.username}
            onChange={onChange}
            error={errors.username}
          />
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            helper="Use 8 or more with a mix of letters, numbers and symbols."
            value={values.password}
            onChange={onChange}
            error={errors.password}
          />
          <PasswordField
            id="confirmPassword"
            label="Re-enter password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword}
          />

          <p className="text-center text-xs text-slate-500">
            Create your account to access cylinder information, safety alerts, and management tools in one place.
          </p>

          <Button type="submit" size="lg" fullWidth loading={pending === 'email'} disabled={Boolean(pending)}>
            Create account
          </Button>
          <OrDivider />
          <GoogleButton onClick={handleGoogle} loading={pending === 'google'} disabled={Boolean(pending)} />

          <p className="mt-2 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to={ROUTES.login} className="rounded font-semibold text-brand-500 hover:text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </CenteredAuthLayout>
  )
}

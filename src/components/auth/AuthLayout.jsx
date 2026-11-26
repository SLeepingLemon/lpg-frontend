import { Bell, Gauge } from 'lucide-react'
import { APP_NAME, APP_TAGLINE, COPYRIGHT } from '../../config/constants'
import Logo from '../common/Logo'

// Optional cylinder photo: drop `login-cylinders.(jpg|png|webp)` into src/assets/.
// If absent, the dark gradient alone is used — nothing breaks.
const photoModules = import.meta.glob('../../assets/login-cylinders.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const heroPhoto = Object.values(photoModules)[0]

function Brand() {
  return (
    <div>
      <Logo tone="light" className="size-12 text-lg" />
      <p className="mt-5 text-3xl font-bold tracking-tight text-white">{APP_NAME}</p>
      <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-white/75 uppercase">{APP_TAGLINE}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-white/20 bg-white/10 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-sm text-white/75">{text}</p>
      </div>
    </li>
  )
}

/** Login: brand panel on the left, form on the right (stacks on mobile). */
export function SplitAuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative isolate overflow-hidden bg-gradient-dark px-6 py-8 sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        {heroPhoto && (
          <>
            <img src={heroPhoto} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-brand-deep/80 mix-blend-multiply" />
          </>
        )}
        <Brand />

        <div className="mt-10 hidden lg:block">
          <h1 className="max-w-md text-4xl leading-tight font-bold tracking-tight text-white xl:text-5xl">
            Welcome back to smarter LPG management.
          </h1>
          <p className="mt-5 max-w-md text-base text-white/80">
            Sign in to view your cylinder status, review activity, and stay informed with important safety updates.
          </p>
          <ul className="mt-10 grid max-w-md gap-4">
            <FeatureCard icon={Gauge} title="Cylinder status at a glance" text="Track weight readings and receive timely updates." />
            <FeatureCard icon={Bell} title="Safety-focused notifications" text="Stay aware of important system events." />
          </ul>
        </div>

        <p className="mt-10 hidden text-xs font-semibold tracking-[0.14em] text-white/60 uppercase lg:block">{APP_NAME}</p>
      </aside>

      <main className="relative flex flex-col bg-brand-50">
        {/* Soft brand glows, matching the mockup's background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_28rem_at_85%_25%,rgb(242_94_110/0.14),transparent_70%),radial-gradient(32rem_24rem_at_15%_90%,rgb(219_110_122/0.14),transparent_70%)]"
        />
        <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">{children}</div>
        <footer className="relative px-6 pb-6 text-xs text-slate-500">{COPYRIGHT}</footer>
      </main>
    </div>
  )
}

/** Register: centred card on the dark gradient. */
export function CenteredAuthLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-dark">
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">{children}</main>
      <footer className="px-6 pb-6 text-xs text-white/70">{COPYRIGHT}</footer>
    </div>
  )
}

/** The form card itself — mostly solid with a subtle translucency. */
export function AuthCard({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <div
      className={`w-full rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-brand-700/10 backdrop-blur-sm sm:p-9 ${className}`}
    >
      <p className="text-xs font-bold tracking-[0.12em] text-brand-500 uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
      <div className="mt-7">{children}</div>
    </div>
  )
}

export function FormAlert({ tone = 'error', children }) {
  if (!children) return null
  const styles =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'info'
        ? 'border-sky-200 bg-sky-50 text-sky-900'
        : 'border-red-200 bg-red-50 text-red-800'
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  )
}

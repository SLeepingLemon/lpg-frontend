import { Link } from 'react-router-dom'
import Logo from '../components/common/Logo'
import { COPYRIGHT } from '../config/constants'
import { ROUTES } from '../config/routes'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <Logo />
        <p className="mt-8 text-sm font-bold tracking-[0.12em] text-brand-500 uppercase">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Page not found</h1>
        <p className="mt-2 max-w-sm text-slate-600">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link
          to={ROUTES.dashboard}
          className="bg-gradient-button mt-8 inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-[filter] hover:brightness-110"
        >
          Go to dashboard
        </Link>
      </main>
      <footer className="px-6 pb-6 text-center text-xs text-slate-500">{COPYRIGHT}</footer>
    </div>
  )
}

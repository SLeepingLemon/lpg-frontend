import Logo from './Logo'
import Spinner from './Spinner'

export default function FullScreenLoader({ label = 'Checking your session…' }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas">
      <Logo />
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner className="size-4 text-brand-500" label={label} />
        <span>{label}</span>
      </div>
    </div>
  )
}

import Spinner from './Spinner'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,box-shadow,filter,color] duration-150 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS = {
  // Gradient is reserved for the primary call to action.
  primary:
    'bg-gradient-button text-white shadow-md shadow-brand-500/25 hover:brightness-110 hover:shadow-lg hover:shadow-brand-500/30',
  secondary: 'border border-slate-300 bg-white text-ink hover:border-slate-400 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-ink',
  subtle: 'bg-brand-accent/14 text-brand-600 hover:bg-brand-accent/22',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Spinner className="size-4" label="Please wait" />}
      {children}
    </button>
  )
}

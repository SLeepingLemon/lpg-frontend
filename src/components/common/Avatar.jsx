import { getInitials } from '../../utils/formatters'

const SIZES = {
  sm: 'size-9 text-sm',
  lg: 'size-24 text-2xl',
}

/** Profile photo, or initials on a soft brand tint. Decorative: pair with a visible name. */
export default function Avatar({ name, photoURL, size = 'sm', className = '' }) {
  const sizing = SIZES[size] ?? SIZES.sm
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt=""
        referrerPolicy="no-referrer"
        className={`${sizing} shrink-0 rounded-full object-cover ring-1 ring-slate-200 ${className}`}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`${sizing} flex shrink-0 items-center justify-center rounded-full bg-brand-accent/14 font-semibold text-brand-600 ${className}`}
    >
      {getInitials(name)}
    </span>
  )
}

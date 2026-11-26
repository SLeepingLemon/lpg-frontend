/** "SL" logo mark. `tone="light"` for dark backgrounds. */
export default function Logo({ tone = 'brand', className = 'size-10 text-base' }) {
  const styles =
    tone === 'light'
      ? 'bg-white/15 text-white ring-1 ring-white/30'
      : 'bg-brand-500 text-white'
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-xl font-bold ${styles} ${className}`}>
      SL
    </span>
  )
}

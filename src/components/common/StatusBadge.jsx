import { CYLINDER_STATUS_META, SEVERITY_META } from './statusConfig'

/** Pill with icon + text. Pass either `status` (cylinder) or `severity` (alarm). */
export default function StatusBadge({ status, severity, size = 'sm' }) {
  const meta = status ? CYLINDER_STATUS_META[status] : SEVERITY_META[severity]
  if (!meta) return null
  const Icon = meta.icon
  const sizing = size === 'lg' ? 'gap-2 px-3 py-1.5 text-sm' : 'gap-1.5 px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap ring-1 ring-inset ${sizing} ${meta.badge}`}>
      <Icon className={size === 'lg' ? 'size-4' : 'size-3.5'} aria-hidden="true" />
      {meta.label}
    </span>
  )
}

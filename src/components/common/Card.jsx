export default function Card({ as: Tag = 'section', title, icon: Icon, action, className = '', children, ...props }) {
  const headingId = title ? `card-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined

  return (
    <Tag
      aria-labelledby={headingId}
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}
      {...props}
    >
      {title && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 id={headingId} className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {Icon && <Icon className="size-4 text-brand-500" aria-hidden="true" />}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </Tag>
  )
}

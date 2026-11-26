import { X } from 'lucide-react'
import { useEffect } from 'react'

/** Bottom-right message that auto-hides. `action` is an optional { label, onClick }. */
export default function Toast({ icon: Icon, title, message, action, onClose, durationMs = 8000 }) {
  useEffect(() => {
    if (!durationMs) return undefined
    const id = setTimeout(onClose, durationMs)
    return () => clearTimeout(id)
  }, [onClose, durationMs])

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-40 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
    >
      {Icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-accent/14 text-brand-600">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        {message && <p className="mt-0.5 text-sm text-slate-600">{message}</p>}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 rounded text-sm font-semibold text-brand-500 hover:text-brand-700"
          >
            {action.label}
          </button>
        )}
      </div>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="-m-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

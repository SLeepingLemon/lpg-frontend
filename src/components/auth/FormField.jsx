import { INPUT_CLASSES, inputStateClasses } from './inputStyles'

/** Labelled input with helper text and an accessible error message. */
export default function FormField({ id, label, error, helper, className = '', children, ...inputProps }) {
  const helperId = helper ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children ?? (
        <input
          id={id}
          name={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${INPUT_CLASSES} ${inputStateClasses(Boolean(error))}`}
          {...inputProps}
        />
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-slate-500">
          {helper}
        </p>
      )}
    </div>
  )
}

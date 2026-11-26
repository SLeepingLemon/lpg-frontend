import { useState } from 'react'
import FormField from './FormField'
import { INPUT_CLASSES, inputStateClasses } from './inputStyles'

/** Password input with a Show/Hide toggle. */
export default function PasswordField({ id, label, error, helper, className, ...inputProps }) {
  const [visible, setVisible] = useState(false)
  const helperId = helper && !error ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <FormField id={id} label={label} error={error} helper={helper} className={className}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          className={`${INPUT_CLASSES} ${inputStateClasses(Boolean(error))} pr-16`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-controls={id}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-1.5 right-1.5 rounded-lg px-3 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-accent/14 hover:text-brand-700"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </FormField>
  )
}

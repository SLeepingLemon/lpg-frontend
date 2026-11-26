import { RefreshCw, TriangleAlert } from 'lucide-react'
import Button from './Button'

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this data.',
  onRetry,
  retrying = false,
  className = '',
}) {
  return (
    <div role="alert" className={`flex flex-col items-center gap-3 px-4 py-10 text-center ${className}`}>
      <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-700">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} loading={retrying}>
          {!retrying && <RefreshCw className="size-4" aria-hidden="true" />}
          Retry
        </Button>
      )}
    </div>
  )
}

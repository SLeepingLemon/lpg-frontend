import { OctagonAlert, TriangleAlert, X } from 'lucide-react'
import { CRITICAL_LPG_THRESHOLD_PERCENT, LOW_LPG_THRESHOLD_PERCENT } from '../../config/constants'
import { formatKg, formatPercent } from '../../utils/formatters'

/** Shown when remaining LPG is at or below the low threshold. */
export default function LowLpgBanner({ percent, netKg, daysRemaining, onDismiss }) {
  const critical = percent <= CRITICAL_LPG_THRESHOLD_PERCENT
  const Icon = critical ? OctagonAlert : TriangleAlert
  const styles = critical ? 'border-red-300 bg-red-50 text-red-900' : 'border-amber-300 bg-amber-50 text-amber-900'

  return (
    <div role="alert" className={`flex items-start gap-3 rounded-2xl border px-4 py-4 sm:px-5 ${styles}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${critical ? 'text-red-700' : 'text-amber-700'}`} aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold">
          {critical ? 'Critical: LPG almost empty' : 'Low LPG'} — {formatPercent(percent)} ({formatKg(netKg)}) left
        </p>
        <p className="mt-0.5 text-sm opacity-90">
          {Number.isFinite(daysRemaining) ? `About ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining. ` : ''}
          Arrange a refill or replacement soon. Alert threshold: {LOW_LPG_THRESHOLD_PERCENT}%.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss low LPG notification"
        className="-m-1 rounded-lg p-1.5 transition-colors hover:bg-black/5"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

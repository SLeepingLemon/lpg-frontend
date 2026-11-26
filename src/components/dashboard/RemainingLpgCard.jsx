import { Gauge } from 'lucide-react'
import { CRITICAL_LPG_THRESHOLD_PERCENT, LOW_LPG_THRESHOLD_PERCENT } from '../../config/constants'
import { formatKg, formatPercent } from '../../utils/formatters'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'
import { CYLINDER_STATUS_META } from '../common/statusConfig'

export default function RemainingLpgCard({ percent, netKg, capacityKg, status, className = '' }) {
  const meta = CYLINDER_STATUS_META[status]
  const width = Number.isFinite(percent) ? percent : 0

  return (
    <Card title="Remaining LPG" icon={Gauge} action={<StatusBadge status={status} />} className={className}>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <p className="text-6xl font-bold tracking-tight text-ink tabular-nums">{formatPercent(percent)}</p>
        <p className="pb-2 text-lg text-slate-600">
          <span className="font-semibold text-ink tabular-nums">{formatKg(netKg)}</span> of {formatKg(capacityKg, 0)}
        </p>
      </div>

      <div className="mt-6">
        <div
          role="progressbar"
          aria-label="Remaining LPG"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(width)}
          aria-valuetext={`${formatPercent(percent)} remaining, ${formatKg(netKg)}`}
          className="relative h-4 overflow-hidden rounded-full bg-slate-100"
        >
          <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${meta?.bar ?? 'bg-slate-400'}`} style={{ width: `${width}%` }} />
          {/* Threshold markers */}
          {[CRITICAL_LPG_THRESHOLD_PERCENT, LOW_LPG_THRESHOLD_PERCENT].map((t) => (
            <span key={t} aria-hidden="true" className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${t}%` }} />
          ))}
        </div>
        <div className="relative mt-2 h-4 text-xs text-slate-500" aria-hidden="true">
          <span className="absolute left-0">Empty</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${LOW_LPG_THRESHOLD_PERCENT}%` }}>
            Low {LOW_LPG_THRESHOLD_PERCENT}%
          </span>
          <span className="absolute right-0">Full</span>
        </div>
      </div>
    </Card>
  )
}

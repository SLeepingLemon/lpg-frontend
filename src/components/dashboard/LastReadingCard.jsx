import { Clock, TriangleAlert } from 'lucide-react'
import { STALE_READING_MINUTES } from '../../config/constants'
import { formatDateTime, formatTimeAgo } from '../../utils/formatters'
import Card from '../common/Card'

export default function LastReadingCard({ grossKg, timestamp, isStale, now }) {
  return (
    <Card title="Last weight reading" icon={Clock}>
      <p className="text-4xl font-bold tracking-tight text-ink tabular-nums">
        {Number.isFinite(grossKg) ? grossKg.toFixed(1) : '—'}
        <span className="ml-2 text-lg font-medium text-slate-500">kg gross</span>
      </p>
      <p className="mt-1 text-sm text-slate-700">
        <span className="font-semibold">{formatTimeAgo(timestamp, now)}</span>
        <span className="text-slate-500"> · </span>
        <time dateTime={timestamp} className="text-slate-600">
          {formatDateTime(timestamp)}
        </time>
      </p>

      {isStale ? (
        <p role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
          <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
          Stale data: no new reading for over {STALE_READING_MINUTES} minutes. Values may be out of date.
        </p>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Live data. Readings older than {STALE_READING_MINUTES} min are flagged as stale.
        </p>
      )}
    </Card>
  )
}

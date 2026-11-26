import { Cylinder, RefreshCw } from 'lucide-react'
import { formatKg, formatPercent, formatShortDate, formatTimeAgo } from '../../utils/formatters'
import Card from '../common/Card'
import CylinderIllustration from './CylinderIllustration'

function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink tabular-nums">{children}</dd>
    </div>
  )
}

/**
 * Cylinder size/tare/install date. All values come from the device via the
 * backend, so they change on their own when a new cylinder is detected.
 */
export default function CylinderDetailsCard({ snapshot, percent, status, now }) {
  const { capacityKg, tareWeightKg, installedAt, label } = snapshot

  return (
    <Card title="Cylinder details" icon={Cylinder}>
      <div className="flex items-center gap-5">
        <CylinderIllustration percent={percent} status={status} className="h-44 w-auto shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{label}</p>
          <p className="text-sm text-slate-600">{formatPercent(percent)} full</p>
          <dl className="mt-2 divide-y divide-slate-100">
            <Row label="Size">{formatKg(capacityKg, 0)} LPG</Row>
            <Row label="Tare weight">{formatKg(tareWeightKg)}</Row>
            <Row label="Full weight">{formatKg(capacityKg + tareWeightKg)}</Row>
            <Row label="Installed">
              {formatShortDate(installedAt)}
              <span className="block text-xs font-normal text-slate-500">{formatTimeAgo(installedAt, now)}</span>
            </Row>
          </dl>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <RefreshCw className="size-3.5 shrink-0" aria-hidden="true" />
        Updated automatically when the device detects a new cylinder.
      </p>
    </Card>
  )
}

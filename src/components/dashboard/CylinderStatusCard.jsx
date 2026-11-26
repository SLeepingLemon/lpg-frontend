import { Activity } from 'lucide-react'
import { CYLINDER_STATUS } from '../../utils/lpgCalculations'
import Card from '../common/Card'
import { CYLINDER_STATUS_META } from '../common/statusConfig'

export default function CylinderStatusCard({ status, label, deviceId, className = '' }) {
  const meta = CYLINDER_STATUS_META[status]
  const Icon = meta.icon
  const urgent = status === CYLINDER_STATUS.CRITICAL

  return (
    <Card title="Cylinder status" icon={Activity} className={className}>
      <div className="flex items-start gap-4">
        <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset ${meta.badge}`}>
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <div>
          <p className={`text-2xl font-bold ${meta.tone}`}>{meta.label}</p>
          <p className={`mt-1 text-sm ${urgent ? 'font-medium text-red-800' : 'text-slate-600'}`}>{meta.description}</p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="text-xs text-slate-500">Cylinder</dt>
          <dd className="font-medium text-ink">{label}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <dt className="text-xs text-slate-500">Device</dt>
          <dd className="truncate font-mono text-xs leading-5 font-medium text-ink">{deviceId}</dd>
        </div>
      </dl>
    </Card>
  )
}

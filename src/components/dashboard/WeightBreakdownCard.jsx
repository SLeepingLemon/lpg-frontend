import { Scale } from 'lucide-react'
import { formatKg } from '../../utils/formatters'
import Card from '../common/Card'

function Row({ label, hint, value, emphasis = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt>
        <span className={emphasis ? 'font-semibold text-ink' : 'text-slate-700'}>{label}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </dt>
      <dd className={`tabular-nums ${emphasis ? 'text-2xl font-bold text-brand-500' : 'text-lg font-semibold text-ink'}`}>{value}</dd>
    </div>
  )
}

export default function WeightBreakdownCard({ grossKg, tareKg, netKg }) {
  return (
    <Card title="Weight breakdown" icon={Scale}>
      <dl className="divide-y divide-slate-100">
        <Row label="Gross weight" hint="Cylinder + gas, from the scale" value={formatKg(grossKg)} />
        <Row label="− Tare weight" hint="Empty cylinder" value={formatKg(tareKg)} />
        <Row label="= Net LPG" hint="Gas remaining" value={formatKg(netKg)} emphasis />
      </dl>
    </Card>
  )
}

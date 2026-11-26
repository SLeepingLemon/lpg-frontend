import { BellRing, CircleCheck, CircleDot, RefreshCw, TrendingDown, WifiOff } from 'lucide-react'
import { formatDateTime, formatTimeAgo } from '../../utils/formatters'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'
import StatusBadge from '../common/StatusBadge'

const ALARM_TYPES = {
  low_lpg: { label: 'Low LPG', icon: TrendingDown },
  sensor_offline: { label: 'Sensor offline', icon: WifiOff },
  cylinder_replaced: { label: 'Cylinder replaced', icon: RefreshCw },
}

function AlarmType({ type }) {
  const meta = ALARM_TYPES[type] ?? { label: type, icon: BellRing }
  const Icon = meta.icon
  return (
    <span className="inline-flex items-center gap-2 font-medium text-ink">
      <Icon className="size-4 text-slate-500" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

function AckState({ acknowledged }) {
  return acknowledged ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <CircleCheck className="size-3.5 text-emerald-600" aria-hidden="true" /> Acknowledged
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600">
      <CircleDot className="size-3.5" aria-hidden="true" /> Needs attention
    </span>
  )
}

export default function AlarmHistory({ alarms, now }) {
  const unacknowledged = alarms.filter((a) => !a.acknowledged).length

  return (
    <Card
      title="Alarms & detection history"
      icon={BellRing}
      action={
        unacknowledged > 0 && (
          <span className="rounded-full bg-brand-accent/14 px-2.5 py-1 text-xs font-semibold text-brand-600">
            {unacknowledged} new
          </span>
        )
      }
    >
      {alarms.length === 0 ? (
        <EmptyState icon={CircleCheck} title="No alarms recorded" message="Low LPG, device and cylinder events will appear here." />
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <div className="-mx-5 hidden overflow-x-auto sm:-mx-6 md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-slate-100 bg-slate-50/70 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3">Time</th>
                  <th scope="col" className="px-3 py-3">Type</th>
                  <th scope="col" className="px-3 py-3">Details</th>
                  <th scope="col" className="px-3 py-3">Severity</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alarms.map((alarm) => (
                  <tr key={alarm.id} className={alarm.acknowledged ? '' : 'bg-brand-accent/5'}>
                    <td className="px-6 py-3.5 align-top whitespace-nowrap">
                      <time dateTime={alarm.timestamp} className="block font-medium text-ink">
                        {formatTimeAgo(alarm.timestamp, now)}
                      </time>
                      <span className="text-xs text-slate-500">{formatDateTime(alarm.timestamp)}</span>
                    </td>
                    <td className="px-3 py-3.5 align-top whitespace-nowrap">
                      <AlarmType type={alarm.type} />
                    </td>
                    <td className="px-3 py-3.5 align-top text-slate-600">{alarm.message}</td>
                    <td className="px-3 py-3.5 align-top">
                      <StatusBadge severity={alarm.severity} />
                    </td>
                    <td className="px-6 py-3.5 align-top whitespace-nowrap">
                      <AckState acknowledged={alarm.acknowledged} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked list */}
          <ul className="-mx-5 divide-y divide-slate-100 border-t border-slate-100 md:hidden">
            {alarms.map((alarm) => (
              <li key={alarm.id} className={`px-5 py-4 ${alarm.acknowledged ? '' : 'bg-brand-accent/5'}`}>
                <div className="flex items-start justify-between gap-3">
                  <AlarmType type={alarm.type} />
                  <StatusBadge severity={alarm.severity} />
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{alarm.message}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <time dateTime={alarm.timestamp} className="text-xs text-slate-500">
                    {formatDateTime(alarm.timestamp)}
                  </time>
                  <AckState acknowledged={alarm.acknowledged} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}

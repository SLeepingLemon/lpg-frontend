import { CalendarDays } from 'lucide-react'
import Card from '../common/Card'

export default function EstimatedDaysCard({ daysRemaining, dailyUsageKg, periodDays, now }) {
  const hasEstimate = Number.isFinite(daysRemaining)
  const emptyDate = hasEstimate
    ? new Date(now + daysRemaining * 86_400_000).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
    : null

  return (
    <Card title="Estimated days left" icon={CalendarDays}>
      {hasEstimate ? (
        <>
          <p className="text-4xl font-bold tracking-tight text-ink tabular-nums">
            {daysRemaining}
            <span className="ml-2 text-lg font-medium text-slate-500">{daysRemaining === 1 ? 'day' : 'days'}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">Empty around {emptyDate}</p>
        </>
      ) : (
        <p className="text-sm text-slate-600">Not enough usage history to estimate yet.</p>
      )}
      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Based on {dailyUsageKg} kg/day average
        {periodDays ? ` over the last ${periodDays} days` : ''}.
      </p>
    </Card>
  )
}

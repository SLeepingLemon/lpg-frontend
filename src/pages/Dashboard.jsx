import { CloudOff, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import ErrorState from '../components/common/ErrorState'
import AlarmHistory from '../components/dashboard/AlarmHistory'
import CylinderDetailsCard from '../components/dashboard/CylinderDetailsCard'
import CylinderStatusCard from '../components/dashboard/CylinderStatusCard'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton'
import EstimatedDaysCard from '../components/dashboard/EstimatedDaysCard'
import LastReadingCard from '../components/dashboard/LastReadingCard'
import LowLpgBanner from '../components/dashboard/LowLpgBanner'
import RemainingLpgCard from '../components/dashboard/RemainingLpgCard'
import UsageChart from '../components/dashboard/UsageChart'
import WeightBreakdownCard from '../components/dashboard/WeightBreakdownCard'
import { useAuth } from '../hooks/useAuth'
import { useCylinderData } from '../hooks/useCylinderData'
import { useNow } from '../hooks/useNow'
import { formatTimeAgo } from '../utils/formatters'
import { CYLINDER_STATUS, deriveCylinderMetrics } from '../utils/lpgCalculations'

function RefreshIndicator({ lastUpdated, refreshing, onRefresh, now }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span aria-live="polite">
        {refreshing ? 'Updating…' : lastUpdated ? `Updated ${formatTimeAgo(lastUpdated, now)}` : ''}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Refresh data"
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white hover:text-ink disabled:opacity-60"
      >
        <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, loading, refreshing, error, lastUpdated, refresh } = useCylinderData()
  const now = useNow()
  // Dismissal is per severity level, so escalating from Low → Critical shows the banner again.
  const [dismissedLevel, setDismissedLevel] = useState(null)

  const metrics = data ? deriveCylinderMetrics(data.snapshot, data.usage, now) : null
  const bannerLevel = metrics?.isLow ? (metrics.status === CYLINDER_STATUS.CRITICAL ? 'critical' : 'low') : null

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Cylinder overview</h1>
            <p className="mt-1 text-sm text-slate-600">
              {data ? data.snapshot.label : 'Loading cylinder…'}
              {user?.isMock && <span className="ml-2 rounded bg-slate-200/70 px-1.5 py-0.5 text-xs font-medium text-slate-600">Demo data</span>}
            </p>
          </div>
          {data && <RefreshIndicator lastUpdated={lastUpdated} refreshing={refreshing} onRefresh={refresh} now={now} />}
        </div>

        {loading && !data && <DashboardSkeleton />}

        {!data && !loading && error && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ErrorState title="Couldn't load cylinder data" message={error.message} onRetry={refresh} retrying={refreshing} />
          </div>
        )}

        {metrics && (
          <div className="grid gap-5">
            {error && (
              <div role="status" className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <CloudOff className="size-4 text-slate-500" aria-hidden="true" />
                <span className="flex-1">Couldn&apos;t refresh. Showing the last data received.</span>
                <button type="button" onClick={refresh} className="rounded font-semibold text-brand-500 hover:text-brand-700">
                  Retry
                </button>
              </div>
            )}

            {bannerLevel && dismissedLevel !== bannerLevel && (
              <LowLpgBanner
                percent={metrics.percent}
                netKg={metrics.netKg}
                daysRemaining={metrics.daysRemaining}
                onDismiss={() => setDismissedLevel(bannerLevel)}
              />
            )}

            <div className="grid gap-5 lg:grid-cols-3">
              <RemainingLpgCard
                className="lg:col-span-2"
                percent={metrics.percent}
                netKg={metrics.netKg}
                capacityKg={metrics.capacityKg}
                status={metrics.status}
              />
              <CylinderStatusCard status={metrics.status} label={data.snapshot.label} deviceId={data.snapshot.deviceId} />

              <EstimatedDaysCard
                daysRemaining={metrics.daysRemaining}
                dailyUsageKg={metrics.dailyUsageKg}
                periodDays={data.usage?.periodDays}
                now={now}
              />
              <WeightBreakdownCard grossKg={metrics.grossKg} tareKg={metrics.tareKg} netKg={metrics.netKg} />
              <LastReadingCard grossKg={metrics.grossKg} timestamp={data.snapshot.lastReadingAt} isStale={metrics.isStale} now={now} />

              <CylinderDetailsCard snapshot={data.snapshot} percent={metrics.percent} status={metrics.status} now={now} />
              <UsageChart className="lg:col-span-2" history={data.usageHistory} />
            </div>

            <AlarmHistory alarms={data.alarms} now={now} />
          </div>
        )}
    </main>
  )
}

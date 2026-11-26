import { useCallback } from 'react'
import { DASHBOARD_POLL_INTERVAL_MS, USAGE_HISTORY_DAYS } from '../config/constants'
import { getAlarmHistory, getCylinderSnapshot, getUsageHistory, getUsageSummary } from '../services/lpgService'
import { usePolledResource } from './usePolledResource'

/**
 * Dashboard data: snapshot (incl. cylinder details), alarms, usage summary
 * and daily usage history. Returns { data, loading, refreshing, error, lastUpdated, refresh }.
 * Cylinder details update automatically because every refresh re-reads the snapshot.
 */
export function useCylinderData({ cylinderId, pollIntervalMs = DASHBOARD_POLL_INTERVAL_MS } = {}) {
  const fetcher = useCallback(async () => {
    const [snapshot, alarms, usage, usageHistory] = await Promise.all([
      getCylinderSnapshot(cylinderId),
      getAlarmHistory(cylinderId),
      getUsageSummary(cylinderId),
      getUsageHistory(cylinderId, USAGE_HISTORY_DAYS),
    ])
    return { snapshot, alarms, usage, usageHistory }
  }, [cylinderId])

  return usePolledResource(`cylinder:${cylinderId ?? 'default'}`, fetcher, { pollIntervalMs })
}

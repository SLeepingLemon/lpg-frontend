import {
  CRITICAL_LPG_THRESHOLD_PERCENT,
  DEFAULT_CYLINDER_CAPACITY_KG,
  DEFAULT_DAILY_USAGE_KG,
  DEFAULT_TARE_WEIGHT_KG,
  LOW_LPG_THRESHOLD_PERCENT,
  OFFLINE_READING_MINUTES,
  STALE_READING_MINUTES,
} from '../config/constants'

// Pure functions only — no React, no I/O — so they work with mock or real data.

export const CYLINDER_STATUS = {
  NORMAL: 'normal',
  LOW: 'low',
  CRITICAL: 'critical',
  OFFLINE: 'offline',
}

export const DEVICE_CONNECTION = {
  ONLINE: 'online',
  DELAYED: 'delayed',
  OFFLINE: 'offline',
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/** Net LPG = gross − tare, never negative. Returns null for invalid input. */
export function calculateNetWeight(grossKg, tareKg = DEFAULT_TARE_WEIGHT_KG) {
  if (!Number.isFinite(grossKg) || !Number.isFinite(tareKg)) return null
  return Math.max(0, round(grossKg - tareKg, 2))
}

/** Remaining LPG as 0–100 % of capacity. */
export function calculateRemainingPercent(netKg, capacityKg = DEFAULT_CYLINDER_CAPACITY_KG) {
  if (!Number.isFinite(netKg) || !Number.isFinite(capacityKg) || capacityKg <= 0) return null
  return round(clamp((netKg / capacityKg) * 100, 0, 100), 1)
}

/** Days until empty at the given average usage. Returns null if usage is unknown or zero. */
export function estimateDaysRemaining(netKg, dailyUsageKg = DEFAULT_DAILY_USAGE_KG) {
  if (!Number.isFinite(netKg) || !Number.isFinite(dailyUsageKg) || dailyUsageKg <= 0) return null
  return Math.floor(Math.max(0, netKg) / dailyUsageKg)
}

/** Minutes since the reading, or null for an invalid timestamp. */
export function minutesSince(timestamp, now = Date.now()) {
  const time = new Date(timestamp).getTime()
  if (Number.isNaN(time)) return null
  return Math.max(0, (now - time) / 60_000)
}

export function isReadingStale(timestamp, now = Date.now(), staleMinutes = STALE_READING_MINUTES) {
  const minutes = minutesSince(timestamp, now)
  return minutes === null || minutes > staleMinutes
}

/** Device connection from its last-seen time: online → delayed → offline. */
export function getDeviceConnection(
  lastSeenAt,
  now = Date.now(),
  staleMinutes = STALE_READING_MINUTES,
  offlineMinutes = OFFLINE_READING_MINUTES,
) {
  const minutes = minutesSince(lastSeenAt, now)
  if (minutes === null || minutes > offlineMinutes) return DEVICE_CONNECTION.OFFLINE
  if (minutes > staleMinutes) return DEVICE_CONNECTION.DELAYED
  return DEVICE_CONNECTION.ONLINE
}

/** Average kg/day over a usage history ([{ date, usedKg }]). Null when empty. */
export function averageDailyUsage(history) {
  const values = (history ?? []).map((d) => d.usedKg).filter(Number.isFinite)
  if (!values.length) return null
  return round(values.reduce((sum, v) => sum + v, 0) / values.length, 2)
}

/**
 * Overall cylinder status. Priority: offline > critical > low > normal.
 * (Offline wins because an old reading can't be trusted for the level.)
 */
export function determineCylinderStatus({
  percent,
  lastReadingAt,
  now = Date.now(),
  lowThreshold = LOW_LPG_THRESHOLD_PERCENT,
  criticalThreshold = CRITICAL_LPG_THRESHOLD_PERCENT,
  offlineMinutes = OFFLINE_READING_MINUTES,
}) {
  const minutes = minutesSince(lastReadingAt, now)
  if (minutes === null || minutes > offlineMinutes) return CYLINDER_STATUS.OFFLINE
  if (!Number.isFinite(percent)) return CYLINDER_STATUS.OFFLINE
  if (percent <= criticalThreshold) return CYLINDER_STATUS.CRITICAL
  if (percent <= lowThreshold) return CYLINDER_STATUS.LOW
  return CYLINDER_STATUS.NORMAL
}

export function isLowLpg(percent, threshold = LOW_LPG_THRESHOLD_PERCENT) {
  return Number.isFinite(percent) && percent <= threshold
}

/** Derive everything the dashboard needs from a raw snapshot + usage summary. */
export function deriveCylinderMetrics(snapshot, usage, now = Date.now()) {
  const tareKg = snapshot.tareWeightKg ?? DEFAULT_TARE_WEIGHT_KG
  const capacityKg = snapshot.capacityKg ?? DEFAULT_CYLINDER_CAPACITY_KG
  const dailyUsageKg = usage?.averageDailyUsageKg ?? DEFAULT_DAILY_USAGE_KG

  const netKg = calculateNetWeight(snapshot.grossWeightKg, tareKg)
  const percent = calculateRemainingPercent(netKg, capacityKg)

  return {
    grossKg: snapshot.grossWeightKg,
    tareKg,
    capacityKg,
    netKg,
    percent,
    dailyUsageKg,
    daysRemaining: estimateDaysRemaining(netKg, dailyUsageKg),
    isStale: isReadingStale(snapshot.lastReadingAt, now),
    isLow: isLowLpg(percent),
    status: determineCylinderStatus({ percent, lastReadingAt: snapshot.lastReadingAt, now }),
  }
}

function round(value, decimals) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

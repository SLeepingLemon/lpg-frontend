import { describe, expect, it } from 'vitest'
import {
  CYLINDER_STATUS,
  DEVICE_CONNECTION,
  averageDailyUsage,
  calculateNetWeight,
  calculateRemainingPercent,
  deriveCylinderMetrics,
  determineCylinderStatus,
  estimateDaysRemaining,
  getDeviceConnection,
  isLowLpg,
  isReadingStale,
} from './lpgCalculations'

const NOW = Date.parse('2026-11-26T12:00:00Z')
const minutesAgo = (m) => new Date(NOW - m * 60_000).toISOString()

describe('calculateNetWeight', () => {
  it('subtracts tare from gross', () => {
    expect(calculateNetWeight(20.2, 14)).toBe(6.2)
  })
  it('never returns a negative weight', () => {
    expect(calculateNetWeight(13.5, 14)).toBe(0)
  })
  it('returns null for invalid input', () => {
    expect(calculateNetWeight(undefined, 14)).toBeNull()
    expect(calculateNetWeight(NaN, 14)).toBeNull()
  })
})

describe('calculateRemainingPercent', () => {
  it('computes percent of capacity', () => {
    expect(calculateRemainingPercent(6.2, 11)).toBe(56.4)
  })
  it('clamps to 0–100', () => {
    expect(calculateRemainingPercent(12, 11)).toBe(100)
    expect(calculateRemainingPercent(-1, 11)).toBe(0)
  })
  it('returns null for zero capacity', () => {
    expect(calculateRemainingPercent(5, 0)).toBeNull()
  })
})

describe('estimateDaysRemaining', () => {
  it('floors net / daily usage', () => {
    expect(estimateDaysRemaining(6.2, 0.35)).toBe(17)
  })
  it('returns null when usage is zero', () => {
    expect(estimateDaysRemaining(6.2, 0)).toBeNull()
  })
  it('falls back to the default daily usage when undefined', () => {
    expect(estimateDaysRemaining(6.2, undefined)).toBe(17) // 0.35 kg/day
  })
})

describe('isReadingStale', () => {
  it('flags readings older than the limit', () => {
    expect(isReadingStale(minutesAgo(5), NOW, 15)).toBe(false)
    expect(isReadingStale(minutesAgo(16), NOW, 15)).toBe(true)
  })
  it('treats invalid timestamps as stale', () => {
    expect(isReadingStale('not-a-date', NOW)).toBe(true)
  })
})

describe('determineCylinderStatus', () => {
  const base = { lastReadingAt: minutesAgo(2), now: NOW, lowThreshold: 20, criticalThreshold: 10, offlineMinutes: 60 }

  it('returns normal / low / critical by percent (thresholds inclusive)', () => {
    expect(determineCylinderStatus({ ...base, percent: 56 })).toBe(CYLINDER_STATUS.NORMAL)
    expect(determineCylinderStatus({ ...base, percent: 20 })).toBe(CYLINDER_STATUS.LOW)
    expect(determineCylinderStatus({ ...base, percent: 10 })).toBe(CYLINDER_STATUS.CRITICAL)
  })
  it('returns offline when the reading is too old', () => {
    expect(determineCylinderStatus({ ...base, percent: 56, lastReadingAt: minutesAgo(61) })).toBe(CYLINDER_STATUS.OFFLINE)
  })
  it('gives offline priority over the gas level', () => {
    expect(determineCylinderStatus({ ...base, percent: 5, lastReadingAt: minutesAgo(120) })).toBe(CYLINDER_STATUS.OFFLINE)
  })
})

describe('getDeviceConnection', () => {
  it('moves from online → delayed → offline as the last-seen time ages', () => {
    expect(getDeviceConnection(minutesAgo(1), NOW, 10, 15)).toBe(DEVICE_CONNECTION.ONLINE)
    expect(getDeviceConnection(minutesAgo(11), NOW, 10, 15)).toBe(DEVICE_CONNECTION.DELAYED)
    expect(getDeviceConnection(minutesAgo(16), NOW, 10, 15)).toBe(DEVICE_CONNECTION.OFFLINE)
  })
  it('treats a missing timestamp as offline', () => {
    expect(getDeviceConnection(null, NOW)).toBe(DEVICE_CONNECTION.OFFLINE)
  })
})

describe('averageDailyUsage', () => {
  it('averages usedKg and ignores invalid entries', () => {
    expect(averageDailyUsage([{ usedKg: 0.3 }, { usedKg: 0.4 }, { usedKg: null }])).toBe(0.35)
  })
  it('returns null for an empty history', () => {
    expect(averageDailyUsage([])).toBeNull()
  })
})

describe('isLowLpg', () => {
  it('is inclusive of the threshold', () => {
    expect(isLowLpg(20, 20)).toBe(true)
    expect(isLowLpg(20.1, 20)).toBe(false)
    expect(isLowLpg(null, 20)).toBe(false)
  })
})

describe('deriveCylinderMetrics', () => {
  it('derives all dashboard values from the mock-shaped snapshot', () => {
    const metrics = deriveCylinderMetrics(
      { grossWeightKg: 20.2, tareWeightKg: 14, capacityKg: 11, lastReadingAt: minutesAgo(3) },
      { averageDailyUsageKg: 0.35 },
      NOW,
    )
    expect(metrics).toMatchObject({
      netKg: 6.2,
      percent: 56.4,
      daysRemaining: 17,
      isStale: false,
      isLow: false,
      status: CYLINDER_STATUS.NORMAL,
    })
  })
})

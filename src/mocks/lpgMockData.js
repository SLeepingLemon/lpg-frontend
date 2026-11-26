// Realistic mock payloads, shaped like the planned Express API responses.
// Only services may import this file.

const MINUTE = 60_000
const DAY = 86_400_000
const minutesAgo = (m) => new Date(Date.now() - m * MINUTE).toISOString()
const hoursAgo = (h) => minutesAgo(h * 60)
const daysAgo = (d) => minutesAgo(d * 24 * 60)

/**
 * Latest reading. Cylinder details (capacity, tare, installedAt) come from
 * the device/backend too, so the UI updates them automatically on refresh.
 */
export function buildCylinderSnapshot() {
  return {
    cylinderId: 'cyl-001',
    label: 'Kitchen cylinder',
    deviceId: 'esp32-lpg-01',
    capacityKg: 11,
    tareWeightKg: 14.0,
    grossWeightKg: 20.2,
    installedAt: daysAgo(14),
    lastReadingAt: minutesAgo(3),
  }
}

export function buildUsageSummary() {
  return {
    cylinderId: 'cyl-001',
    averageDailyUsageKg: 0.35,
    periodDays: 14,
  }
}

/** Deterministic "random" in [0, 1) from an integer seed, so values stay stable between polls. */
function seeded(n) {
  const x = Math.sin(n * 12.9898) * 43_758.5453
  return x - Math.floor(x)
}

/** Daily kg used for the last `days` full days (oldest first, today excluded). */
export function buildUsageHistory(days = 30) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getTime() - (days - i) * DAY)
    const dayNumber = Math.floor(date.getTime() / DAY)
    const weekend = date.getDay() === 0 || date.getDay() === 6
    const usedKg = 0.22 + seeded(dayNumber) * 0.22 + (weekend ? 0.08 : 0)
    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return { date: isoDate, usedKg: Math.round(usedKg * 100) / 100 }
  })
}

export function buildDeviceStatus() {
  return {
    deviceId: 'esp32-lpg-01',
    name: 'Kitchen scale',
    lastSeenAt: minutesAgo(1),
    firmwareVersion: '0.3.1',
    uptimeSeconds: 3 * 86_400 + 4 * 3600 + 12 * 60,
    publishIntervalSeconds: 300,
    ipAddress: '192.168.1.42',
  }
}

export function buildAlarmHistory() {
  return [
    {
      id: 'alm-005',
      type: 'sensor_offline',
      severity: 'warning',
      message: 'No reading received from esp32-lpg-01 for 22 minutes.',
      timestamp: hoursAgo(5),
      acknowledged: false,
    },
    {
      id: 'alm-004',
      type: 'sensor_offline',
      severity: 'warning',
      message: 'No reading received from esp32-lpg-01 for 41 minutes (power outage).',
      timestamp: hoursAgo(52),
      acknowledged: true,
    },
    {
      id: 'alm-003',
      type: 'cylinder_replaced',
      severity: 'info',
      message: 'New 11 kg cylinder detected (gross 25.0 kg).',
      timestamp: daysAgo(14),
      acknowledged: true,
    },
    {
      id: 'alm-002',
      type: 'low_lpg',
      severity: 'critical',
      message: 'Remaining LPG fell to 9% (1.0 kg).',
      timestamp: hoursAgo(24 * 14 + 6),
      acknowledged: true,
    },
    {
      id: 'alm-001',
      type: 'low_lpg',
      severity: 'warning',
      message: 'Remaining LPG fell to 20% (2.2 kg).',
      timestamp: daysAgo(17),
      acknowledged: true,
    },
  ]
}

/** Seed notifications for a new (mock) user. */
export function buildNotifications() {
  return [
    {
      id: 'ntf-006',
      type: 'device_online',
      title: 'Device back online',
      message: 'esp32-lpg-01 is reporting again.',
      createdAt: hoursAgo(4.5),
      read: false,
    },
    {
      id: 'ntf-005',
      type: 'device_offline',
      title: 'Device offline',
      message: 'No reading from esp32-lpg-01 for 22 minutes. Check power and Wi-Fi.',
      createdAt: hoursAgo(5),
      read: false,
    },
    {
      id: 'ntf-003',
      type: 'cylinder_replaced',
      title: 'Cylinder replaced',
      message: 'A new 11 kg cylinder was detected. Cylinder details were updated.',
      createdAt: daysAgo(14),
      read: true,
    },
    {
      id: 'ntf-002',
      type: 'critical_lpg',
      title: 'Critical LPG level',
      message: 'Only 9% (1.0 kg) left. Replace the cylinder now.',
      createdAt: hoursAgo(24 * 14 + 6),
      read: true,
    },
    {
      id: 'ntf-001',
      type: 'low_lpg',
      title: 'Low LPG',
      message: 'Remaining LPG fell to 20% (2.2 kg).',
      createdAt: daysAgo(17),
      read: true,
    },
  ]
}

import {
  buildAlarmHistory,
  buildCylinderSnapshot,
  buildDeviceStatus,
  buildUsageHistory,
  buildUsageSummary,
} from '../mocks/lpgMockData'
// import { apiClient } from './apiClient'   // ← uncomment when the Express API is ready

/**
 * Data functions used by the UI. They currently return mock data after a
 * short delay. Replace each body with the apiClient call shown in its
 * TODO(backend) comment — the return shapes must stay the same.
 */

const DEFAULT_CYLINDER_ID = 'cyl-001'
const DEFAULT_DEVICE_ID = 'esp32-lpg-01'
const MOCK_DELAY_MS = 450

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Latest weight reading for a cylinder, including its details (capacity, tare,
 * installedAt). The backend updates the details when the ESP32 reports a new
 * cylinder, so the dashboard picks them up on its next refresh.
 * @returns {Promise<{cylinderId, label, deviceId, capacityKg, tareWeightKg, grossWeightKg, installedAt, lastReadingAt}>}
 */
export async function getCylinderSnapshot(cylinderId = DEFAULT_CYLINDER_ID) {
  // TODO(backend): return apiClient.get(`/api/cylinders/${cylinderId}/latest`)
  void cylinderId
  await delay(MOCK_DELAY_MS)
  return buildCylinderSnapshot()
}

/**
 * Alarm / detection history, newest first.
 * @returns {Promise<Array<{id, type, severity, message, timestamp, acknowledged}>>}
 */
export async function getAlarmHistory(cylinderId = DEFAULT_CYLINDER_ID) {
  // TODO(backend): return apiClient.get(`/api/cylinders/${cylinderId}/alarms?limit=20`)
  void cylinderId
  await delay(MOCK_DELAY_MS)
  return buildAlarmHistory().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

/**
 * Usage statistics used for the days-remaining estimate.
 * @returns {Promise<{cylinderId, averageDailyUsageKg, periodDays}>}
 */
export async function getUsageSummary(cylinderId = DEFAULT_CYLINDER_ID) {
  // TODO(backend): return apiClient.get(`/api/cylinders/${cylinderId}/usage?days=14`)
  void cylinderId
  await delay(MOCK_DELAY_MS)
  return buildUsageSummary()
}

/**
 * kg of LPG used per day for the last `days` full days, oldest first.
 * @returns {Promise<Array<{date: 'YYYY-MM-DD', usedKg: number}>>}
 */
export async function getUsageHistory(cylinderId = DEFAULT_CYLINDER_ID, days = 30) {
  // TODO(backend): return apiClient.get(`/api/cylinders/${cylinderId}/usage/daily?days=${days}`)
  void cylinderId
  await delay(MOCK_DELAY_MS)
  return buildUsageHistory(days)
}

/**
 * ESP32 health. `lastSeenAt` should update on every message (reading or heartbeat).
 * @returns {Promise<{deviceId, name, lastSeenAt, firmwareVersion, uptimeSeconds, publishIntervalSeconds, ipAddress}>}
 */
export async function getDeviceStatus(deviceId = DEFAULT_DEVICE_ID) {
  // TODO(backend): return apiClient.get(`/api/devices/${deviceId}/status`)
  void deviceId
  await delay(MOCK_DELAY_MS)
  return buildDeviceStatus()
}

// TODO(backend): acknowledgeAlarm(alarmId) → apiClient.patch(`/api/alarms/${alarmId}`, { acknowledged: true })

import { buildNotifications } from '../mocks/lpgMockData'
// import { apiClient } from './apiClient'   // ← uncomment when the Express API is ready

/**
 * In-website notifications (no SMS / push). The backend will create them when
 * it detects low/critical LPG, device offline/online, or a cylinder change.
 *
 * Mock: stored per user in localStorage so read state survives reloads.
 * Shape: { id, type, title, message, createdAt, read }
 *   type: low_lpg | critical_lpg | device_offline | device_online | cylinder_replaced | profile_updated
 */

const MOCK_DELAY_MS = 300
const storageKey = (uid) => `smartlpg.mock.notifications.${uid}`
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function readStore(uid) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(uid)) ?? 'null')
    if (Array.isArray(stored)) return stored
  } catch {
    // fall through to seed data
  }
  const seeded = buildNotifications()
  writeStore(uid, seeded)
  return seeded
}

function writeStore(uid, list) {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(list.slice(0, 50)))
  } catch {
    // storage unavailable: notifications still work for this session
  }
}

const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)

export async function getNotifications(uid) {
  // TODO(backend): return apiClient.get('/api/notifications?limit=50')
  await delay(MOCK_DELAY_MS)
  return [...readStore(uid)].sort(newestFirst)
}

export async function markNotificationRead(uid, id) {
  // TODO(backend): return apiClient.patch(`/api/notifications/${id}`, { read: true })
  writeStore(uid, readStore(uid).map((n) => (n.id === id ? { ...n, read: true } : n)))
}

export async function markAllNotificationsRead(uid) {
  // TODO(backend): return apiClient.post('/api/notifications/read-all')
  writeStore(uid, readStore(uid).map((n) => ({ ...n, read: true })))
}

/**
 * Mock-only: add a notification from the client (e.g. "Profile updated").
 * TODO(backend): remove — the backend creates notifications itself.
 */
export async function addNotification(uid, { type, title, message }) {
  const notification = {
    id: `ntf-${Date.now()}`,
    type,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  }
  writeStore(uid, [notification, ...readStore(uid)])
  return notification
}

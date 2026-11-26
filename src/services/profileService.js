// import { apiClient } from './apiClient'   // ← uncomment when the Express API is ready

/**
 * User profile: { fullName, username, phone, email, photoURL, updatedAt }.
 *
 * Firebase Auth only stores email + displayName, so the rest needs the
 * backend. Until then profiles are kept in this browser's localStorage, keyed
 * by user id, in BOTH mock and Firebase mode.
 *
 * TODO(backend):
 *   getProfile    → apiClient.get('/api/users/me')
 *   saveProfile   → apiClient.post('/api/users', profile)          (on register)
 *   updateProfile → apiClient.patch('/api/users/me', changes)
 *   photo upload  → apiClient.post('/api/users/me/photo', formData) or Firebase Storage
 *   username uniqueness must be enforced server-side.
 */

const STORAGE_KEY = 'smartlpg.profiles'
const MOCK_DELAY_MS = 400
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

function writeAll(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch (err) {
    const error = new Error('Could not save your profile in this browser (storage full or blocked).')
    error.code = 'profile/storage-failed'
    error.cause = err
    throw error
  }
}

function profileError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

/** Profile for an auth user, falling back to what auth knows. */
export async function getProfile(user) {
  const stored = readAll()[user.uid] ?? {}
  return {
    fullName: stored.fullName ?? user.displayName ?? '',
    username: stored.username ?? '',
    phone: stored.phone ?? '',
    email: user.email ?? stored.email ?? '',
    // A stored null means "photo removed", so only fall back when never set.
    photoURL: 'photoURL' in stored ? stored.photoURL : (user.photoURL ?? null),
    updatedAt: stored.updatedAt ?? null,
  }
}

export async function isUsernameAvailable(username, exceptUid) {
  const wanted = username.trim().toLowerCase()
  return !Object.entries(readAll()).some(
    ([uid, p]) => uid !== exceptUid && p.username?.toLowerCase() === wanted,
  )
}

async function assertUsernameAvailable(username, uid) {
  if (username && !(await isUsernameAvailable(username, uid))) {
    throw profileError('profile/username-taken', 'That username is already taken.')
  }
}

/** Called right after registration. */
export async function saveProfile(uid, profile) {
  const all = readAll()
  all[uid] = { ...all[uid], ...profile, updatedAt: new Date().toISOString() }
  writeAll(all)
}

/** Update some fields. Pass photoURL: null to remove the photo. */
export async function updateProfile(user, changes) {
  await delay(MOCK_DELAY_MS)
  await assertUsernameAvailable(changes.username, user.uid)
  const all = readAll()
  all[user.uid] = { ...all[user.uid], ...changes, updatedAt: new Date().toISOString() }
  writeAll(all)
  return getProfile(user)
}

export { assertUsernameAvailable }

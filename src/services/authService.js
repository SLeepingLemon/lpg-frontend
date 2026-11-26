import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, useMockAuth } from '../config/firebase'

/**
 * The ONLY module that talks to Firebase Auth.
 * Every function returns a plain, normalised user object:
 *   { uid, email, displayName, photoURL, isMock }
 *
 * When Firebase is not configured (or VITE_USE_MOCK_AUTH=true), a mock
 * implementation backed by localStorage/sessionStorage is used instead.
 */

export const isMockAuth = useMockAuth || !auth

if (isMockAuth) {
  console.warn(
    '[Smart LPG] Mock auth mode is ACTIVE. Any email/password will sign in and no data leaves the browser. ' +
      'Set the VITE_FIREBASE_* variables and VITE_USE_MOCK_AUTH=false to use Firebase.',
  )
}

function normalizeUser(user) {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL ?? null,
    isMock: Boolean(user.isMock),
  }
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

const MOCK_SESSION_KEY = 'smartlpg.mock.session'
const MOCK_DELAY_MS = 600

const mockListeners = new Set()
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function safeStorage(kind) {
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

function readJson(storage, key) {
  try {
    return JSON.parse(storage?.getItem(key) ?? 'null')
  } catch {
    return null
  }
}

function readMockSession() {
  return readJson(safeStorage('local'), MOCK_SESSION_KEY) ?? readJson(safeStorage('session'), MOCK_SESSION_KEY)
}

function writeMockSession(user, remember) {
  safeStorage('local')?.removeItem(MOCK_SESSION_KEY)
  safeStorage('session')?.removeItem(MOCK_SESSION_KEY)
  if (user) safeStorage(remember ? 'local' : 'session')?.setItem(MOCK_SESSION_KEY, JSON.stringify(user))
  mockListeners.forEach((cb) => cb(normalizeUser(user)))
}

function mockUser(email, displayName) {
  return { uid: `mock-${email.toLowerCase()}`, email, displayName, photoURL: null, isMock: true }
}

const mockAuth = {
  async signInWithEmail(email, _password, remember) {
    await wait(MOCK_DELAY_MS)
    // Full name comes from profileService (merged in AuthContext).
    const user = mockUser(email)
    writeMockSession(user, remember)
    return normalizeUser(user)
  },
  async registerWithEmail({ fullName, email }) {
    await wait(MOCK_DELAY_MS)
    const user = mockUser(email, fullName)
    writeMockSession(user, true)
    return normalizeUser(user)
  },
  async signInWithGoogle(remember) {
    await wait(MOCK_DELAY_MS)
    const user = mockUser('demo.user@gmail.com', 'Demo User')
    writeMockSession(user, remember)
    return normalizeUser(user)
  },
  async signOutUser() {
    writeMockSession(null)
  },
  async sendPasswordReset() {
    await wait(MOCK_DELAY_MS)
  },
  async updateDisplayName(displayName) {
    for (const kind of ['local', 'session']) {
      const session = readJson(safeStorage(kind), MOCK_SESSION_KEY)
      if (session) safeStorage(kind).setItem(MOCK_SESSION_KEY, JSON.stringify({ ...session, displayName }))
    }
  },
  subscribeToAuthState(callback) {
    mockListeners.add(callback)
    // Async like Firebase, so consumers always see an initial `loading` state.
    queueMicrotask(() => callback(normalizeUser(readMockSession())))
    return () => mockListeners.delete(callback)
  },
  async getIdToken() {
    return null
  },
}

// ---------------------------------------------------------------------------
// Firebase implementation
// ---------------------------------------------------------------------------

async function applyPersistence(remember) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
}

const firebaseAuth = {
  async signInWithEmail(email, password, remember) {
    await applyPersistence(remember)
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    // TODO(2fa): if a second factor is added later (e.g. TOTP via Firebase MFA),
    // catch `auth/multi-factor-auth-required` here and route to a verification step.
    return normalizeUser(user)
  },

  async registerWithEmail({ fullName, phone, username, email, password }) {
    await applyPersistence(true)
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: fullName })

    // Phone + username are saved by AuthContext via profileService
    // (see TODO(backend) there). Firebase Auth only stores email + displayName.
    void phone
    void username

    return normalizeUser({ ...user, displayName: fullName })
  },

  async signInWithGoogle(remember) {
    await applyPersistence(remember)
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const { user } = await signInWithPopup(auth, provider)
    // TODO(backend): on first Google sign-in, create the user profile record
    // (phone/username are unknown — prompt for them on a later "complete profile" page).
    return normalizeUser(user)
  },

  async signOutUser() {
    await signOut(auth)
  },

  async sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email)
  },

  async updateDisplayName(displayName) {
    if (auth.currentUser) await updateProfile(auth.currentUser, { displayName })
  },

  subscribeToAuthState(callback) {
    return onAuthStateChanged(auth, (user) => callback(normalizeUser(user)))
  },

  async getIdToken() {
    return auth.currentUser ? auth.currentUser.getIdToken() : null
  },
}

const impl = isMockAuth ? mockAuth : firebaseAuth

export const signInWithEmail = (email, password, remember = true) => impl.signInWithEmail(email, password, remember)
export const registerWithEmail = (profile) => impl.registerWithEmail(profile)
export const signInWithGoogle = (remember = true) => impl.signInWithGoogle(remember)
export const signOutUser = () => impl.signOutUser()
export const sendPasswordReset = (email) => impl.sendPasswordReset(email)
export const updateDisplayName = (displayName) => impl.updateDisplayName(displayName)
export const subscribeToAuthState = (callback) => impl.subscribeToAuthState(callback)
/** Firebase ID token for the backend (`Authorization: Bearer <token>`), or null. */
export const getIdToken = () => impl.getIdToken()

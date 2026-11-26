import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

/**
 * Firebase is initialised from VITE_FIREBASE_* env vars.
 * When they are missing (or VITE_USE_MOCK_AUTH=true) we export `null`
 * and authService falls back to mock auth instead of crashing.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId']

export const isFirebaseConfigured = REQUIRED_KEYS.every((key) => Boolean(firebaseConfig[key]))

export const useMockAuth =
  import.meta.env.VITE_USE_MOCK_AUTH === 'true' || !isFirebaseConfigured

let app = null
let auth = null

if (!useMockAuth) {
  try {
    app = getApps()[0] ?? initializeApp(firebaseConfig)
    auth = getAuth(app)
  } catch (err) {
    console.error('[Smart LPG] Firebase failed to initialise. Falling back to mock auth.', err)
    app = null
    auth = null
  }
}

export { app, auth }

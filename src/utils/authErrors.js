// Firebase Auth error codes → user-friendly messages.
const MESSAGES = {
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-login-credentials': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use 8+ characters with letters, numbers and symbols.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled yet.',
  'auth/unauthorized-domain': 'This domain is not authorised for sign-in. Add it in Firebase settings.',
  'auth/missing-email': 'Enter your email address first.',
  'profile/username-taken': 'That username is already taken. Try another one.',
  'profile/storage-failed': 'Could not save your profile. Try a smaller photo or free up browser storage.',
}

export const DEFAULT_AUTH_ERROR = 'Something went wrong. Please try again.'

export function getAuthErrorMessage(error) {
  if (!error) return ''
  return MESSAGES[error.code] ?? error.friendlyMessage ?? DEFAULT_AUTH_ERROR
}

/** Errors that should not be shown as a red banner (user just closed a popup). */
export function isSilentAuthError(error) {
  return error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request'
}

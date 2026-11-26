import { PASSWORD_MIN_LENGTH } from '../config/constants'

// Each validator returns an error message string, or '' when valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// PH mobile: 09XXXXXXXXX, optionally with dashes/spaces, or +639XXXXXXXXX
const PH_MOBILE_RE = /^(09|\+639)\d{9}$/
const USERNAME_RE = /^[A-Za-z0-9.]{3,30}$/

export function validateRequired(value, label = 'This field') {
  return String(value ?? '').trim() ? '' : `${label} is required.`
}

export function validateEmail(value) {
  const v = String(value ?? '').trim()
  if (!v) return 'Email address is required.'
  return EMAIL_RE.test(v) ? '' : 'Enter a valid email address.'
}

export function validateFullName(value) {
  const v = String(value ?? '').trim()
  if (!v) return 'Full name is required.'
  return v.length >= 2 ? '' : 'Enter your full name.'
}

export function normalizePhone(value) {
  return String(value ?? '').replace(/[\s-]/g, '')
}

export function validatePhone(value) {
  const v = normalizePhone(value)
  if (!v) return 'Mobile number is required.'
  return PH_MOBILE_RE.test(v) ? '' : 'Enter a valid mobile number (ex. 0917-123-4567).'
}

export function validateUsername(value) {
  const v = String(value ?? '').trim()
  if (!v) return 'Username is required.'
  if (!USERNAME_RE.test(v)) return 'Use 3–30 letters, numbers or periods.'
  if (v.startsWith('.') || v.endsWith('.') || v.includes('..')) {
    return 'Periods cannot be at the start, end, or repeated.'
  }
  return ''
}

/** Register password rule: min length + letters + numbers + symbols. */
export function validateNewPassword(value) {
  const v = String(value ?? '')
  if (!v) return 'Password is required.'
  if (v.length < PASSWORD_MIN_LENGTH) return `Use ${PASSWORD_MIN_LENGTH} or more characters.`
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v) || !/[^A-Za-z0-9]/.test(v)) {
    return 'Use a mix of letters, numbers and symbols.'
  }
  return ''
}

/** Login only checks presence; strength rules apply at registration. */
export function validateLoginPassword(value) {
  return String(value ?? '') ? '' : 'Password is required.'
}

export function validatePasswordMatch(password, confirm) {
  if (!confirm) return 'Please re-enter your password.'
  return password === confirm ? '' : 'Passwords do not match.'
}

/** Run a map of { field: () => message } and return only failing fields. */
export function collectErrors(rules) {
  return Object.fromEntries(
    Object.entries(rules)
      .map(([field, check]) => [field, check()])
      .filter(([, message]) => message),
  )
}

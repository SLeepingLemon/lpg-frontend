import { getIdToken } from './authService'

/**
 * Small fetch wrapper for the future Node.js/Express API.
 * Base URL comes from VITE_API_BASE_URL; the Firebase ID token is attached
 * as a Bearer header so the backend can verify it with firebase-admin.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    // e.g. "profile/username-taken" → mapped to a friendly message in utils/authErrors.js
    this.code = data?.code
  }
}

export async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  if (!BASE_URL) throw new ApiError('VITE_API_BASE_URL is not set.')

  const token = await getIdToken().catch(() => null)
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new ApiError(data?.message ?? `Request failed (${response.status})`, { status: response.status, data })
  }
  return data
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

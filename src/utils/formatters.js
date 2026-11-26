const LOCALE = 'en-PH'

export function formatKg(value, decimals = 1) {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(decimals)} kg`
}

export function formatPercent(value, decimals = 0) {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(decimals)}%`
}

export function formatDateTime(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(LOCALE, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const RELATIVE = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

/** "just now", "3 minutes ago", "2 hours ago", "yesterday"… */
export function formatTimeAgo(timestamp, now = Date.now()) {
  const time = new Date(timestamp).getTime()
  if (Number.isNaN(time)) return '—'
  const seconds = Math.round((time - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 45) return 'just now'
  if (abs < 3600) return RELATIVE.format(Math.round(seconds / 60), 'minute')
  if (abs < 86_400) return RELATIVE.format(Math.round(seconds / 3600), 'hour')
  return RELATIVE.format(Math.round(seconds / 86_400), 'day')
}

/** 273_120 → "3d 3h", 4_500 → "1h 15m", 300 → "5 min" */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '—'
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (days) return `${days}d ${hours}h`
  if (hours) return `${hours}h ${minutes}m`
  if (minutes) return `${minutes} min`
  return `${Math.round(totalSeconds)} s`
}

export function formatShortDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase()
}

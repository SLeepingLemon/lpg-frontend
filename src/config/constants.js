// Thresholds and defaults for LPG calculations. Adjust per deployment.

export const APP_NAME = 'Smart LPG'
export const APP_TAGLINE = 'Smart Cylinder Safety & Management'
export const COPYRIGHT = '© 2026 Smart LPG'

/** Net LPG content of a full cylinder (kg). Common PH household size is 11 kg. */
export const DEFAULT_CYLINDER_CAPACITY_KG = 11

/** Weight of the empty steel cylinder (kg). Stamped on the collar as "TW". */
export const DEFAULT_TARE_WEIGHT_KG = 14

/** At or below this % remaining → "Low" status and the low LPG banner. */
export const LOW_LPG_THRESHOLD_PERCENT = 20

/** At or below this % remaining → "Critical" status. */
export const CRITICAL_LPG_THRESHOLD_PERCENT = 10

/**
 * How often the ESP32 is expected to send data (minutes). NOT FINAL — change
 * this one number once the firmware interval is decided; the stale/offline
 * thresholds below follow it.
 */
export const EXPECTED_PUBLISH_INTERVAL_MINUTES = 5

/** Missed 2 sends → "Delayed" device / stale reading warning. */
export const STALE_READING_MINUTES = EXPECTED_PUBLISH_INTERVAL_MINUTES * 2

/** Missed 3 sends → device "Offline" and cylinder status Offline. */
export const OFFLINE_READING_MINUTES = EXPECTED_PUBLISH_INTERVAL_MINUTES * 3

/** Fallback average usage when the backend has no history yet (kg/day). */
export const DEFAULT_DAILY_USAGE_KG = 0.35

/** Background refresh interval for dashboard data (ms). 0 disables polling. */
export const DASHBOARD_POLL_INTERVAL_MS = 30_000

/** Background refresh for the header's device health + notifications (ms). */
export const HEADER_POLL_INTERVAL_MS = 30_000

/** Days of usage history loaded for the chart (the largest range option). */
export const USAGE_HISTORY_DAYS = 30
export const USAGE_RANGE_OPTIONS = [7, 14, 30]

/** Profile photo is resized to this square size (px) before saving. */
export const AVATAR_SIZE_PX = 256
export const AVATAR_MAX_UPLOAD_MB = 5

/** Password rules used by the register form. */
export const PASSWORD_MIN_LENGTH = 8

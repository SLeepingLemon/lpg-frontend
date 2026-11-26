import { useCallback } from 'react'
import { HEADER_POLL_INTERVAL_MS } from '../config/constants'
import { getDeviceStatus } from '../services/lpgService'
import { usePolledResource } from './usePolledResource'

/** ESP32 health for the header indicator. */
export function useDeviceStatus({ deviceId, pollIntervalMs = HEADER_POLL_INTERVAL_MS } = {}) {
  const fetcher = useCallback(() => getDeviceStatus(deviceId), [deviceId])
  return usePolledResource(`device:${deviceId ?? 'default'}`, fetcher, { pollIntervalMs })
}

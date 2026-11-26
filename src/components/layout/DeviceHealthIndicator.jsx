import { ChevronDown, Wifi, WifiOff } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { OFFLINE_READING_MINUTES, STALE_READING_MINUTES } from '../../config/constants'
import { useDismiss } from '../../hooks/useDismiss'
import { formatDateTime, formatDuration, formatTimeAgo } from '../../utils/formatters'
import { DEVICE_CONNECTION, getDeviceConnection } from '../../utils/lpgCalculations'

const CONNECTION_META = {
  [DEVICE_CONNECTION.ONLINE]: {
    label: 'Online',
    icon: Wifi,
    dot: 'bg-emerald-500',
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    description: 'The ESP32 is sending data normally.',
  },
  [DEVICE_CONNECTION.DELAYED]: {
    label: 'Delayed',
    icon: Wifi,
    dot: 'bg-amber-500',
    pill: 'border-amber-200 bg-amber-50 text-amber-900',
    description: `No data for over ${STALE_READING_MINUTES} min. The connection may be weak.`,
  },
  [DEVICE_CONNECTION.OFFLINE]: {
    label: 'Offline',
    icon: WifiOff,
    dot: 'bg-slate-400',
    pill: 'border-slate-300 bg-slate-100 text-slate-700',
    description: `No data for over ${OFFLINE_READING_MINUTES} min. Check the device's power and Wi-Fi.`,
  },
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-ink">{children}</dd>
    </div>
  )
}

/** Header pill showing ESP32 online/offline + last seen, with a details dropdown. */
export default function DeviceHealthIndicator({ device, loading, error, open, onOpenChange, now }) {
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const close = useCallback(() => onOpenChange(false), [onOpenChange])
  useDismiss(containerRef, open, close, buttonRef)

  if (!device) {
    return (
      <span className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 sm:inline-flex">
        <span className={`size-2 rounded-full bg-slate-300 ${loading ? 'animate-pulse' : ''}`} aria-hidden="true" />
        {loading || !error ? 'Checking device…' : 'Device status unavailable'}
      </span>
    )
  }

  const connection = getDeviceConnection(device.lastSeenAt, now)
  const meta = CONNECTION_META[connection]
  const Icon = meta.icon
  const ago = formatTimeAgo(device.lastSeenAt, now)

  return (
    <div ref={containerRef} className="sm:relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="device-panel"
        aria-label={`Device ${meta.label}, last seen ${ago}. Show device details`}
        className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-[filter] hover:brightness-95 ${meta.pill}`}
      >
        <span className={`size-2 rounded-full ${meta.dot}`} aria-hidden="true" />
        <span>{meta.label}</span>
        <span className="hidden font-normal opacity-80 lg:inline">· {ago}</span>
        <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          id="device-panel"
          role="region"
          aria-label="Device details"
          className="fixed inset-x-4 top-[4.25rem] z-30 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-80"
        >
          <div className="flex items-start gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${meta.pill}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-ink">
                {device.name ?? 'ESP32'} · {meta.label}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">{meta.description}</p>
            </div>
          </div>
          <dl className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
            <Row label="Device ID">
              <span className="font-mono text-xs">{device.deviceId}</span>
            </Row>
            <Row label="Last seen">
              {ago}
              <span className="block text-xs font-normal text-slate-500">{formatDateTime(device.lastSeenAt)}</span>
            </Row>
            <Row label="Sends data every">{formatDuration(device.publishIntervalSeconds)}</Row>
            <Row label="Uptime">{connection === DEVICE_CONNECTION.OFFLINE ? '—' : formatDuration(device.uptimeSeconds)}</Row>
            <Row label="Firmware">{device.firmwareVersion ? `v${device.firmwareVersion}` : '—'}</Row>
            {device.ipAddress && <Row label="Local IP">{device.ipAddress}</Row>}
          </dl>
          {error && <p className="mt-2 text-xs text-amber-800">Couldn&apos;t refresh device status. Showing the last known values.</p>}
        </div>
      )}
    </div>
  )
}

import { CircleCheck, Info, OctagonAlert, TriangleAlert, WifiOff } from 'lucide-react'
import { CYLINDER_STATUS } from '../../utils/lpgCalculations'

// Status colours are semantic (green/amber/red/grey) and deliberately distinct
// from the brand red, and always paired with an icon + label.

export const CYLINDER_STATUS_META = {
  [CYLINDER_STATUS.NORMAL]: {
    label: 'Normal',
    description: 'Gas level is healthy and the sensor is reporting.',
    icon: CircleCheck,
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-600/25',
    tone: 'text-emerald-700',
    bar: 'bg-emerald-500',
  },
  [CYLINDER_STATUS.LOW]: {
    label: 'Low',
    description: 'Gas is running low. Plan a refill soon.',
    icon: TriangleAlert,
    badge: 'bg-amber-50 text-amber-800 ring-amber-600/30',
    tone: 'text-amber-700',
    bar: 'bg-amber-500',
  },
  [CYLINDER_STATUS.CRITICAL]: {
    label: 'Critical',
    description: 'Gas is almost empty. Replace the cylinder now.',
    icon: OctagonAlert,
    badge: 'bg-red-50 text-red-800 ring-red-600/30',
    tone: 'text-red-700',
    bar: 'bg-red-600',
  },
  [CYLINDER_STATUS.OFFLINE]: {
    label: 'Offline',
    description: 'No recent reading from the device. Check power and Wi-Fi.',
    icon: WifiOff,
    badge: 'bg-slate-100 text-slate-700 ring-slate-400/40',
    tone: 'text-slate-600',
    bar: 'bg-slate-400',
  },
}

export const SEVERITY_META = {
  info: { label: 'Info', icon: Info, badge: 'bg-sky-50 text-sky-800 ring-sky-600/25' },
  warning: { label: 'Warning', icon: TriangleAlert, badge: 'bg-amber-50 text-amber-800 ring-amber-600/30' },
  critical: { label: 'Critical', icon: OctagonAlert, badge: 'bg-red-50 text-red-800 ring-red-600/30' },
}

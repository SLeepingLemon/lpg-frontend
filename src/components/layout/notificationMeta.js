import { Bell, OctagonAlert, RefreshCw, TriangleAlert, UserRound, Wifi, WifiOff } from 'lucide-react'

// Icon + tint per notification type. Text always carries the meaning too.
export const NOTIFICATION_META = {
  low_lpg: { icon: TriangleAlert, tint: 'bg-amber-50 text-amber-700' },
  critical_lpg: { icon: OctagonAlert, tint: 'bg-red-50 text-red-700' },
  device_offline: { icon: WifiOff, tint: 'bg-slate-100 text-slate-600' },
  device_online: { icon: Wifi, tint: 'bg-emerald-50 text-emerald-700' },
  cylinder_replaced: { icon: RefreshCw, tint: 'bg-sky-50 text-sky-700' },
  profile_updated: { icon: UserRound, tint: 'bg-brand-accent/14 text-brand-600' },
}

export const DEFAULT_NOTIFICATION_META = { icon: Bell, tint: 'bg-slate-100 text-slate-600' }

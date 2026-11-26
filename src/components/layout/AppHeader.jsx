import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { APP_NAME } from '../../config/constants'
import { ROUTES } from '../../config/routes'
import { useAuth } from '../../hooks/useAuth'
import { useDeviceStatus } from '../../hooks/useDeviceStatus'
import { useNow } from '../../hooks/useNow'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import Logo from '../common/Logo'
import DeviceHealthIndicator from './DeviceHealthIndicator'
import NotificationBell from './NotificationBell'

/**
 * Top bar shared by every signed-in page (lives in AppLayout, so it stays
 * mounted while navigating). Only one dropdown is open at a time.
 */
export default function AppHeader({ openMenu, onOpenMenuChange }) {
  const { user, logout } = useAuth()
  const device = useDeviceStatus()
  const now = useNow()
  const [loggingOut, setLoggingOut] = useState(false)
  const name = user?.displayName ?? 'User'

  const menuSetter = (menu) => (open) => onOpenMenuChange(open ? menu : null)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.dashboard} className="flex items-center gap-3 rounded-xl" aria-label={`${APP_NAME} dashboard`}>
          <Logo className="size-9 text-sm" />
          <span className="hidden leading-tight sm:block">
            <span className="block font-bold text-ink">{APP_NAME}</span>
            <span className="block text-xs text-slate-500">Cylinder monitor</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <DeviceHealthIndicator
            device={device.data}
            loading={device.loading}
            error={device.error}
            open={openMenu === 'device'}
            onOpenChange={menuSetter('device')}
            now={now}
          />
          <NotificationBell open={openMenu === 'notifications'} onOpenChange={menuSetter('notifications')} now={now} />

          <NavLink
            to={ROUTES.profile}
            title="Your profile"
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl p-0.5 transition-colors hover:bg-slate-100 md:py-1 md:pr-3 md:pl-1 ${isActive ? 'bg-slate-100' : ''}`
            }
          >
            <Avatar name={name} photoURL={user?.photoURL} />
            <span className="hidden leading-tight md:block">
              <span className="block text-sm font-semibold text-ink">{name}</span>
              <span className="block text-xs text-slate-500">{user?.username ? `@${user.username}` : user?.email}</span>
            </span>
            <span className="sr-only md:hidden">Your profile</span>
          </NavLink>

          <Button variant="ghost" size="sm" onClick={handleLogout} loading={loggingOut} aria-label="Log out">
            {!loggingOut && <LogOut className="size-4" aria-hidden="true" />}
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

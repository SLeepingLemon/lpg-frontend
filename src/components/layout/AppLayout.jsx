import { Bell } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { NotificationsProvider } from '../../context/NotificationsContext'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import Toast from '../common/Toast'
import AppHeader from './AppHeader'

/**
 * After an interactive sign-in, shows "You have N new notifications" once,
 * as soon as the first notification load completes.
 */
function LoginSummary({ onView, hidden }) {
  const { consumeJustSignedIn } = useAuth()
  const { loaded, unreadCount } = useNotifications()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (!loaded) return
    if (consumeJustSignedIn() && unreadCount > 0) {
      // One-off reaction to the first load after sign-in, not derived state.
      // oxlint-disable-next-line react/set-state-in-effect
      setSummary(unreadCount)
    }
  }, [loaded, unreadCount, consumeJustSignedIn])

  const close = useCallback(() => setSummary(null), [])
  if (!summary || hidden) return null

  return (
    <Toast
      icon={Bell}
      title={`You have ${summary} new notification${summary === 1 ? '' : 's'}`}
      message="Open the bell to see what happened while you were away."
      action={{
        label: 'View notifications',
        onClick: () => {
          close()
          onView()
        },
      }}
      onClose={close}
    />
  )
}

/** Shell for every signed-in page: header (device health, bell, profile) + page content. */
export default function AppLayout() {
  const [openMenu, setOpenMenu] = useState(null) // 'device' | 'notifications' | null
  // Once the bell has been opened the login summary has done its job.
  const [bellSeen, setBellSeen] = useState(false)

  const changeMenu = useCallback((menu) => {
    if (menu === 'notifications') setBellSeen(true)
    setOpenMenu(menu)
  }, [])

  return (
    <NotificationsProvider>
      <div className="min-h-dvh bg-canvas">
        <AppHeader openMenu={openMenu} onOpenMenuChange={changeMenu} />
        <Outlet />
        <LoginSummary hidden={bellSeen} onView={() => changeMenu('notifications')} />
      </div>
    </NotificationsProvider>
  )
}

import { useCallback, useMemo } from 'react'
import { HEADER_POLL_INTERVAL_MS } from '../config/constants'
import { useAuth } from '../hooks/useAuth'
import { usePolledResource } from '../hooks/usePolledResource'
import * as notificationService from '../services/notificationService'
import { NotificationsContext } from './notificationsContextInstance'

/** In-website notifications for the signed-in user (bell, login summary, profile page). */
export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const uid = user?.uid

  const fetcher = useCallback(() => notificationService.getNotifications(uid), [uid])
  const { data, loading, error, refresh, mutate } = usePolledResource(`notifications:${uid}`, fetcher, {
    pollIntervalMs: HEADER_POLL_INTERVAL_MS,
    enabled: Boolean(uid),
  })

  const markRead = useCallback(
    async (id) => {
      mutate((list) => list?.map((n) => (n.id === id ? { ...n, read: true } : n)))
      await notificationService.markNotificationRead(uid, id).catch(refresh)
    },
    [uid, mutate, refresh],
  )

  const markAllRead = useCallback(async () => {
    mutate((list) => list?.map((n) => ({ ...n, read: true })))
    await notificationService.markAllNotificationsRead(uid).catch(refresh)
  }, [uid, mutate, refresh])

  /** Mock-only helper for client-side events (e.g. profile updated). */
  const notify = useCallback(
    async (notification) => {
      const created = await notificationService.addNotification(uid, notification)
      mutate((list) => [created, ...(list ?? [])])
    },
    [uid, mutate],
  )

  const value = useMemo(() => {
    const notifications = data ?? []
    return {
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      loaded: data !== null,
      loading,
      error,
      refresh,
      markRead,
      markAllRead,
      notify,
    }
  }, [data, loading, error, refresh, markRead, markAllRead, notify])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

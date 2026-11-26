import { Bell, CheckCheck } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDateTime, formatTimeAgo } from '../../utils/formatters'
import Spinner from '../common/Spinner'
import { DEFAULT_NOTIFICATION_META, NOTIFICATION_META } from './notificationMeta'

/** Header bell with unread count and a dropdown list. Open state is controlled by the header. */
export default function NotificationBell({ open, onOpenChange, now }) {
  const { notifications, unreadCount, loaded, error, markRead, markAllRead } = useNotifications()
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const close = useCallback(() => onOpenChange(false), [onOpenChange])
  useDismiss(containerRef, open, close, buttonRef)

  const label = unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'

  return (
    <div ref={containerRef} className="sm:relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="notification-panel"
        aria-label={label}
        className="relative flex size-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] leading-4.5 font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notification-panel"
          role="region"
          aria-label="Notifications"
          className="fixed inset-x-4 top-[4.25rem] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="font-semibold text-ink">
              Notifications
              {unreadCount > 0 && <span className="ml-1.5 text-sm font-normal text-slate-500">({unreadCount} unread)</span>}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-500 hover:text-brand-700"
              >
                <CheckCheck className="size-3.5" aria-hidden="true" /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
            {!loaded && !error && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                <Spinner className="size-4" label="Loading notifications" /> Loading…
              </div>
            )}
            {error && !loaded && <p className="px-4 py-10 text-center text-sm text-slate-600">Couldn&apos;t load notifications.</p>}
            {loaded && notifications.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-slate-600">You&apos;re all caught up.</p>
            )}

            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => {
                const meta = NOTIFICATION_META[n.type] ?? DEFAULT_NOTIFICATION_META
                const Icon = meta.icon
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => !n.read && markRead(n.id)}
                      className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 ${n.read ? '' : 'bg-brand-accent/5'}`}
                    >
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${meta.tint}`}>
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className={`text-sm ${n.read ? 'font-medium text-slate-700' : 'font-semibold text-ink'}`}>{n.title}</span>
                          {!n.read && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500">
                              <span className="sr-only">Unread</span>
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-600">{n.message}</span>
                        <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)} className="mt-1 block text-xs text-slate-500">
                          {formatTimeAgo(n.createdAt, now)}
                        </time>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

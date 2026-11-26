import { useCallback, useEffect, useRef, useState } from 'react'

// Last result per key, kept for the browser session so returning to a page
// shows data instantly and refreshes in the background.
const cache = new Map()

/** Drop cached data (call on logout so the next user never sees it). */
export function clearResourceCache() {
  cache.clear()
}

/**
 * Loads `fetcher()` and refreshes it every `pollIntervalMs`.
 *
 * - `loading`    true only when there is nothing to show yet (show skeletons)
 * - `refreshing` true during manual/polled refreshes (keep old data visible)
 * - `error`      last error; when `data` exists show it inline, not full-page
 * - `mutate`     update data locally (e.g. optimistic "mark as read")
 * - Polling pauses while the tab is hidden and refreshes when it returns.
 *
 * `fetcher` must be stable (wrap it in useCallback).
 */
export function usePolledResource(key, fetcher, { pollIntervalMs = 0, enabled = true } = {}) {
  const cached = cache.get(key)
  const [data, setData] = useState(cached?.data ?? null)
  const [lastUpdated, setLastUpdated] = useState(cached?.lastUpdated ?? null)
  const [loading, setLoading] = useState(enabled && !cached)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const requestId = useRef(0)
  const hasData = useRef(Boolean(cached))

  // Fetches and stores results; sets state only after the request settles.
  const fetchAll = useCallback(async () => {
    const id = ++requestId.current
    try {
      const result = await fetcher()
      if (id !== requestId.current) return // superseded or unmounted
      const now = Date.now()
      cache.set(key, { data: result, lastUpdated: now })
      hasData.current = true
      setData(result)
      setLastUpdated(now)
      setError(null)
    } catch (err) {
      if (id !== requestId.current) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (id === requestId.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [key, fetcher])

  const refresh = useCallback(() => {
    if (hasData.current) setRefreshing(true)
    else setLoading(true)
    return fetchAll()
  }, [fetchAll])

  const mutate = useCallback(
    (updater) => {
      setData((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater
        cache.set(key, { data: next, lastUpdated: cache.get(key)?.lastUpdated ?? Date.now() })
        return next
      })
    },
    [key],
  )

  useEffect(() => {
    if (!enabled) return undefined
    // fetchAll only sets state after its awaited request settles, never synchronously.
    // oxlint-disable-next-line react/set-state-in-effect
    fetchAll()
    const ids = requestId
    return () => {
      ids.current++ // ignore in-flight responses after unmount
    }
  }, [fetchAll, enabled])

  useEffect(() => {
    if (!enabled || !pollIntervalMs) return undefined
    const tick = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const intervalId = setInterval(tick, pollIntervalMs)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [refresh, pollIntervalMs, enabled])

  return { data, loading, refreshing, error, lastUpdated, refresh, mutate }
}

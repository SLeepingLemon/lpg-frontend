import { useEffect, useState } from 'react'

/** Current timestamp that re-renders every `intervalMs`, for "time ago" labels. */
export function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

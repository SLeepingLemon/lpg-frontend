import { useEffect } from 'react'

/** Close a popover on outside click/tap or Escape (focus returns to `returnFocusRef`). */
export function useDismiss(containerRef, open, onClose, returnFocusRef) {
  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) onClose()
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        returnFocusRef?.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [containerRef, open, onClose, returnFocusRef])
}

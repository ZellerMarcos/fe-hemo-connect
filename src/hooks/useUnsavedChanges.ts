import { useEffect } from 'react'

const NAVIGATION_EVENT = 'hemo-confirm-navigation'

export function confirmarNavegacao(): boolean {
  return window.dispatchEvent(new Event(NAVIGATION_EVENT, { cancelable: true }))
}

export function useUnsavedChanges(active: boolean, message: string) {
  useEffect(() => {
    if (!active) return
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    const beforeNavigation = (event: Event) => {
      if (!window.confirm(message)) event.preventDefault()
    }
    window.addEventListener('beforeunload', beforeUnload)
    window.addEventListener(NAVIGATION_EVENT, beforeNavigation)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
      window.removeEventListener(NAVIGATION_EVENT, beforeNavigation)
    }
  }, [active, message])
}

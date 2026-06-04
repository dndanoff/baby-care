import { useCallback, useEffect, useRef } from "react"

/**
 * Holds a Screen Wake Lock while `active` is true, preventing the display
 * from sleeping. Automatically releases on unmount or when `active` becomes
 * false. Re-acquires when the page regains visibility (the OS silently
 * releases wake locks whenever the document is hidden).
 */
export const useWakeLock = (active: boolean) => {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  const acquire = useCallback(async () => {
    if (!("wakeLock" in navigator)) return
    try {
      sentinelRef.current = await navigator.wakeLock.request("screen")
    } catch {
      // Permission denied or API unavailable — fail silently
    }
  }, [])

  const release = useCallback(() => {
    sentinelRef.current?.release()
    sentinelRef.current = null
  }, [])

  useEffect(() => {
    if (active) {
      acquire()
    } else {
      release()
    }
    return release
  }, [active, acquire, release])

  // The OS drops the lock whenever the document is hidden; re-acquire on return
  useEffect(() => {
    const onVisibilityChange = () => {
      if (active && document.visibilityState === "visible") {
        acquire()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [active, acquire])
}

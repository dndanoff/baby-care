import { useCallback, useEffect, useRef, useState } from "react"
import { feedingRepository } from "@/db/repositories"
import type { Baby, FeedingType } from "@/types"

export const useFeedingTimer = (activeBaby: Baby | null) => {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessionStart, setSessionStart] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Wall-clock time when the timer was started, used to compute elapsed accurately
  const startedAtRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  const tick = useCallback(() => {
    if (startedAtRef.current !== null) {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }
  }, [])

  const start = () => {
    if (running) return
    setRunning(true)
    const now = new Date()
    if (!sessionStart) {
      setSessionStart(now.toISOString())
      startedAtRef.current = now.getTime()
    }
    intervalRef.current = setInterval(tick, 1000)
  }

  const stop = async (feedingType?: FeedingType): Promise<boolean> => {
    if (!running) return false
    clearTimer()
    setRunning(false)

    if (activeBaby && sessionStart) {
      const finalElapsed = startedAtRef.current
        ? Math.floor((Date.now() - startedAtRef.current) / 1000)
        : elapsed
      await feedingRepository.add({
        babyId: activeBaby.id,
        startTime: sessionStart,
        endTime: new Date().toISOString(),
        duration: finalElapsed,
        ...(feedingType !== undefined && { feedingType }),
      })
      setSessionStart(null)
      setElapsed(0)
      startedAtRef.current = null
      return true
    }
    return false
  }

  const reset = () => {
    clearTimer()
    setRunning(false)
    setElapsed(0)
    setSessionStart(null)
    startedAtRef.current = null
  }

  return { running, elapsed, start, stop, reset }
}

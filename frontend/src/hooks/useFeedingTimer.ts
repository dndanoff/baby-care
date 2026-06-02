import { useCallback, useEffect, useRef, useState } from "react"
import { feedingRepository } from "@/db/repositories"
import type { Baby, FeedingType } from "@/types"

export const useFeedingTimer = (activeBaby: Baby | null) => {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessionStart, setSessionStart] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  const tick = useCallback(() => setElapsed((e) => e + 1), [])

  const start = () => {
    if (running) return
    setRunning(true)
    if (!sessionStart) setSessionStart(new Date().toISOString())
    intervalRef.current = setInterval(tick, 1000)
  }

  const stop = async (feedingType?: FeedingType): Promise<boolean> => {
    if (!running) return false
    clearTimer()
    setRunning(false)

    if (activeBaby && sessionStart) {
      await feedingRepository.add({
        babyId: activeBaby.id,
        startTime: sessionStart,
        endTime: new Date().toISOString(),
        duration: elapsed,
        ...(feedingType !== undefined && { feedingType }),
      })
      setSessionStart(null)
      setElapsed(0)
      return true
    }
    return false
  }

  const reset = () => {
    clearTimer()
    setRunning(false)
    setElapsed(0)
    setSessionStart(null)
  }

  return { running, elapsed, start, stop, reset }
}

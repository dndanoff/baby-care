import { useCallback, useEffect, useRef, useState } from "react"
import { feedingRepository } from "@/db/repositories"
import type { Baby, FeedingType } from "@/types"

export const useFeedingTimer = (activeBaby: Baby | null) => {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessionStart, setSessionStart] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Wall-clock time when the current segment started (reset on each resume)
  const startedAtRef = useRef<number | null>(null)
  // Elapsed seconds accumulated from all completed segments before the current one
  const accumulatedRef = useRef<number>(0)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  const tick = useCallback(() => {
    if (startedAtRef.current !== null) {
      setElapsed(
        accumulatedRef.current +
          Math.floor((Date.now() - startedAtRef.current) / 1000)
      )
    }
  }, [])

  const start = () => {
    if (running) return
    const now = Date.now()
    if (!sessionStart) {
      setSessionStart(new Date(now).toISOString())
      accumulatedRef.current = 0
    }
    startedAtRef.current = now
    setRunning(true)
    setPaused(false)
    intervalRef.current = setInterval(tick, 1000)
  }

  const pause = () => {
    if (!running) return
    clearTimer()
    if (startedAtRef.current !== null) {
      accumulatedRef.current += Math.floor(
        (Date.now() - startedAtRef.current) / 1000
      )
      setElapsed(accumulatedRef.current)
    }
    startedAtRef.current = null
    setRunning(false)
    setPaused(true)
  }

  const stop = async (feedingType?: FeedingType): Promise<boolean> => {
    if (!running && !paused) return false
    clearTimer()
    const finalElapsed =
      running && startedAtRef.current !== null
        ? accumulatedRef.current +
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        : accumulatedRef.current
    setRunning(false)
    setPaused(false)

    if (activeBaby && sessionStart) {
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
      accumulatedRef.current = 0
      return true
    }
    return false
  }

  const reset = () => {
    clearTimer()
    setRunning(false)
    setPaused(false)
    setElapsed(0)
    setSessionStart(null)
    startedAtRef.current = null
    accumulatedRef.current = 0
  }

  return { running, paused, elapsed, start, pause, stop, reset }
}

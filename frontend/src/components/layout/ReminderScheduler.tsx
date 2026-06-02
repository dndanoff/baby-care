import { useEffect, useRef } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { useTranslation } from "react-i18next"
import { reminderRepository } from "@/db/repositories"
import { config } from "@/config"
import type { Reminder } from "@/types"

const scheduleReminder = (
  reminder: Reminder,
  onFire: (id: string, repeating: boolean) => void
): ReturnType<typeof setTimeout> => {
  const base = reminder.lastFiredAt ?? reminder.createdAt
  const nextFireAt =
    new Date(base).getTime() + reminder.intervalMinutes * 60_000
  const delay = Math.max(0, nextFireAt - Date.now())
  return setTimeout(() => onFire(reminder.id, reminder.repeating), delay)
}

export const ReminderScheduler = () => {
  const { t } = useTranslation()
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  )

  const enabledReminders = useLiveQuery(
    () =>
      reminderRepository.getAll().then((all) => all.filter((r) => r.enabled)),
    []
  )

  useEffect(() => {
    if (!enabledReminders) return

    const currentIds = new Set(enabledReminders.map((r) => r.id))

    // Clear timeouts for reminders that are no longer enabled
    for (const [id, handle] of timeoutsRef.current) {
      if (!currentIds.has(id)) {
        clearTimeout(handle)
        timeoutsRef.current.delete(id)
      }
    }

    const onFire = async (id: string, repeating: boolean) => {
      timeoutsRef.current.delete(id)
      const reminder = await reminderRepository
        .getAll()
        .then((all) => all.find((r) => r.id === id))
      if (!reminder) return

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(t("reminders.notifTitle"), {
          body: t("reminders.notifBody", { text: reminder.text }),
          icon: config.VITE_NOTIFICATION_ICON,
        })
      }

      if (repeating) {
        await reminderRepository.update(id, {
          lastFiredAt: new Date().toISOString(),
        })
        // useLiveQuery will re-run the effect and reschedule
      } else {
        await reminderRepository.update(id, { enabled: false })
      }
    }

    // Schedule each enabled reminder that doesn't have a pending timeout yet
    for (const reminder of enabledReminders) {
      if (!timeoutsRef.current.has(reminder.id)) {
        const handle = scheduleReminder(reminder, onFire)
        timeoutsRef.current.set(reminder.id, handle)
      }
    }

    return () => {
      // Cleanup on unmount only — not on every render
    }
  }, [enabledReminders, t])

  // On unmount clear all pending timeouts
  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      for (const handle of timeouts.values()) {
        clearTimeout(handle)
      }
      timeouts.clear()
    }
  }, [])

  return null
}

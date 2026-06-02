import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Bell, BellOff, Baby, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { reminderRepository } from "@/db/repositories"
import { useApp } from "@/contexts/AppContext"
import { useNotifPermission } from "@/hooks/useNotifPermission"
import { cn } from "@/lib/utils"
import { CONSTANTS } from "@/constants"
import { EmptyState } from "@/components/common/EmptyState"
import { SectionHeader } from "@/components/common/SectionHeader"
import { ToggleButtons } from "@/components/common/ToggleButtons"
import { Badge } from "@/components/ui/badge"
import type { Reminder } from "@/types"

const { INTERVAL_OPTIONS } = CONSTANTS.reminders

const Reminders = () => {
  const { t } = useTranslation()
  const { activeBaby } = useApp()
  const { permission, request } = useNotifPermission()

  const [text, setText] = useState("")
  const [intervalMinutes, setIntervalMinutes] = useState<number>(
    INTERVAL_OPTIONS[2].minutes
  )
  const [repeating, setRepeating] = useState(true)
  const [textError, setTextError] = useState(false)

  const reminders = useLiveQuery<Reminder[]>(
    () =>
      activeBaby
        ? reminderRepository.getByBabyId(activeBaby.id)
        : Promise.resolve([]),
    [activeBaby?.id]
  )

  const handleAdd = async () => {
    if (!activeBaby) return
    const trimmed = text.trim()
    if (!trimmed) {
      setTextError(true)
      return
    }
    setTextError(false)
    await reminderRepository.add({
      babyId: activeBaby.id,
      text: trimmed,
      intervalMinutes,
      repeating,
      enabled: true,
      createdAt: new Date().toISOString(),
    })
    setText("")
    setIntervalMinutes(INTERVAL_OPTIONS[2].minutes)
    setRepeating(true)
  }

  const toggleEnabled = (reminder: Reminder) => {
    reminderRepository.update(reminder.id, {
      enabled: !reminder.enabled,
      // Reset lastFiredAt so the interval starts fresh when re-enabled
      ...(reminder.enabled ? {} : { lastFiredAt: new Date().toISOString() }),
    })
  }

  const intervalLabel = (minutes: number) =>
    INTERVAL_OPTIONS.find((o) => o.minutes === minutes)?.label ?? `${minutes}m`

  if (!activeBaby) {
    return <EmptyState icon={Baby} message={t("reminders.selectBaby")} />
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <h1 className="mb-6 text-base font-semibold">{t("reminders.title")}</h1>

      {/* Notification permission banner */}
      <div className="mb-4 flex items-center justify-between rounded-lg border px-3 py-2">
        {permission === "default" && (
          <>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Bell className="h-3.5 w-3.5" />
              {t("reminders.notificationsDefault")}
            </span>
            <button
              onClick={request}
              className="text-xs font-medium text-primary"
            >
              {t("reminders.notificationsEnable")}
            </button>
          </>
        )}
        {permission === "granted" && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bell className="h-3.5 w-3.5" />
            {t("reminders.notificationsEnabled")}
          </span>
        )}
        {permission === "denied" && (
          <span className="flex items-center gap-1.5 text-xs text-destructive">
            <BellOff className="h-3.5 w-3.5" />
            {t("reminders.notificationsBlocked")}
          </span>
        )}
      </div>

      {/* Add reminder form */}
      <div className="mb-6 rounded-lg border p-3">
        <div className="mb-3 text-xs font-medium text-muted-foreground">
          {t("reminders.addReminder")}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (e.target.value.trim()) setTextError(false)
          }}
          placeholder={t("reminders.textPlaceholder")}
          className={cn(
            "mb-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm transition-colors outline-none focus:border-primary",
            textError ? "border-destructive" : "border-border"
          )}
          maxLength={80}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        {textError && (
          <p className="mb-2 text-xs text-destructive">
            {t("reminders.textRequired")}
          </p>
        )}

        <div className="mt-3 mb-2 text-xs font-medium text-muted-foreground">
          {t("reminders.interval")}
        </div>
        <ToggleButtons
          options={INTERVAL_OPTIONS.map((o) => ({
            value: o.minutes,
            label: o.label,
          }))}
          value={intervalMinutes}
          onChange={setIntervalMinutes}
        />

        <div className="mt-3 mb-2 text-xs font-medium text-muted-foreground">
          {t("reminders.repeat")}
        </div>
        <ToggleButtons
          options={[
            { value: true, label: t("reminders.repeat") },
            { value: false, label: t("reminders.once") },
          ]}
          value={repeating}
          onChange={setRepeating}
        />

        <button
          onClick={handleAdd}
          className="mt-3 w-full rounded-md bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {t("reminders.add")}
        </button>
      </div>

      {/* Reminder list */}
      {reminders && reminders.length > 0 && (
        <div>
          <SectionHeader className="mb-2">{t("reminders.title")}</SectionHeader>
          <ul className="space-y-1.5">
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {reminder.text}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {intervalLabel(reminder.intervalMinutes)}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {reminder.repeating
                        ? t("reminders.repeating")
                        : t("reminders.singleUse")}
                    </Badge>
                  </div>
                </div>

                {/* Enable / disable toggle */}
                <button
                  onClick={() => toggleEnabled(reminder)}
                  className={cn(
                    "rounded border px-2 py-0.5 text-[11px] font-medium transition-colors",
                    reminder.enabled
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                  aria-label={
                    reminder.enabled
                      ? t("reminders.disabled")
                      : t("reminders.enabled")
                  }
                >
                  {reminder.enabled
                    ? t("reminders.enabled")
                    : t("reminders.disabled")}
                </button>

                <button
                  onClick={() => reminderRepository.delete(reminder.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={t("reminders.delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reminders && reminders.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {t("reminders.noReminders")}
        </p>
      )}
    </div>
  )
}

export default Reminders

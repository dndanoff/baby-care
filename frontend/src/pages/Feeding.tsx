import { useEffect, useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Play, Pause, Square, RotateCcw, Baby, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { feedingRepository } from "@/db/repositories"
import { useApp } from "@/contexts/AppContext"
import { useFeedingTimer } from "@/hooks/useFeedingTimer"
import { useNavigationGuard } from "@/hooks/useNavigationGuard"
import { useWakeLock } from "@/hooks/useWakeLock"
import { formatDuration, formatFeedingGap } from "@/utils/format"
import { cn } from "@/lib/utils"
import { CONSTANTS } from "@/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/common/EmptyState"
import { SectionHeader } from "@/components/common/SectionHeader"
import { ToggleButtons } from "@/components/common/ToggleButtons"
import { LoadMore } from "@/components/common/LoadMore"
import type { FeedingSession, FeedingType } from "@/types"

const { PAGE_SIZE } = CONSTANTS.pagination

const Feeding = () => {
  const { t } = useTranslation()
  const { activeBaby } = useApp()
  const { running, paused, elapsed, start, pause, stop, reset } =
    useFeedingTimer(activeBaby)
  const guard = useNavigationGuard(running || paused)
  useWakeLock(running)
  const [feedingType, setFeedingType] = useState<FeedingType | undefined>(
    undefined
  )
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  const feedingTypeOptions: {
    value: FeedingType | undefined
    label: string
  }[] = [
    { value: undefined, label: t("feeding.na") },
    { value: "left-breast", label: t("feeding.leftBreast") },
    { value: "right-breast", label: t("feeding.rightBreast") },
    { value: "both-breasts", label: t("feeding.bothBreasts") },
    { value: "formula", label: t("feeding.formula") },
    { value: "formula-and-breast", label: t("feeding.formulaAndBreast") },
  ]

  const allSessions = useLiveQuery<FeedingSession[]>(
    () =>
      activeBaby
        ? feedingRepository.getByBabyId(activeBaby.id)
        : Promise.resolve([]),
    [activeBaby?.id]
  )

  const recentSessions = allSessions?.slice(0, visibleCount)
  const hasMore = allSessions ? visibleCount < allSessions.length : false

  useEffect(() => {
    setVisibleCount(PAGE_SIZE) // eslint-disable-line react-hooks/set-state-in-effect
  }, [activeBaby?.id])

  const handleStop = async () => {
    await stop(feedingType)
  }

  const handleReset = () => {
    reset()
  }

  if (!activeBaby) {
    return <EmptyState icon={Baby} message={t("feeding.selectBaby")} />
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <h1 className="mb-6 text-base font-semibold">{t("feeding.title")}</h1>

      {/* Timer display */}
      <div className="mb-6 flex flex-col items-center">
        <div
          className={cn(
            "mb-1 flex h-36 w-36 items-center justify-center rounded-full border-4 transition-colors",
            running
              ? "border-primary"
              : paused
                ? "border-amber-500"
                : "border-border"
          )}
        >
          <span className="font-mono text-3xl font-bold tabular-nums">
            {formatDuration(elapsed)}
          </span>
        </div>
        <span
          className={cn(
            "mb-3 text-xs font-medium transition-opacity",
            paused ? "text-amber-500 opacity-100" : "opacity-0"
          )}
        >
          {t("feeding.pause")}
        </span>
      </div>

      {/* Controls */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="flex h-12 w-12 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted"
          aria-label={t("feeding.reset")}
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        {running ? (
          <button
            onClick={pause}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            aria-label={t("feeding.pause")}
          >
            <Pause className="h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={start}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            aria-label={paused ? t("feeding.resume") : t("feeding.start")}
          >
            <Play className="h-6 w-6 translate-x-0.5" />
          </button>
        )}

        {running || paused ? (
          <button
            onClick={handleStop}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10"
            aria-label={t("feeding.stop")}
          >
            <Square className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-12 w-12" />
        )}
      </div>

      {/* Feeding type */}
      <div className="mb-6 rounded-lg border p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          {t("feeding.feedingType")}
        </div>
        <ToggleButtons
          options={feedingTypeOptions}
          value={feedingType}
          onChange={setFeedingType}
          columns={3}
        />
      </div>

      {/* Navigation guard dialog */}
      <Dialog
        open={guard.isBlocked}
        onOpenChange={(open) => !open && guard.cancel()}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("feeding.leaveWithoutSaving")}</DialogTitle>
            <DialogDescription>
              {t("feeding.timerActiveWarning")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={guard.cancel}>
              {t("feeding.stay")}
            </Button>
            <Button variant="destructive" onClick={guard.proceed}>
              {t("feeding.leaveAnyway")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent sessions */}
      {recentSessions && recentSessions.length > 0 && (
        <div>
          <SectionHeader className="mb-2">
            {t("feeding.recentSessions")}
          </SectionHeader>
          <ul className="space-y-1.5">
            {recentSessions.map((s, i) => {
              const prev = recentSessions[i + 1]
              const gapMs = prev
                ? new Date(s.startTime).getTime() -
                  new Date(prev.endTime ?? prev.startTime).getTime()
                : null
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(s.startTime).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {new Date(s.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" – "}
                    {s.endTime
                      ? new Date(s.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : t("feeding.ongoing")}
                  </span>
                  <div className="flex items-center gap-2">
                    {gapMs !== null && gapMs > 0 && (
                      <span className="text-xs text-muted-foreground">
                        +{formatFeedingGap(gapMs)}
                      </span>
                    )}
                    {s.feedingType && (
                      <Badge variant="secondary">
                        {
                          feedingTypeOptions.find(
                            (o) => o.value === s.feedingType
                          )?.label
                        }
                      </Badge>
                    )}
                    <span className="font-mono text-xs">
                      {s.duration != null ? formatDuration(s.duration) : "—"}
                    </span>
                    <button
                      onClick={() => feedingRepository.delete(s.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={t("feeding.deleteSession")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          <LoadMore
            hasMore={hasMore}
            onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
            label={t("feeding.loadMore")}
          />
        </div>
      )}
    </div>
  )
}

export default Feeding

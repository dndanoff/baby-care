import { useLiveQuery } from "dexie-react-hooks"
import { Timer, Scale, Droplets, Baby } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  feedingRepository,
  diaperRepository,
  weightRepository,
} from "@/db/repositories"
import { useApp } from "@/contexts/AppContext"
import { formatTimeAgo, formatWeightGrams } from "@/utils/format"
import { formatDuration } from "@/utils/format"
import { EmptyState } from "@/components/common/EmptyState"
import { StatCard } from "@/components/common/StatCard"

const Dashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeBaby } = useApp()

  const lastFeeding = useLiveQuery(
    () =>
      activeBaby
        ? feedingRepository.getLatestByBabyId(activeBaby.id)
        : Promise.resolve(undefined),
    [activeBaby?.id]
  )

  const lastDiaper = useLiveQuery(
    () =>
      activeBaby
        ? diaperRepository.getLatestByBabyId(activeBaby.id)
        : Promise.resolve(undefined),
    [activeBaby?.id]
  )

  const lastWeight = useLiveQuery(
    () =>
      activeBaby
        ? weightRepository.getLatestByBabyId(activeBaby.id)
        : Promise.resolve(undefined),
    [activeBaby?.id]
  )

  if (!activeBaby) {
    return <EmptyState icon={Baby} message={t("dashboard.selectBaby")} />
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <h1 className="mb-6 text-base font-semibold">{t("dashboard.title")}</h1>

      <div className="space-y-3">
        <StatCard
          icon={Timer}
          label={t("dashboard.lastFeeding")}
          value={
            lastFeeding
              ? formatTimeAgo(lastFeeding.endTime ?? lastFeeding.startTime)
              : t("dashboard.noData")
          }
          meta={
            lastFeeding
              ? [
                  lastFeeding.duration != null &&
                    formatDuration(lastFeeding.duration),
                  lastFeeding.feedingType &&
                    t(
                      `feeding.${lastFeeding.feedingType.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}` as never
                    ),
                ]
                  .filter(Boolean)
                  .join(" · ") || undefined
              : undefined
          }
          onClick={() => navigate("/feeding")}
        />

        <StatCard
          icon={Droplets}
          label={t("dashboard.lastDiaper")}
          value={
            lastDiaper
              ? formatTimeAgo(lastDiaper.dateTime)
              : t("dashboard.noData")
          }
          meta={lastDiaper ? t(`diaper.${lastDiaper.type}`) : undefined}
          onClick={() => navigate("/diaper")}
        />

        <StatCard
          icon={Scale}
          label={t("dashboard.lastWeight")}
          value={
            lastWeight
              ? formatWeightGrams(lastWeight.weightGrams)
              : t("dashboard.noData")
          }
          meta={lastWeight ? formatTimeAgo(lastWeight.dateTime) : undefined}
          onClick={() => navigate("/weight")}
        />
      </div>
    </div>
  )
}

export default Dashboard

import { Baby, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useApp } from "@/contexts/AppContext"
import { ROUTINES } from "@/data/routines"
import { getAgeRange } from "@/utils/age"
import type { AgeRange } from "@/types"

const Routine = () => {
  const { t } = useTranslation()
  const { activeBaby } = useApp()

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <Baby className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t("routine.selectBaby")}
        </p>
      </div>
    )
  }

  const ageRange: AgeRange = getAgeRange(activeBaby.dob)
  const entries = ROUTINES[ageRange]

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-base font-semibold">{t("routine.title")}</h1>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">
        {t("routine.recommendedFor", { ageRange: t(`ageRanges.${ageRange}`) })}
      </p>

      <div className="relative space-y-0">
        {entries.map((entry) => (
          <div key={`${entry.time}-${entry.activity}`} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background">
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
              {entry !== entries[entries.length - 1] && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>
            <div className="min-w-0 pt-0.5 pb-5">
              <div className="text-xs font-semibold text-muted-foreground">
                {entry.time}
              </div>
              <div className="mt-0.5 text-sm font-medium">{entry.activity}</div>
              {entry.notes && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {entry.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
        {t("routine.disclaimer")}
      </p>
    </div>
  )
}

export default Routine

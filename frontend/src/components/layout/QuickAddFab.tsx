import { useState } from "react"
import { Plus, X, Timer, Scale, Droplets } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"
import { diaperRepository } from "@/db/repositories"
import { toISODateString, toLocalTimeString } from "@/utils/format"
import type { DiaperType } from "@/types"

type Step = "menu" | "diaper"

const DIAPER_TYPES: DiaperType[] = ["wet", "soiled", "both"]

export const QuickAddFab = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeBaby } = useApp()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("menu")
  const [diaperType, setDiaperType] = useState<DiaperType>("wet")
  const [saving, setSaving] = useState(false)

  if (!activeBaby) return null

  const close = () => {
    setOpen(false)
    setStep("menu")
    setDiaperType("wet")
  }

  const handleDiaperSave = async () => {
    setSaving(true)
    const now = new Date()
    await diaperRepository.add({
      babyId: activeBaby.id,
      dateTime: `${toISODateString(now)}T${toLocalTimeString(now)}`,
      type: diaperType,
    })
    setSaving(false)
    close()
  }

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={close} />}

      {/* Popup panel */}
      {open && (
        <div className="fixed right-4 bottom-20 z-50 w-52 rounded-xl border bg-popover shadow-lg sm:bottom-6">
          {step === "menu" ? (
            <div className="space-y-1 p-2">
              <button
                onClick={() => {
                  close()
                  navigate("/feeding")
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Timer className="h-4 w-4 shrink-0 text-primary" />
                {t("quickAdd.feeding")}
              </button>
              <button
                onClick={() => setStep("diaper")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Droplets className="h-4 w-4 shrink-0 text-primary" />
                {t("quickAdd.diaper")}
              </button>
              <button
                onClick={() => {
                  close()
                  navigate("/weight")
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Scale className="h-4 w-4 shrink-0 text-primary" />
                {t("quickAdd.weight")}
              </button>
            </div>
          ) : (
            <div className="p-3">
              <div className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t("quickAdd.diaperType")}
              </div>
              <div className="mb-3 flex gap-1.5">
                {DIAPER_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setDiaperType(type)}
                    className={cn(
                      "flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors",
                      diaperType === type
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {t(`diaper.${type}`)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleDiaperSave}
                disabled={saving}
                className="w-full rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? t("quickAdd.saving") : t("quickAdd.logNow")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          "fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all sm:bottom-6",
          open
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        aria-label={t("quickAdd.label")}
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </>
  )
}

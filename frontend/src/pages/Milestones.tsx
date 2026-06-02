import { useMemo, useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import {
  Check,
  Pencil,
  Trash2,
  Star,
  Baby,
  Plus,
  RotateCcw,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { milestoneRepository } from "@/db/repositories"
import { useApp } from "@/contexts/AppContext"
import { AGE_RANGE_ORDER } from "@/data/milestones"
import type { AgeRange, Milestone } from "@/types"
import { cn } from "@/lib/utils"
import { toISODateString } from "@/utils/format"
import { Button } from "@/components/ui/button"
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog"

type CustomMilestoneForm = {
  title: string
  description: string
  ageRange: AgeRange
}
const EMPTY_CUSTOM: CustomMilestoneForm = {
  title: "",
  description: "",
  ageRange: "0-3m",
}

// ─── MilestoneItem ──────────────────────────────────────────────────────────

const MilestoneItem = ({
  milestone,
  onCheck,
  onEdit,
  onDelete,
  onReset,
}: {
  milestone: Milestone
  onCheck: () => void
  onEdit: () => void
  onDelete: () => void
  onReset: () => void
}) => {
  const { t } = useTranslation()
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
        milestone.completed ? "border-border bg-muted/30" : "hover:bg-muted/20"
      )}
    >
      <button
        onClick={milestone.completed ? undefined : onCheck}
        disabled={milestone.completed}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          milestone.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border hover:border-primary"
        )}
        aria-label={
          milestone.completed
            ? t("milestones.completedLabel")
            : t("milestones.markComplete")
        }
      >
        {milestone.completed && <Check className="h-3 w-3" />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            milestone.completed && "text-muted-foreground line-through"
          )}
        >
          {milestone.title}
        </p>
        {milestone.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {milestone.description}
          </p>
        )}
        {milestone.completed && milestone.completedAt && (
          <p className="mt-1 text-xs text-primary">
            {t("milestones.completedOn", {
              date: new Date(milestone.completedAt).toLocaleDateString(),
            })}
          </p>
        )}
      </div>
      <div className="flex gap-1">
        {milestone.isSystem && milestone.completed && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              aria-label={t("milestones.editDate")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onReset}
              aria-label={t("milestones.resetMilestone")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {!milestone.isSystem && (
          <>
            {milestone.completed && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onEdit}
                  aria-label={t("milestones.editDate")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onReset}
                  aria-label={t("milestones.resetMilestone")}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={t("milestones.delete")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </li>
  )
}

// ─── Milestones page ────────────────────────────────────────────────────────

const Milestones = () => {
  const { t } = useTranslation()
  const { activeBaby } = useApp()
  const [confirmMilestone, setConfirmMilestone] = useState<Milestone | null>(
    null
  )
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null)
  const [editDate, setEditDate] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<Milestone | null>(null)
  const [resetConfirm, setResetConfirm] = useState<Milestone | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm] =
    useState<CustomMilestoneForm>(EMPTY_CUSTOM)
  const [customFormError, setCustomFormError] = useState("")

  const milestones = useLiveQuery<Milestone[]>(
    () =>
      activeBaby
        ? milestoneRepository.getByBabyId(activeBaby.id)
        : Promise.resolve([]),
    [activeBaby?.id]
  )

  const grouped = useMemo(
    () =>
      AGE_RANGE_ORDER.reduce<Record<AgeRange, Milestone[]>>(
        (acc, range) => {
          acc[range] = (milestones ?? []).filter((m) => m.ageRange === range)
          return acc
        },
        {} as Record<AgeRange, Milestone[]>
      ),
    [milestones]
  )

  const ageRangeOptions = AGE_RANGE_ORDER.map((range) => ({
    value: range,
    label: t(`ageRanges.${range}`),
  }))

  if (!activeBaby) {
    return <EmptyState icon={Baby} message={t("milestones.selectBaby")} />
  }

  const openCustomForm = () => {
    setCustomForm(EMPTY_CUSTOM)
    setCustomFormError("")
    setShowCustomForm(true)
  }

  const saveEditDate = async () => {
    if (!editMilestone || !editDate) return
    try {
      await milestoneRepository.updateCompletedAt(editMilestone.id, editDate)
    } catch {
      // TODO: surface error to user
    }
    setEditMilestone(null)
  }

  const saveCustomMilestone = async () => {
    if (!customForm.title.trim()) {
      setCustomFormError(t("milestones.titleRequired"))
      return
    }
    try {
      await milestoneRepository.add({
        babyId: activeBaby.id,
        title: customForm.title.trim(),
        description: customForm.description.trim() || undefined,
        ageRange: customForm.ageRange,
        completed: false,
        completedAt: undefined,
        isSystem: false,
      })
      setCustomForm(EMPTY_CUSTOM)
      setCustomFormError("")
      setShowCustomForm(false)
    } catch {
      setCustomFormError(t("milestones.saveFailed"))
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-base font-semibold">{t("milestones.title")}</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {t("milestones.complete", {
              done: (milestones ?? []).filter((m) => m.completed).length,
              total: (milestones ?? []).length,
            })}
          </span>
          <Button size="xs" onClick={openCustomForm}>
            <Plus className="h-3.5 w-3.5" />
            {t("milestones.add")}
          </Button>
        </div>
      </div>

      {AGE_RANGE_ORDER.map((range) => {
        const items = grouped[range]
        if (!items?.length) return null
        const doneCount = items.filter((m) => m.completed).length
        return (
          <section key={range} className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <SectionHeader>{t(`ageRanges.${range}`)}</SectionHeader>
              <span className="text-xs text-muted-foreground">
                {doneCount}/{items.length}
              </span>
            </div>
            <ul className="space-y-1.5">
              {items.map((m) => (
                <MilestoneItem
                  key={m.id}
                  milestone={m}
                  onCheck={() => setConfirmMilestone(m)}
                  onEdit={() => {
                    setEditMilestone(m)
                    setEditDate(
                      m.completedAt
                        ? toISODateString(m.completedAt)
                        : toISODateString()
                    )
                  }}
                  onDelete={() => setDeleteConfirm(m)}
                  onReset={() => setResetConfirm(m)}
                />
              ))}
            </ul>
          </section>
        )
      })}

      {/* Confirm complete dialog */}
      <Dialog
        open={!!confirmMilestone}
        onOpenChange={(open) => !open && setConfirmMilestone(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <DialogTitle>{t("milestones.confirmCompleteTitle")}</DialogTitle>
            </div>
          </DialogHeader>
          {confirmMilestone && (
            <>
              <p className="text-sm font-medium">{confirmMilestone.title}</p>
              {confirmMilestone.description && (
                <p className="text-sm text-muted-foreground">
                  {confirmMilestone.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("milestones.confirmCompleteInfo")}
              </p>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmMilestone(null)}>
              {t("milestones.cancel")}
            </Button>
            <Button
              onClick={async () => {
                if (confirmMilestone) {
                  try {
                    await milestoneRepository.markComplete(confirmMilestone.id)
                  } catch {
                    // TODO: surface error to user
                  }
                }
                setConfirmMilestone(null)
              }}
            >
              <Check className="h-4 w-4" />
              {t("milestones.markComplete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit completion date dialog */}
      <Dialog
        open={!!editMilestone}
        onOpenChange={(open) => !open && setEditMilestone(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("milestones.editCompletionDate")}</DialogTitle>
            {editMilestone && (
              <DialogDescription>{editMilestone.title}</DialogDescription>
            )}
          </DialogHeader>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("milestones.completionDateLabel")}
            </label>
            <input
              type="date"
              className="input w-full"
              value={editDate}
              max={toISODateString()}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMilestone(null)}>
              {t("milestones.cancel")}
            </Button>
            <Button onClick={saveEditDate}>{t("milestones.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={t("milestones.deleteMilestoneTitle")}
        description={
          deleteConfirm ? (
            <>
              <p className="font-medium text-foreground">
                {deleteConfirm.title}
              </p>
              <p>{t("milestones.cannotBeUndone")}</p>
            </>
          ) : undefined
        }
        confirmLabel={t("milestones.delete")}
        cancelLabel={t("milestones.cancel")}
        onConfirm={async () => {
          if (deleteConfirm) {
            try {
              await milestoneRepository.delete(deleteConfirm.id)
            } catch {
              // TODO: surface error to user
            }
          }
        }}
      />

      <ConfirmDialog
        open={!!resetConfirm}
        onOpenChange={(open) => !open && setResetConfirm(null)}
        title={t("milestones.resetMilestoneTitle")}
        description={
          resetConfirm ? (
            <>
              <p className="font-medium text-foreground">
                {resetConfirm.title}
              </p>
              <p>{t("milestones.resetMilestoneInfo")}</p>
            </>
          ) : undefined
        }
        confirmLabel={t("milestones.reset")}
        cancelLabel={t("milestones.cancel")}
        variant="default"
        onConfirm={async () => {
          if (resetConfirm) {
            try {
              await milestoneRepository.reset(resetConfirm.id)
            } catch {
              // TODO: surface error to user
            }
          }
        }}
      />

      {/* Add custom milestone dialog */}
      <Dialog open={showCustomForm} onOpenChange={setShowCustomForm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("milestones.addCustomMilestone")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {t("milestones.titleLabel")}
              </label>
              <input
                className={cn(
                  "input w-full",
                  customFormError && "border-destructive"
                )}
                placeholder={t("milestones.titlePlaceholder")}
                value={customForm.title}
                onChange={(e) => {
                  setCustomForm({ ...customForm, title: e.target.value })
                  setCustomFormError("")
                }}
              />
              {customFormError && (
                <p className="mt-0.5 text-xs text-destructive">
                  {customFormError}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {t("milestones.descriptionLabel")}
              </label>
              <textarea
                className="input w-full resize-none"
                rows={2}
                placeholder={t("milestones.descriptionPlaceholder")}
                value={customForm.description}
                onChange={(e) =>
                  setCustomForm({ ...customForm, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {t("milestones.agePeriod")}
              </label>
              <ToggleButtons
                options={ageRangeOptions}
                value={customForm.ageRange}
                onChange={(range) =>
                  setCustomForm({ ...customForm, ageRange: range })
                }
                columns={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomForm(false)}>
              {t("milestones.cancel")}
            </Button>
            <Button onClick={saveCustomMilestone}>
              <Plus className="h-4 w-4" />
              {t("milestones.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Milestones

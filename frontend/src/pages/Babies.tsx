import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Baby as BabyIcon,
  ChevronRight,
  Cake,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { config } from "@/config"
import { useApp } from "@/contexts/AppContext"
import { babyRepository, milestoneRepository } from "@/db/repositories"
import { Field } from "@/components/common/Field"
import { DataPrivacyNote } from "@/components/DataPrivacyNote"
import {
  validateRequired,
  validatePositiveFloat,
  validatePositiveInt,
} from "@/utils/validate"
import type { Baby, Sex } from "@/types"
import { formatAge, isBirthday } from "@/utils/age"
import { toISODateString } from "@/utils/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BabyAvatar } from "@/components/common/BabyAvatar"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { ToggleButtons } from "@/components/common/ToggleButtons"

type FormState = {
  name: string
  dob: string
  sex: Sex
  weight: string
  height: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const EMPTY_FORM: FormState = {
  name: "",
  dob: "",
  sex: "boy",
  weight: "",
  height: "",
}

const Babies = () => {
  const { t } = useTranslation()
  const { babies, activeBaby, setActiveBabyId, refreshBabies } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const sexOptions: { value: Sex; label: string }[] = [
    { value: "boy", label: t("babies.boy") },
    { value: "girl", label: t("babies.girl") },
  ]

  const validate = (): boolean => {
    const e: FormErrors = {}
    const nameErr = validateRequired(form.name, "Name")
    if (nameErr) e.name = nameErr
    const dobErr = validateRequired(form.dob, "Date of birth")
    if (dobErr) e.dob = dobErr
    const weightErr = validatePositiveInt(form.weight, "weight (g)")
    if (weightErr) e.weight = weightErr
    const heightErr = validatePositiveFloat(form.height, "height (cm)")
    if (heightErr) e.height = heightErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (baby: Baby) => {
    setEditingId(baby.id)
    setForm({
      name: baby.name,
      dob: toISODateString(baby.dob),
      sex: baby.sex,
      weight: String(Math.round(baby.weight * 1000)),
      height: String(baby.height),
    })
    setErrors({})
    setShowForm(true)
  }

  const save = async () => {
    if (!validate()) return
    try {
      if (editingId) {
        await babyRepository.update(editingId, {
          name: form.name.trim(),
          dob: new Date(form.dob).toISOString(),
          sex: form.sex,
          weight: parseFloat(form.weight) / 1000,
          height: parseFloat(form.height),
        })
      } else {
        const baby = await babyRepository.add({
          name: form.name.trim(),
          dob: new Date(form.dob).toISOString(),
          sex: form.sex,
          weight: parseFloat(form.weight) / 1000,
          height: parseFloat(form.height),
        })
        await milestoneRepository.seedForBaby(baby.id)
        setActiveBabyId(baby.id)
      }
      await refreshBabies()
      setShowForm(false)
    } catch {
      // TODO: surface error to user
    }
  }

  const deleteBaby = async (id: string) => {
    try {
      await babyRepository.delete(id)
      await refreshBabies()
    } catch {
      // TODO: surface error to user
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {babies.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-base font-semibold">{t("nav.babies")}</h1>
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4" />
            {t("babies.addBaby")}
          </Button>
        </div>
      )}

      {babies.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <BabyIcon className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            {t("babies.welcome", { appName: config.VITE_APP_NAME })}
          </h2>
          <p className="mb-2 max-w-xs text-sm text-muted-foreground">
            {t("babies.startByAdding")}
          </p>
          <p className="mb-8 max-w-xs text-sm text-muted-foreground">
            {t("babies.unlockFeatures")}
          </p>
          <Button onClick={openAdd} size="lg">
            <Plus className="h-4 w-4" />
            {t("babies.addFirstBaby")}
          </Button>
          <button
            onClick={openAdd}
            className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <span>{t("babies.whatInfoNeeded")}</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {babies.map((baby) => (
          <li
            key={baby.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-colors",
              activeBaby?.id === baby.id
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/40"
            )}
          >
            <button
              onClick={() => setActiveBabyId(baby.id)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <BabyAvatar name={baby.name} sex={baby.sex} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {baby.name}
                  </span>
                  {activeBaby?.id === baby.id && (
                    <Badge variant="default" className="shrink-0 text-[10px]">
                      {t("babies.active")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {formatAge(baby.dob)}
                  {isBirthday(baby.dob) && (
                    <Cake className="h-3.5 w-3.5 shrink-0 text-pink-500" />
                  )}
                </div>
              </div>
            </button>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openEdit(baby)}
                aria-label={t("babies.save")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setConfirmDeleteId(baby.id)}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={t("babies.delete")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Add/Edit form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("babies.editBaby") : t("babies.addBabyModal")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Field label={t("babies.name")} error={errors.name}>
              <input
                className={cn("input", errors.name && "border-destructive")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("babies.namePlaceholder")}
              />
            </Field>
            <Field label={t("babies.dateOfBirth")} error={errors.dob}>
              <input
                type="date"
                className={cn("input", errors.dob && "border-destructive")}
                value={form.dob}
                max={toISODateString()}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </Field>
            <Field label={t("babies.sex")}>
              <ToggleButtons
                options={sexOptions}
                value={form.sex}
                onChange={(s) => setForm({ ...form, sex: s })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("babies.weightG")} error={errors.weight}>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className={cn("input", errors.weight && "border-destructive")}
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="3500"
                />
              </Field>
              <Field label={t("babies.heightCm")} error={errors.height}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={cn("input", errors.height && "border-destructive")}
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  placeholder="50"
                />
              </Field>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="flex-1"
            >
              {t("babies.cancel")}
            </Button>
            <Button onClick={save} className="flex-1">
              <Check className="h-4 w-4" />
              {editingId ? t("babies.save") : t("babies.add")}
            </Button>
          </div>
          <DataPrivacyNote />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title={t("babies.deleteBabyTitle")}
        description={t("babies.deleteBabyConfirm")}
        confirmLabel={t("babies.delete")}
        cancelLabel={t("babies.cancel")}
        onConfirm={() => confirmDeleteId && deleteBaby(confirmDeleteId)}
      />
    </div>
  )
}

export default Babies

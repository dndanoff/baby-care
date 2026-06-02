import { forwardRef, useRef, useState } from "react"
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import {
  babyRepository,
  milestoneRepository,
  feedingRepository,
  weightRepository,
  diaperRepository,
  dataRepository,
} from "@/db/repositories"
import { useApp } from "@/contexts/AppContext"
import {
  babiesToCsv,
  milestonesToCsv,
  feedingSessionsToCsv,
  weightEntriesToCsv,
  diaperEntriesToCsv,
  downloadCsv,
  parseBabiesCsv,
  parseMilestonesCsv,
  parseFeedingSessionsCsv,
  parseWeightEntriesCsv,
  parseDiaperEntriesCsv,
} from "@/utils/csv"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"
import { CONSTANTS } from "@/constants"
import { LanguageToggle } from "@/components/LanguageToggle"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SectionHeader } from "@/components/common/SectionHeader"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"

type ImportStatus =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string }

const FileInput = forwardRef<HTMLInputElement, { label: string }>(
  ({ label }, ref) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-muted">
      <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
        {label}
      </span>
      <input
        ref={ref}
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={() => {}}
      />
      <span className="text-xs text-primary">Browse</span>
    </label>
  )
)
FileInput.displayName = "FileInput"

const Settings = () => {
  const { t } = useTranslation()
  const { refreshBabies } = useApp()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    type: "idle",
  })
  const [confirmClear, setConfirmClear] = useState(false)

  const babiesFileRef = useRef<HTMLInputElement>(null)
  const milestonesFileRef = useRef<HTMLInputElement>(null)
  const feedingFileRef = useRef<HTMLInputElement>(null)
  const weightFileRef = useRef<HTMLInputElement>(null)
  const diaperFileRef = useRef<HTMLInputElement>(null)

  const exportBabies = async () => {
    const data = await babyRepository.getAll()
    downloadCsv(babiesToCsv(data), "babies.csv")
  }

  const exportMilestones = async () => {
    const data = await milestoneRepository.getAll()
    downloadCsv(milestonesToCsv(data), "milestones.csv")
  }

  const exportFeedingSessions = async () => {
    const data = await feedingRepository.getAll()
    downloadCsv(feedingSessionsToCsv(data), "feeding_sessions.csv")
  }

  const exportWeightEntries = async () => {
    const data = await weightRepository.getAll()
    downloadCsv(weightEntriesToCsv(data), "weight_entries.csv")
  }

  const exportDiaperEntries = async () => {
    const data = await diaperRepository.getAll()
    downloadCsv(diaperEntriesToCsv(data), "diaper_entries.csv")
  }

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })

  const importAll = async () => {
    const refs = {
      babies: babiesFileRef.current?.files?.[0],
      milestones: milestonesFileRef.current?.files?.[0],
      feedingSessions: feedingFileRef.current?.files?.[0],
      weightEntries: weightFileRef.current?.files?.[0],
      diaperEntries: diaperFileRef.current?.files?.[0],
    }

    if (!Object.values(refs).some(Boolean)) {
      setImportStatus({ type: "error", message: t("settings.selectCsvFile") })
      return
    }

    try {
      const payload: Parameters<typeof dataRepository.importData>[0] = {}

      if (refs.babies) {
        const result = parseBabiesCsv(await readFile(refs.babies))
        if (result.error) throw new Error(`babies.csv: ${result.error}`)
        payload.babies = result.data
      }
      if (refs.milestones) {
        const result = parseMilestonesCsv(await readFile(refs.milestones))
        if (result.error) throw new Error(`milestones.csv: ${result.error}`)
        payload.milestones = result.data
      }
      if (refs.feedingSessions) {
        const result = parseFeedingSessionsCsv(
          await readFile(refs.feedingSessions)
        )
        if (result.error)
          throw new Error(`feeding_sessions.csv: ${result.error}`)
        payload.feedingSessions = result.data
      }
      if (refs.weightEntries) {
        const result = parseWeightEntriesCsv(await readFile(refs.weightEntries))
        if (result.error) throw new Error(`weight_entries.csv: ${result.error}`)
        payload.weightEntries = result.data
      }
      if (refs.diaperEntries) {
        const result = parseDiaperEntriesCsv(await readFile(refs.diaperEntries))
        if (result.error) throw new Error(`diaper_entries.csv: ${result.error}`)
        payload.diaperEntries = result.data
      }

      await dataRepository.importData(payload)
      await refreshBabies()
      setImportStatus({ type: "success", message: t("settings.importSuccess") })

      if (babiesFileRef.current) babiesFileRef.current.value = ""
      if (milestonesFileRef.current) milestonesFileRef.current.value = ""
      if (feedingFileRef.current) feedingFileRef.current.value = ""
      if (weightFileRef.current) weightFileRef.current.value = ""
      if (diaperFileRef.current) diaperFileRef.current.value = ""
    } catch (err) {
      setImportStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Import failed.",
      })
    }
  }

  const clearAllData = async () => {
    try {
      await dataRepository.clearAll()
      localStorage.removeItem(CONSTANTS.storage.ACTIVE_BABY_KEY)
      await refreshBabies()
    } catch {
      // clearAll is best-effort; UI resets regardless
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-base font-semibold">{t("settings.title")}</h1>

      {/* Appearance */}
      <section className="mb-6">
        <SectionHeader className="mb-3">
          {t("settings.appearance")}
        </SectionHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span className="text-sm font-medium">
              {isDark ? t("settings.darkMode") : t("settings.lightMode")}
            </span>
            <Switch
              checked={isDark}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              aria-label={t("settings.toggleDarkMode")}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span className="text-sm font-medium">
              {t("settings.language")}
            </span>
            <LanguageToggle className="rounded-md border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" />
          </div>
        </div>
      </section>

      {/* Export */}
      <section className="mb-6">
        <SectionHeader className="mb-3">
          {t("settings.exportData")}
        </SectionHeader>
        <div className="space-y-2">
          {(
            [
              [exportBabies, t("settings.exportBabies")],
              [exportMilestones, t("settings.exportMilestones")],
              [exportFeedingSessions, t("settings.exportFeedingSessions")],
              [exportWeightEntries, t("settings.exportWeightEntries")],
              [exportDiaperEntries, t("settings.exportDiaperEntries")],
            ] as [() => void, string][]
          ).map(([handler, label]) => (
            <button
              key={label}
              onClick={handler}
              className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted"
            >
              <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-mono text-xs">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Import */}
      <section className="mb-6">
        <SectionHeader className="mb-1">
          {t("settings.importData")}
        </SectionHeader>
        <p className="mb-3 text-xs text-muted-foreground">
          <Trans
            i18nKey="settings.importWarning"
            components={{ strong: <strong /> }}
          />
        </p>
        <div className="space-y-2">
          <FileInput label="babies.csv" ref={babiesFileRef} />
          <FileInput label="milestones.csv" ref={milestonesFileRef} />
          <FileInput label="feeding_sessions.csv" ref={feedingFileRef} />
          <FileInput label="weight_entries.csv" ref={weightFileRef} />
          <FileInput label="diaper_entries.csv" ref={diaperFileRef} />
        </div>

        {importStatus.type !== "idle" && (
          <div
            className={cn(
              "mt-3 flex items-start gap-2 rounded-lg p-3 text-sm",
              importStatus.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {importStatus.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <Button variant="outline" onClick={importAll} className="mt-3 w-full">
          <Upload className="h-4 w-4" />
          {t("settings.importSelected")}
        </Button>
      </section>

      {/* Danger zone */}
      <section>
        <SectionHeader className="mb-3" variant="danger">
          {t("settings.dangerZone")}
        </SectionHeader>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex w-full items-center gap-3 rounded-lg border border-destructive/30 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5"
        >
          <Trash2 className="h-4 w-4" />
          {t("settings.clearAllData")}
        </button>
      </section>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title={t("settings.clearConfirmTitle")}
        icon={AlertTriangle}
        description={
          <Trans
            i18nKey="settings.clearConfirmWarning"
            components={{ strong: <strong /> }}
          />
        }
        confirmLabel={t("settings.deleteEverything")}
        cancelLabel={t("settings.cancel")}
        onConfirm={clearAllData}
      />
    </div>
  )
}

export default Settings

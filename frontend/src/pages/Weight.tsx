import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Scale, Baby, Plus, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { weightRepository } from "@/db/repositories"
import { useApp } from "@/contexts/AppContext"
import {
  formatWeightGrams,
  formatWeightDiff,
  toISODateString,
  toLocalTimeString,
} from "@/utils/format"
import { validatePositiveInt, validateRequired } from "@/utils/validate"
import { cn } from "@/lib/utils"
import { CONSTANTS } from "@/constants"
import { useNavigationGuard } from "@/hooks/useNavigationGuard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/common/EmptyState"
import { FormSection } from "@/components/common/FormSection"
import { SectionHeader } from "@/components/common/SectionHeader"
import { Time24Input } from "@/components/common/Time24Input"
import { LoadMore } from "@/components/common/LoadMore"
import type { WeightEntry } from "@/types"

const { PAGE_SIZE } = CONSTANTS.pagination

type ChartPoint = { label: string; weight: number; dateTime: string }

const WeightTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartPoint }>
}) => {
  if (!active || !payload?.length) return null
  const { dateTime, weight } = payload[0].payload
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">
        {new Date(dateTime).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p className="mt-0.5 font-semibold">{formatWeightGrams(weight)}</p>
    </div>
  )
}

const Weight = () => {
  const { t } = useTranslation()
  const { activeBaby } = useApp()
  const [weightInput, setWeightInput] = useState("")
  const [dateInput, setDateInput] = useState(toISODateString())
  const [timeInput, setTimeInput] = useState(toLocalTimeString())
  const [error, setError] = useState("")
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  const guard = useNavigationGuard(weightInput.trim() !== "")

  const allEntries = useLiveQuery<WeightEntry[]>(
    () =>
      activeBaby
        ? weightRepository.getByBabyId(activeBaby.id)
        : Promise.resolve([]),
    [activeBaby?.id]
  )

  const visibleEntries = allEntries?.slice(0, visibleCount)

  const chartData: ChartPoint[] = allEntries
    ? [...allEntries].reverse().map((e) => ({
        label: new Date(e.dateTime).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
        weight: e.weightGrams,
        dateTime: e.dateTime,
      }))
    : []
  const hasMore = allEntries ? visibleCount < allEntries.length : false

  const addEntry = async (): Promise<boolean> => {
    const weightErr = validatePositiveInt(weightInput, "weight in grams")
    if (weightErr) {
      setError(weightErr)
      return false
    }
    const dateErr = validateRequired(dateInput, "Date")
    if (dateErr) {
      setError(dateErr)
      return false
    }
    if (!activeBaby) return false

    try {
      await weightRepository.add({
        babyId: activeBaby.id,
        dateTime: `${dateInput}T${timeInput}`,
        weightGrams: parseInt(weightInput, 10),
      })
      setWeightInput("")
      setDateInput(toISODateString())
      setTimeInput(toLocalTimeString())
      setError("")
      return true
    } catch {
      setError("Failed to save entry. Please try again.")
      return false
    }
  }

  const handleSaveAndLeave = async () => {
    const saved = await addEntry()
    if (saved) guard.proceed()
  }

  if (!activeBaby) {
    return <EmptyState icon={Baby} message={t("weight.selectBaby")} />
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Scale className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-base font-semibold">{t("weight.title")}</h1>
      </div>

      <FormSection title={t("weight.addMeasurement")} className="mb-6">
        <div className="mb-2">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            {t("weight.weightG")}
          </label>
          <input
            type="number"
            step="1"
            min="0"
            className={cn("input w-full", error && "border-destructive")}
            placeholder="3500"
            value={weightInput}
            onChange={(e) => {
              setWeightInput(e.target.value)
              setError("")
            }}
            onKeyDown={(e) => e.key === "Enter" && addEntry()}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("weight.date")}
            </label>
            <input
              type="date"
              className="input w-full"
              value={dateInput}
              max={toISODateString()}
              onChange={(e) => {
                setDateInput(e.target.value)
                setError("")
              }}
            />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("weight.time")}
            </label>
            <Time24Input
              value={timeInput}
              onChange={(v) => {
                setTimeInput(v)
                setError("")
              }}
            />
          </div>
        </div>
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        <Button onClick={addEntry} className="mt-3 w-full">
          <Plus className="h-4 w-4" />
          {t("weight.add")}
        </Button>
      </FormSection>

      {chartData.length >= 2 && (
        <div className="mb-6 rounded-lg border p-4">
          <SectionHeader className="mb-3">{t("weight.progress")}</SectionHeader>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 8, bottom: 0, left: -8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}`}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
                domain={["auto", "auto"]}
                unit=" kg"
              />
              <Tooltip content={<WeightTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {allEntries && allEntries.length > 0 ? (
        <div>
          <SectionHeader className="mb-2">
            {t("weight.measurements")}
          </SectionHeader>
          <ul className="space-y-1.5">
            {visibleEntries!.map((entry, i) => {
              const prev = visibleEntries![i + 1]
              const diff =
                prev != null ? entry.weightGrams - prev.weightGrams : null
              return (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(entry.dateTime).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono font-medium">
                        {formatWeightGrams(entry.weightGrams)}
                      </span>
                      {diff !== null && (
                        <span
                          className={cn(
                            "ml-1.5 text-xs",
                            diff > 0
                              ? "text-green-600"
                              : diff < 0
                                ? "text-destructive"
                                : "text-muted-foreground"
                          )}
                        >
                          {formatWeightDiff(diff)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => weightRepository.delete(entry.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={t("weight.delete")}
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
            label={t("weight.loadMore")}
          />
        </div>
      ) : (
        allEntries && (
          <EmptyState
            icon={Scale}
            message={t("weight.noMeasurements")}
            variant="dashed"
          />
        )
      )}

      <Dialog
        open={guard.isBlocked}
        onOpenChange={(open) => !open && guard.cancel()}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("weight.unsavedMeasurement")}</DialogTitle>
            <DialogDescription>{t("weight.unsavedWarning")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button onClick={handleSaveAndLeave} className="w-full">
              <Plus className="h-4 w-4" />
              {t("weight.saveAndLeave")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={guard.cancel}
                className="flex-1"
              >
                {t("weight.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={guard.proceed}
                className="flex-1"
              >
                {t("weight.discardAndLeave")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Weight

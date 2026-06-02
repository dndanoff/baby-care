import { useState, useEffect, useRef } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Baby, Plus, Trash2, Droplets } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { diaperRepository } from "@/db/repositories"
import { useApp } from "@/contexts/AppContext"
import { toISODateString, toLocalTimeString } from "@/utils/format"
import { cn } from "@/lib/utils"
import { CONSTANTS } from "@/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/EmptyState"
import { FormSection } from "@/components/common/FormSection"
import { SectionHeader } from "@/components/common/SectionHeader"
import { ToggleButtons } from "@/components/common/ToggleButtons"
import { Time24Input } from "@/components/common/Time24Input"
import type { DiaperEntry, DiaperType } from "@/types"

const { PAGE_SIZE } = CONSTANTS.pagination

type DayBar = { date: string; wet: number; soiled: number; both: number }

const DIAPER_COLORS = {
  wet: "var(--foreground)",
  soiled: "var(--muted-foreground)",
  both: "color-mix(in srgb, var(--foreground) 25%, transparent)",
}

const buildChartData = (entries: DiaperEntry[]): DayBar[] => {
  const dayMap = new Map<string, DayBar>()
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString([], { month: "short", day: "numeric" })
    dayMap.set(key, { date: key, wet: 0, soiled: 0, both: 0 })
  }
  for (const entry of entries) {
    const key = new Date(entry.dateTime).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })
    if (dayMap.has(key)) {
      dayMap.get(key)![entry.type]++
    }
  }
  return Array.from(dayMap.values())
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

const Diaper = () => {
  const { t } = useTranslation()
  const { activeBaby } = useApp()
  const [diaperType, setDiaperType] = useState<DiaperType>("wet")
  const [dateInput, setDateInput] = useState(toISODateString())
  const [timeInput, setTimeInput] = useState(toLocalTimeString())
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const typeOptions: { value: DiaperType; label: string }[] = [
    { value: "wet", label: t("diaper.wet") },
    { value: "soiled", label: t("diaper.soiled") },
    { value: "both", label: t("diaper.both") },
  ]

  const allEntries = useLiveQuery<DiaperEntry[]>(
    () =>
      activeBaby
        ? diaperRepository.getByBabyId(activeBaby.id)
        : Promise.resolve([]),
    [activeBaby?.id]
  )

  const todayEntries = useLiveQuery<DiaperEntry[]>(
    () =>
      activeBaby
        ? diaperRepository.getTodayByBabyId(activeBaby.id)
        : Promise.resolve([]),
    [activeBaby?.id]
  )

  const hasMore = allEntries ? visibleCount < allEntries.length : false
  const visibleEntries = allEntries?.slice(0, visibleCount)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE)
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore])

  const chartData = allEntries ? buildChartData(allEntries) : []
  const hasChartData = allEntries && allEntries.length > 0

  const addEntry = async () => {
    if (!activeBaby) return
    await diaperRepository.add({
      babyId: activeBaby.id,
      dateTime: `${dateInput}T${timeInput}`,
      type: diaperType,
    })
    setDateInput(toISODateString())
    setTimeInput(toLocalTimeString())
  }

  if (!activeBaby) {
    return <EmptyState icon={Baby} message={t("diaper.selectBaby")} />
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Droplets className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-base font-semibold">{t("diaper.title")}</h1>
      </div>

      <FormSection title={t("diaper.logChange")} className="mb-6">
        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t("diaper.type")}
          </label>
          <ToggleButtons
            options={typeOptions}
            value={diaperType}
            onChange={setDiaperType}
            activeClass="bg-foreground border-foreground text-background"
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
              onChange={(e) => setDateInput(e.target.value)}
            />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("weight.time")}
            </label>
            <Time24Input value={timeInput} onChange={setTimeInput} />
          </div>
        </div>

        <Button onClick={addEntry} className="mt-3 w-full">
          <Plus className="h-4 w-4" />
          {t("diaper.log")}
        </Button>
      </FormSection>

      {todayEntries && todayEntries.length > 0 && (
        <FormSection title={t("diaper.todayStats")} className="mb-6">
          <div className="grid grid-cols-4 gap-2 text-center">
            {(["wet", "soiled", "both"] as DiaperType[]).map((type) => {
              const count = todayEntries.filter((e) => e.type === type).length
              return (
                <div key={type} className="flex flex-col gap-0.5">
                  <span className="text-2xl font-bold tabular-nums">
                    {count}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {t(`diaper.${type}`)}
                  </span>
                </div>
              )
            })}
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold tabular-nums">
                {todayEntries.length}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t("diaper.total")}
              </span>
            </div>
          </div>
        </FormSection>
      )}

      {hasChartData && (
        <div className="mb-6 rounded-lg border p-4">
          <SectionHeader className="mb-3">
            {t("diaper.last14Days")}
          </SectionHeader>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
              barSize={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
              />
              <Bar
                dataKey="wet"
                name={t("diaper.wet")}
                stackId="a"
                fill={DIAPER_COLORS.wet}
                radius={[0, 0, 2, 2]}
              />
              <Bar
                dataKey="soiled"
                name={t("diaper.soiled")}
                stackId="a"
                fill={DIAPER_COLORS.soiled}
              />
              <Bar
                dataKey="both"
                name={t("diaper.both")}
                stackId="a"
                fill={DIAPER_COLORS.both}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {allEntries && allEntries.length > 0 ? (
        <div>
          <SectionHeader className="mb-2">
            {t("diaper.recentChanges")}
          </SectionHeader>
          <ul className="space-y-1.5">
            {visibleEntries!.map((entry) => (
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t(`diaper.${entry.type}`)}</Badge>
                  <button
                    onClick={() => diaperRepository.delete(entry.id)}
                    className={cn(
                      "rounded p-1 text-muted-foreground",
                      "hover:bg-destructive/10 hover:text-destructive"
                    )}
                    aria-label={t("diaper.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {hasMore && <div ref={sentinelRef} className="h-4" />}
        </div>
      ) : (
        allEntries && (
          <EmptyState
            icon={Droplets}
            message={t("diaper.noChanges")}
            variant="dashed"
          />
        )
      )}
    </div>
  )
}

export default Diaper

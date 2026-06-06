import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { FeedingSession } from "@/types"

type DayBar = { date: string; count: number }

const buildChartData = (entries: FeedingSession[]): DayBar[] => {
  const dayMap = new Map<string, DayBar>()
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString([], { month: "short", day: "numeric" })
    dayMap.set(key, { date: key, count: 0 })
  }
  for (const entry of entries) {
    const key = new Date(entry.startTime).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })
    if (dayMap.has(key)) {
      dayMap.get(key)!.count++
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
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{label}</p>
      <p className="mt-0.5 text-muted-foreground">
        {payload[0].value} feedings
      </p>
    </div>
  )
}

export const FeedingsPerDayChart = ({
  entries,
}: {
  entries: FeedingSession[]
}) => {
  if (!entries.length) return null
  const data = buildChartData(entries)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={24}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="count" fill="var(--primary)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

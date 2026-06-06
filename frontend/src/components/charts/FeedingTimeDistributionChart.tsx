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

type SlotBar = { slot: string; count: number }

const buildChartData = (entries: FeedingSession[]): SlotBar[] => {
  const slots: SlotBar[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      slots.push({
        slot: `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`,
        count: 0,
      })
    }
  }
  for (const entry of entries) {
    const d = new Date(entry.startTime)
    const h = d.getHours()
    const halfHour = d.getMinutes() < 30 ? 0 : 1
    slots[h * 2 + halfHour].count++
  }
  return slots
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

export const FeedingTimeDistributionChart = ({
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
          dataKey="slot"
          tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          interval={5}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={24}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="count" fill="var(--primary)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

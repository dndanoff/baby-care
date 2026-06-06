import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatWeightGrams } from "@/utils/format"
import type { WeightEntry } from "@/types"

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

export const WeightProgressChart = ({
  entries,
}: {
  entries: WeightEntry[]
}) => {
  const chartData: ChartPoint[] = [...entries].reverse().map((e) => ({
    label: new Date(e.dateTime).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }),
    weight: e.weightGrams,
    dateTime: e.dateTime,
  }))

  if (chartData.length < 2) return null

  return (
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
  )
}

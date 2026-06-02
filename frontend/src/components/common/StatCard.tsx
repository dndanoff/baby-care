import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"

export const StatCard = ({
  icon: Icon,
  label,
  value,
  meta,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  meta?: React.ReactNode
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-4 rounded-xl border bg-card px-4 py-4 text-left shadow-sm transition-colors hover:bg-muted/50"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-lg leading-tight font-bold">{value}</div>
      {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
  </button>
)

import { cn } from "@/lib/utils"

type Option<T> = {
  value: T
  label: string
}

export const ToggleButtons = <T,>({
  options,
  value,
  onChange,
  columns,
  activeClass = "border-primary bg-primary text-primary-foreground",
}: {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  columns?: number
  activeClass?: string
}) => (
  <div
    className={cn(columns ? "grid gap-1.5" : "flex flex-wrap gap-1.5")}
    style={
      columns
        ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
        : undefined
    }
  >
    {options.map((opt) => (
      <button
        key={String(opt.value)}
        type="button"
        onClick={() => onChange(opt.value)}
        className={cn(
          "flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors",
          value === opt.value
            ? activeClass
            : "border-border text-muted-foreground hover:bg-muted"
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

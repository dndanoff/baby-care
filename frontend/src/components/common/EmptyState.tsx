import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export const EmptyState = ({
  icon: Icon,
  message,
  variant = "centered",
}: {
  icon: LucideIcon
  message: string
  variant?: "centered" | "dashed"
}) => {
  if (variant === "dashed") {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Icon className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    )
  }
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-12 text-center"
      )}
    >
      <Icon className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

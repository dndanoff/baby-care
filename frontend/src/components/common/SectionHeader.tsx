import { cn } from "@/lib/utils"

export const SectionHeader = ({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "danger"
}) => (
  <h2
    className={cn(
      "text-xs font-semibold tracking-wide uppercase",
      variant === "danger" ? "text-destructive" : "text-muted-foreground",
      className
    )}
  >
    {children}
  </h2>
)

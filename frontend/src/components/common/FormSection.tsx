import { cn } from "@/lib/utils"
import { SectionHeader } from "./SectionHeader"

export const FormSection = ({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn("rounded-lg border p-4", className)}>
    {title && <SectionHeader className="mb-3">{title}</SectionHeader>}
    {children}
  </div>
)

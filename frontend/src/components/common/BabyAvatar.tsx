import { cn } from "@/lib/utils"
import type { Sex } from "@/types"

export const BabyAvatar = ({
  name,
  sex,
  size = "md",
}: {
  name: string
  sex: Sex
  size?: "sm" | "md"
}) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center rounded-full text-xs font-semibold",
      size === "sm" ? "h-7 w-7" : "h-8 w-8",
      sex === "boy" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
    )}
  >
    {name[0].toUpperCase()}
  </div>
)

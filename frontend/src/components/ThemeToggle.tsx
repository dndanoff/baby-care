import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={
        className ??
        "rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      }
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}

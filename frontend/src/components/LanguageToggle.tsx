import { useTranslation } from "react-i18next"
import { LANGUAGE_KEY } from "@/i18n"

export const LanguageToggle = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation()
  const isEn = i18n.language === "en"

  const toggle = () => {
    const next = isEn ? "bg" : "en"
    i18n.changeLanguage(next)
    localStorage.setItem(LANGUAGE_KEY, next)
  }

  return (
    <button
      onClick={toggle}
      className={
        className ??
        "rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
      }
      aria-label={isEn ? "Switch to Bulgarian" : "Switch to English"}
    >
      {isEn ? "BG" : "EN"}
    </button>
  )
}

import { useRegisterSW } from "virtual:pwa-register/react"
import { RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"

export const UpdateBanner = () => {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="flex items-center gap-2 border-b bg-primary/5 px-4 py-2 text-sm">
      <RefreshCw className="h-4 w-4 shrink-0 text-primary" />
      <span className="flex-1 text-xs">{t("updateBanner.text")}</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t("updateBanner.update")}
      </button>
    </div>
  )
}

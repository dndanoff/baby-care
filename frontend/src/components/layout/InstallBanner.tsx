import { useEffect, useState } from "react"
import { Download, Share2, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { config } from "@/config"
import {
  getPendingInstallPrompt,
  clearPendingInstallPrompt,
  onInstallPromptReady,
  isIOS,
  isInStandaloneMode,
} from "@/lib/pwa"

export const InstallBanner = () => {
  const { t } = useTranslation()
  const [hasAndroidPrompt, setHasAndroidPrompt] = useState(
    () => !!getPendingInstallPrompt()
  )
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => onInstallPromptReady(() => setHasAndroidPrompt(true)), [])

  if (dismissed || isInStandaloneMode()) return null

  if (isIOS()) {
    return (
      <div className="flex items-center gap-2 border-b bg-primary/5 px-4 py-2 text-sm">
        <Share2 className="h-4 w-4 shrink-0 text-primary" />
        <span className="flex-1 text-xs">{t("installBanner.iosText")}</span>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
          aria-label={t("installBanner.dismiss")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  if (!hasAndroidPrompt) return null

  const install = async () => {
    const prompt = getPendingInstallPrompt()
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") clearPendingInstallPrompt()
    setDismissed(true)
  }

  return (
    <div className="flex items-center gap-2 border-b bg-primary/5 px-4 py-2 text-sm">
      <Download className="h-4 w-4 shrink-0 text-primary" />
      <span className="flex-1 text-xs">
        {t("installBanner.text", { appName: config.VITE_APP_NAME })}
      </span>
      <button
        onClick={install}
        className="rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t("installBanner.install")}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="rounded p-1 text-muted-foreground hover:bg-muted"
        aria-label={t("installBanner.dismiss")}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

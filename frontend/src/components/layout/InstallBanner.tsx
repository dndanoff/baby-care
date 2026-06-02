import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { config } from "@/config"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export const InstallBanner = () => {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const install = async () => {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") setDeferredPrompt(null)
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

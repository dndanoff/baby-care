interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let pendingPrompt: BeforeInstallPromptEvent | null = null
const promptListeners = new Set<() => void>()

window.addEventListener("beforeinstallprompt", (e: Event) => {
  e.preventDefault()
  pendingPrompt = e as BeforeInstallPromptEvent
  promptListeners.forEach((cb) => cb())
})

export const getPendingInstallPrompt = () => pendingPrompt

export const clearPendingInstallPrompt = () => {
  pendingPrompt = null
}

export const onInstallPromptReady = (cb: () => void): (() => void) => {
  promptListeners.add(cb)
  return () => {
    promptListeners.delete(cb)
  }
}

export const isIOS = () => {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true
  // iPads on iOS 13+ report as MacIntel with touch support
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
}

export const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true

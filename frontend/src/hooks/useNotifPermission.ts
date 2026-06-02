import { useState } from "react"

export const useNotifPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    "Notification" in window ? Notification.permission : "denied"
  )

  const request = async () => {
    if (!("Notification" in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  return { permission, request }
}

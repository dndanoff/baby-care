import { useState } from "react"

export const useNotifPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    "Notification" in window ? Notification.permission : "denied"
  )
  const [prompted, setPrompted] = useState(false)

  const request = async () => {
    if (!("Notification" in window)) return
    setPrompted(true)
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  return { permission, prompted, request }
}

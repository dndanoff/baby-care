export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export const formatWeightGrams = (grams: number): string =>
  `${grams.toLocaleString()} g`

export const formatWeightDiff = (diff: number): string =>
  `${diff > 0 ? "+" : ""}${diff} g`

/**
 * Returns the date portion of an ISO-8601 string as `YYYY-MM-DD`.
 * Accepts a full ISO string or an existing `YYYY-MM-DD` string.
 * When called with no argument (or `undefined`) it returns today's date.
 */
export const toISODateString = (date?: string | Date): string => {
  if (date === undefined) return new Date().toISOString().split("T")[0]
  if (typeof date === "string") return date.split("T")[0]
  return date.toISOString().split("T")[0]
}

/**
 * Formats a millisecond gap between two feeding sessions as a human-readable string.
 * e.g. 8100000 ms → "2h 15m"
 */
export const formatFeedingGap = (ms: number): string => {
  const totalMin = Math.round(ms / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Returns a human-readable "time ago" string from an ISO timestamp.
 * e.g. "45m ago", "2h ago", "3 days ago"
 */
export const formatTimeAgo = (isoString: string): string => {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffDays = Math.floor(diffH / 24)
  return `${diffDays}d ago`
}

/**
 * Returns the current local time as `HH:MM`, suitable for `<input type="time">`.
 */
export const toLocalTimeString = (date?: Date): string => {
  const d = date ?? new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

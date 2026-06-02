import type { AgeRange } from "@/types"

export const getAgeInMonths = (dob: string): number => {
  const birth = new Date(dob)
  const now = new Date()
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  return Math.max(0, months)
}

export const getAgeRange = (dob: string): AgeRange => {
  const months = getAgeInMonths(dob)
  if (months < 3) return "0-3m"
  if (months < 6) return "3-6m"
  if (months < 12) return "6-12m"
  return "12-24m"
}

export const isBirthday = (dob: string): boolean => {
  const birth = new Date(dob)
  const now = new Date()
  return (
    birth.getMonth() === now.getMonth() && birth.getDate() === now.getDate()
  )
}

export const formatAge = (dob: string): string => {
  const birth = new Date(dob)
  const today = new Date()

  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  let days = today.getDate() - birth.getDate()

  if (days < 0) {
    months--
    // Days in the month before today's month
    const daysInPrevMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate()
    days += daysInPrevMonth
  }

  if (months < 0) {
    years--
    months += 12
  }

  const parts: string[] = []
  if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`)
  if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`)
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`)

  if (parts.length === 0) return "newborn"
  return parts.join(" ") + " old"
}

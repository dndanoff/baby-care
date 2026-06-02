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

export const formatAge = (dob: string): string => {
  const months = getAgeInMonths(dob)
  if (months < 1) {
    const days = Math.floor(
      (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24)
    )
    return `${days} day${days !== 1 ? "s" : ""} old`
  }
  if (months < 24) return `${months} month${months !== 1 ? "s" : ""} old`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0
    ? `${years}y ${rem}m old`
    : `${years} year${years !== 1 ? "s" : ""} old`
}

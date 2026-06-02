export type Sex = "boy" | "girl"

export type AgeRange = "0-3m" | "3-6m" | "6-12m" | "12-24m"

export interface Baby {
  id: string
  name: string
  dob: string // ISO date string
  sex: Sex
  weight: number // kg
  height: number // cm
  createdAt: string
}

export interface Milestone {
  id: string
  babyId: string
  title: string
  description?: string
  ageRange: AgeRange
  completed: boolean
  completedAt?: string
  createdAt: string
  // system=true means predefined (not user-created); used to restrict editing title/ageRange
  isSystem: boolean
}

export type FeedingType =
  | "left-breast"
  | "right-breast"
  | "both-breasts"
  | "formula"
  | "formula-and-breast"

export interface FeedingSession {
  id: string
  babyId: string
  startTime: string
  endTime?: string
  duration?: number // seconds
  feedingType?: FeedingType
}

export interface WeightEntry {
  id: string
  babyId: string
  dateTime: string // ISO datetime string
  weightGrams: number
  createdAt: string
}

export type DiaperType = "wet" | "soiled" | "both"

export interface DiaperEntry {
  id: string
  babyId: string
  dateTime: string // ISO datetime string
  type: DiaperType
  createdAt: string
}

export interface AppSettings {
  activeBabyId?: string
}

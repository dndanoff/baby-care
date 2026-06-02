import type {
  Baby,
  Milestone,
  FeedingSession,
  WeightEntry,
  DiaperEntry,
} from "@/types"

// ─── Serialisation ──────────────────────────────────────────────────────────

const escapeCsv = (
  value: string | number | boolean | undefined | null
): string => {
  if (value === undefined || value === null) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const row = (
  values: (string | number | boolean | undefined | null)[]
): string => values.map(escapeCsv).join(",")

export const babiesToCsv = (babies: Baby[]): string => {
  const header = row([
    "id",
    "name",
    "dob",
    "sex",
    "weight",
    "height",
    "createdAt",
  ])
  const rows = babies.map((b) =>
    row([b.id, b.name, b.dob, b.sex, b.weight, b.height, b.createdAt])
  )
  return [header, ...rows].join("\n")
}

export const milestonesToCsv = (milestones: Milestone[]): string => {
  const header = row([
    "id",
    "babyId",
    "title",
    "description",
    "ageRange",
    "completed",
    "completedAt",
    "createdAt",
    "isSystem",
  ])
  const rows = milestones.map((m) =>
    row([
      m.id,
      m.babyId,
      m.title,
      m.description ?? "",
      m.ageRange,
      m.completed,
      m.completedAt ?? "",
      m.createdAt,
      m.isSystem,
    ])
  )
  return [header, ...rows].join("\n")
}

export const feedingSessionsToCsv = (sessions: FeedingSession[]): string => {
  const header = row([
    "id",
    "babyId",
    "startTime",
    "endTime",
    "duration",
    "feedingType",
  ])
  const rows = sessions.map((s) =>
    row([
      s.id,
      s.babyId,
      s.startTime,
      s.endTime ?? "",
      s.duration ?? "",
      s.feedingType ?? "",
    ])
  )
  return [header, ...rows].join("\n")
}

export const weightEntriesToCsv = (entries: WeightEntry[]): string => {
  const header = row(["id", "babyId", "dateTime", "weightGrams", "createdAt"])
  const rows = entries.map((e) =>
    row([e.id, e.babyId, e.dateTime, e.weightGrams, e.createdAt])
  )
  return [header, ...rows].join("\n")
}

export const diaperEntriesToCsv = (entries: DiaperEntry[]): string => {
  const header = row(["id", "babyId", "dateTime", "type", "createdAt"])
  const rows = entries.map((e) =>
    row([e.id, e.babyId, e.dateTime, e.type, e.createdAt])
  )
  return [header, ...rows].join("\n")
}

// ─── Download helper ─────────────────────────────────────────────────────────

export const downloadCsv = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

const parseCsvLine = (line: string): string[] => {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

const parseCsv = (
  text: string
): { headers: string[]; rows: Record<string, string>[] } => {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 1) return { headers: [], rows: [] }
  const headers = parseCsvLine(lines[0])
  const rows = lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseCsvLine(line)
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        obj[h] = values[i] ?? ""
      })
      return obj
    })
  return { headers, rows }
}

// ─── Validation ──────────────────────────────────────────────────────────────

const BABIES_REQUIRED = [
  "id",
  "name",
  "dob",
  "sex",
  "weight",
  "height",
  "createdAt",
]
const MILESTONES_REQUIRED = [
  "id",
  "babyId",
  "title",
  "ageRange",
  "completed",
  "createdAt",
  "isSystem",
]
const FEEDING_REQUIRED = ["id", "babyId", "startTime"]
const WEIGHT_REQUIRED = ["id", "babyId", "dateTime", "weightGrams", "createdAt"]
const DIAPER_REQUIRED = ["id", "babyId", "dateTime", "type", "createdAt"]

const validateHeaders = (
  actual: string[],
  required: string[]
): string | null => {
  const missing = required.filter((h) => !actual.includes(h))
  if (missing.length > 0) return `Missing columns: ${missing.join(", ")}`
  return null
}

export interface ParseResult<T> {
  data: T[]
  error: string | null
}

export const parseBabiesCsv = (text: string): ParseResult<Baby> => {
  const { headers, rows } = parseCsv(text)
  const err = validateHeaders(headers, BABIES_REQUIRED)
  if (err) return { data: [], error: err }

  const data: Baby[] = []
  for (const r of rows) {
    const weight = parseFloat(r.weight)
    const height = parseFloat(r.height)
    if (
      !r.id ||
      !r.name ||
      !r.dob ||
      !r.sex ||
      isNaN(weight) ||
      isNaN(height)
    ) {
      return {
        data: [],
        error: `Invalid row in babies.csv: ${JSON.stringify(r)}`,
      }
    }
    data.push({
      id: r.id,
      name: r.name,
      dob: r.dob,
      sex: r.sex as Baby["sex"],
      weight,
      height,
      createdAt: r.createdAt,
    })
  }
  return { data, error: null }
}

export const parseMilestonesCsv = (text: string): ParseResult<Milestone> => {
  const { headers, rows } = parseCsv(text)
  const err = validateHeaders(headers, MILESTONES_REQUIRED)
  if (err) return { data: [], error: err }

  const data: Milestone[] = []
  for (const r of rows) {
    if (!r.id || !r.babyId || !r.title || !r.ageRange) {
      return {
        data: [],
        error: `Invalid row in milestones.csv: ${JSON.stringify(r)}`,
      }
    }
    data.push({
      id: r.id,
      babyId: r.babyId,
      title: r.title,
      description: r.description || undefined,
      ageRange: r.ageRange as Milestone["ageRange"],
      completed: r.completed === "true",
      completedAt: r.completedAt || undefined,
      createdAt: r.createdAt,
      isSystem: r.isSystem === "true",
    })
  }
  return { data, error: null }
}

export const parseFeedingSessionsCsv = (
  text: string
): ParseResult<FeedingSession> => {
  const { headers, rows } = parseCsv(text)
  const err = validateHeaders(headers, FEEDING_REQUIRED)
  if (err) return { data: [], error: err }

  const data: FeedingSession[] = []
  for (const r of rows) {
    if (!r.id || !r.babyId || !r.startTime) {
      return {
        data: [],
        error: `Invalid row in feeding_sessions.csv: ${JSON.stringify(r)}`,
      }
    }
    data.push({
      id: r.id,
      babyId: r.babyId,
      startTime: r.startTime,
      endTime: r.endTime || undefined,
      duration: r.duration ? parseFloat(r.duration) : undefined,
      feedingType: (r.feedingType ||
        undefined) as FeedingSession["feedingType"],
    })
  }
  return { data, error: null }
}

export const parseWeightEntriesCsv = (
  text: string
): ParseResult<WeightEntry> => {
  const { headers, rows } = parseCsv(text)
  const err = validateHeaders(headers, WEIGHT_REQUIRED)
  if (err) return { data: [], error: err }

  const data: WeightEntry[] = []
  for (const r of rows) {
    const weightGrams = parseFloat(r.weightGrams)
    if (!r.id || !r.babyId || !r.dateTime || isNaN(weightGrams)) {
      return {
        data: [],
        error: `Invalid row in weight_entries.csv: ${JSON.stringify(r)}`,
      }
    }
    data.push({
      id: r.id,
      babyId: r.babyId,
      dateTime: r.dateTime,
      weightGrams,
      createdAt: r.createdAt,
    })
  }
  return { data, error: null }
}

export const parseDiaperEntriesCsv = (
  text: string
): ParseResult<DiaperEntry> => {
  const { headers, rows } = parseCsv(text)
  const err = validateHeaders(headers, DIAPER_REQUIRED)
  if (err) return { data: [], error: err }

  const data: DiaperEntry[] = []
  for (const r of rows) {
    if (!r.id || !r.babyId || !r.dateTime || !r.type) {
      return {
        data: [],
        error: `Invalid row in diaper_entries.csv: ${JSON.stringify(r)}`,
      }
    }
    data.push({
      id: r.id,
      babyId: r.babyId,
      dateTime: r.dateTime,
      type: r.type as DiaperEntry["type"],
      createdAt: r.createdAt,
    })
  }
  return { data, error: null }
}

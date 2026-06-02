import { db } from "@/db/database"
import { nanoid } from "@/utils/nanoid"
import type { DiaperEntry } from "@/types"

export const diaperRepository = {
  getAll: () => db.diaperEntries.toArray(),

  getByBabyId: async (babyId: string): Promise<DiaperEntry[]> => {
    const rows = await db.diaperEntries
      .where("babyId")
      .equals(babyId)
      .sortBy("dateTime")
    return rows.reverse()
  },

  add: async (
    data: Omit<DiaperEntry, "id" | "createdAt">
  ): Promise<DiaperEntry> => {
    const entry: DiaperEntry = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    }
    await db.diaperEntries.add(entry)
    return entry
  },

  getLatestByBabyId: async (
    babyId: string
  ): Promise<DiaperEntry | undefined> => {
    const rows = await db.diaperEntries
      .where("babyId")
      .equals(babyId)
      .sortBy("dateTime")
    return rows[rows.length - 1]
  },

  getTodayByBabyId: async (babyId: string): Promise<DiaperEntry[]> => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const rows = await db.diaperEntries
      .where("babyId")
      .equals(babyId)
      .sortBy("dateTime")
    return rows.filter(
      (e) => new Date(e.dateTime).getTime() >= todayStart.getTime()
    )
  },

  delete: (id: string) => db.diaperEntries.delete(id),
}

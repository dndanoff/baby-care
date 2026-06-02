import { db } from "@/db/database"
import { nanoid } from "@/utils/nanoid"
import type { WeightEntry } from "@/types"

export const weightRepository = {
  getAll: () => db.weightEntries.toArray(),

  getByBabyId: async (babyId: string): Promise<WeightEntry[]> => {
    const rows = await db.weightEntries
      .where("babyId")
      .equals(babyId)
      .sortBy("dateTime")
    return rows.reverse()
  },

  add: async (
    data: Omit<WeightEntry, "id" | "createdAt">
  ): Promise<WeightEntry> => {
    const entry: WeightEntry = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    }
    await db.weightEntries.add(entry)
    return entry
  },

  getLatestByBabyId: async (
    babyId: string
  ): Promise<WeightEntry | undefined> => {
    const rows = await db.weightEntries
      .where("babyId")
      .equals(babyId)
      .sortBy("dateTime")
    return rows[rows.length - 1]
  },

  delete: (id: string) => db.weightEntries.delete(id),
}

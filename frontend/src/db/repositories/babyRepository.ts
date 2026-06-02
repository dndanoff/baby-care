import { db } from "@/db/database"
import { nanoid } from "@/utils/nanoid"
import type { Baby } from "@/types"

export const babyRepository = {
  getAll: () => db.babies.orderBy("createdAt").toArray(),

  add: async (data: Omit<Baby, "id" | "createdAt">): Promise<Baby> => {
    const baby: Baby = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    }
    await db.babies.add(baby)
    return baby
  },

  update: (id: string, data: Partial<Omit<Baby, "id" | "createdAt">>) =>
    db.babies.update(id, data),

  delete: (id: string) =>
    db.transaction(
      "rw",
      db.babies,
      db.milestones,
      db.feedingSessions,
      db.weightEntries,
      async () => {
        await db.milestones.where("babyId").equals(id).delete()
        await db.feedingSessions.where("babyId").equals(id).delete()
        await db.weightEntries.where("babyId").equals(id).delete()
        await db.babies.delete(id)
      }
    ),

  replaceAll: (data: Baby[]) =>
    db.transaction("rw", db.babies, async () => {
      await db.babies.clear()
      await db.babies.bulkAdd(data)
    }),
}

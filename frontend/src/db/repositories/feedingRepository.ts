import { db } from "@/db/database"
import { nanoid } from "@/utils/nanoid"
import type { FeedingSession } from "@/types"

export const feedingRepository = {
  getAll: () => db.feedingSessions.toArray(),

  getByBabyId: async (babyId: string): Promise<FeedingSession[]> => {
    const rows = await db.feedingSessions
      .where("babyId")
      .equals(babyId)
      .sortBy("startTime")
    return rows.reverse()
  },

  add: async (data: Omit<FeedingSession, "id">): Promise<FeedingSession> => {
    const session: FeedingSession = { ...data, id: nanoid() }
    await db.feedingSessions.add(session)
    return session
  },

  getLatestByBabyId: async (
    babyId: string
  ): Promise<FeedingSession | undefined> => {
    const rows = await db.feedingSessions
      .where("babyId")
      .equals(babyId)
      .sortBy("startTime")
    return rows[rows.length - 1]
  },

  delete: (id: string) => db.feedingSessions.delete(id),
}

import { db } from "@/db/database"
import { nanoid } from "@/utils/nanoid"
import type { Reminder } from "@/types"

export const reminderRepository = {
  getAll: () => db.reminders.toArray(),

  getByBabyId: async (babyId: string): Promise<Reminder[]> => {
    const rows = await db.reminders
      .where("babyId")
      .equals(babyId)
      .sortBy("createdAt")
    return rows.reverse()
  },

  add: async (data: Omit<Reminder, "id">): Promise<Reminder> => {
    const reminder: Reminder = { ...data, id: nanoid() }
    await db.reminders.add(reminder)
    return reminder
  },

  update: async (id: string, patch: Partial<Reminder>): Promise<void> => {
    await db.reminders.update(id, patch)
  },

  delete: (id: string) => db.reminders.delete(id),
}

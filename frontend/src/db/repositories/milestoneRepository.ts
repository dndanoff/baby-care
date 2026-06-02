import { db } from "@/db/database"
import { nanoid } from "@/utils/nanoid"
import type { Milestone, AgeRange } from "@/types"
import { PREDEFINED_MILESTONES } from "@/data/milestones"

export const milestoneRepository = {
  getAll: () => db.milestones.toArray(),

  getByBabyId: (babyId: string) =>
    db.milestones.where("babyId").equals(babyId).toArray(),

  add: async (
    data: Omit<Milestone, "id" | "createdAt"> & { ageRange: AgeRange }
  ): Promise<Milestone> => {
    const milestone: Milestone = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    }
    await db.milestones.add(milestone)
    return milestone
  },

  seedForBaby: async (babyId: string): Promise<void> => {
    const now = new Date().toISOString()
    const milestones: Milestone[] = PREDEFINED_MILESTONES.map((m) => ({
      id: nanoid(),
      babyId,
      title: m.title,
      description: m.description,
      ageRange: m.ageRange,
      completed: false,
      completedAt: undefined,
      createdAt: now,
      isSystem: true,
    }))
    await db.milestones.bulkAdd(milestones)
  },

  markComplete: (id: string) =>
    db.milestones.update(id, {
      completed: true,
      completedAt: new Date().toISOString(),
    }),

  updateCompletedAt: (id: string, date: string) =>
    db.milestones.update(id, { completedAt: new Date(date).toISOString() }),

  reset: (id: string) =>
    db.milestones.update(id, { completed: false, completedAt: undefined }),

  delete: (id: string) => db.milestones.delete(id),

  replaceAll: (data: Milestone[]) =>
    db.transaction("rw", db.milestones, async () => {
      await db.milestones.clear()
      await db.milestones.bulkAdd(data)
    }),
}

import { db } from "@/db/database"
import type {
  Baby,
  Milestone,
  FeedingSession,
  WeightEntry,
  DiaperEntry,
} from "@/types"

export const dataRepository = {
  clearAll: () =>
    db.transaction(
      "rw",
      [
        db.babies,
        db.milestones,
        db.feedingSessions,
        db.weightEntries,
        db.diaperEntries,
      ],
      async () => {
        await db.babies.clear()
        await db.milestones.clear()
        await db.feedingSessions.clear()
        await db.weightEntries.clear()
        await db.diaperEntries.clear()
      }
    ),

  importData: (payload: {
    babies?: Baby[]
    milestones?: Milestone[]
    feedingSessions?: FeedingSession[]
    weightEntries?: WeightEntry[]
    diaperEntries?: DiaperEntry[]
  }) =>
    db.transaction(
      "rw",
      [
        db.babies,
        db.milestones,
        db.feedingSessions,
        db.weightEntries,
        db.diaperEntries,
      ],
      async () => {
        if (payload.babies) {
          await db.babies.clear()
          await db.babies.bulkAdd(payload.babies)
        }
        if (payload.milestones) {
          await db.milestones.clear()
          await db.milestones.bulkAdd(payload.milestones)
        }
        if (payload.feedingSessions) {
          await db.feedingSessions.clear()
          await db.feedingSessions.bulkAdd(payload.feedingSessions)
        }
        if (payload.weightEntries) {
          await db.weightEntries.clear()
          await db.weightEntries.bulkAdd(payload.weightEntries)
        }
        if (payload.diaperEntries) {
          await db.diaperEntries.clear()
          await db.diaperEntries.bulkAdd(payload.diaperEntries)
        }
      }
    ),
}

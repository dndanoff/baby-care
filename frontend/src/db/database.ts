import Dexie, { type Table } from "dexie"
import type {
  Baby,
  Milestone,
  FeedingSession,
  WeightEntry,
  DiaperEntry,
} from "@/types"

class BabyCareDB extends Dexie {
  babies!: Table<Baby, string>
  milestones!: Table<Milestone, string>
  feedingSessions!: Table<FeedingSession, string>
  weightEntries!: Table<WeightEntry, string>
  diaperEntries!: Table<DiaperEntry, string>

  constructor() {
    super("BabyCareDB")
    this.version(1).stores({
      babies: "id, name, createdAt",
      milestones: "id, babyId, ageRange, completed, createdAt",
      feedingSessions: "id, babyId, startTime",
      weightEntries: "id, babyId, dateTime",
      diaperEntries: "id, babyId, dateTime",
    })
  }
}

export const db = new BabyCareDB()

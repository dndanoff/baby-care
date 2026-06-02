import Dexie, { type Table } from "dexie"
import type {
  Baby,
  Milestone,
  FeedingSession,
  WeightEntry,
  DiaperEntry,
  Reminder,
} from "@/types"

class BabyCareDB extends Dexie {
  babies!: Table<Baby, string>
  milestones!: Table<Milestone, string>
  feedingSessions!: Table<FeedingSession, string>
  weightEntries!: Table<WeightEntry, string>
  diaperEntries!: Table<DiaperEntry, string>
  reminders!: Table<Reminder, string>

  constructor() {
    super("BabyCareDB")
    this.version(1).stores({
      babies: "id, name, createdAt",
      milestones: "id, babyId, ageRange, completed, createdAt",
      feedingSessions: "id, babyId, startTime",
      weightEntries: "id, babyId, dateTime",
      diaperEntries: "id, babyId, dateTime",
    })
    this.version(2).stores({
      babies: "id, name, createdAt",
      milestones: "id, babyId, ageRange, completed, createdAt",
      feedingSessions: "id, babyId, startTime",
      weightEntries: "id, babyId, dateTime",
      diaperEntries: "id, babyId, dateTime",
      reminders: "id, babyId, enabled, createdAt",
    })
  }
}

export const db = new BabyCareDB()

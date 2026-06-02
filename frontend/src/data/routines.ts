import type { AgeRange } from "@/types"

export interface RoutineEntry {
  time: string
  activity: string
  notes?: string
}

export type RoutineData = Record<AgeRange, RoutineEntry[]>

export const ROUTINES: RoutineData = {
  "0-3m": [
    {
      time: "6:00 – 7:00 AM",
      activity: "Wake + feed",
      notes: "Newborns feed every 2–3 hours. Watch for hunger cues.",
    },
    {
      time: "7:00 – 8:30 AM",
      activity: "Awake window + tummy time",
      notes: "5–10 min tummy time on a firm surface.",
    },
    {
      time: "8:30 – 10:00 AM",
      activity: "Nap 1",
      notes: "Put down drowsy but awake if possible.",
    },
    { time: "10:00 AM", activity: "Feed", notes: "Feed on waking." },
    {
      time: "10:00 – 11:30 AM",
      activity: "Awake window",
      notes: "Gentle play, singing, looking at faces.",
    },
    { time: "11:30 AM – 1:00 PM", activity: "Nap 2", notes: "" },
    { time: "1:00 PM", activity: "Feed", notes: "" },
    {
      time: "1:00 – 2:30 PM",
      activity: "Awake window",
      notes: "Sensory play, black-and-white visual cards.",
    },
    { time: "2:30 – 4:00 PM", activity: "Nap 3", notes: "" },
    { time: "4:00 PM", activity: "Feed", notes: "" },
    {
      time: "4:00 – 5:30 PM",
      activity: "Awake window",
      notes: "Cuddle and calm play.",
    },
    {
      time: "5:30 – 6:30 PM",
      activity: "Nap 4 (catnap)",
      notes: "Keep short to protect night sleep.",
    },
    { time: "6:30 PM", activity: "Feed", notes: "" },
    {
      time: "7:00 – 7:30 PM",
      activity: "Bedtime routine",
      notes: "Bath, massage, feed, swaddle, white noise.",
    },
    {
      time: "7:30 PM",
      activity: "Bed",
      notes: "Aim for 12–16 hours of sleep total in 24 hours.",
    },
    {
      time: "Night",
      activity: "Night feeds on demand",
      notes: "Expect 1–3 feeds per night at this age.",
    },
  ],
  "3-6m": [
    { time: "6:30 – 7:00 AM", activity: "Wake + feed", notes: "" },
    {
      time: "7:00 – 8:30 AM",
      activity: "Awake window",
      notes: "Tummy time, floor play, talking to baby.",
    },
    {
      time: "8:30 – 10:00 AM",
      activity: "Nap 1",
      notes: "~1.5 hrs. Watch wake windows of ~1.5–2 hrs.",
    },
    { time: "10:00 AM", activity: "Feed", notes: "" },
    {
      time: "10:00 AM – 12:00 PM",
      activity: "Awake window",
      notes: "Rattles, mirrors, high-contrast toys.",
    },
    { time: "12:00 – 1:30 PM", activity: "Nap 2", notes: "" },
    { time: "1:30 PM", activity: "Feed", notes: "" },
    {
      time: "1:30 – 3:30 PM",
      activity: "Awake window",
      notes: "Outings, fresh air, structured play.",
    },
    {
      time: "3:30 – 4:30 PM",
      activity: "Nap 3 (catnap)",
      notes: "Keep to 30–45 min to protect night.",
    },
    { time: "4:30 PM", activity: "Feed", notes: "" },
    {
      time: "4:30 – 6:30 PM",
      activity: "Awake window",
      notes: "Calm play; avoid overstimulation.",
    },
    {
      time: "6:30 PM",
      activity: "Bedtime routine",
      notes: "Bath, feed, story/song.",
    },
    { time: "7:00 PM", activity: "Bed", notes: "" },
    {
      time: "Night",
      activity: "1–2 night feeds",
      notes: "Many babies start consolidating night sleep.",
    },
  ],
  "6-12m": [
    {
      time: "6:30 – 7:00 AM",
      activity: "Wake + feed (milk)",
      notes: "Breast or formula first at this stage.",
    },
    {
      time: "7:30 AM",
      activity: "Breakfast solids",
      notes: "Soft purees or soft finger foods.",
    },
    {
      time: "8:00 – 9:30 AM",
      activity: "Awake window",
      notes: "Active floor play, crawling practice.",
    },
    { time: "9:30 – 11:00 AM", activity: "Nap 1", notes: "~1–1.5 hrs." },
    { time: "11:00 AM", activity: "Feed (milk)", notes: "" },
    {
      time: "11:30 AM",
      activity: "Lunch solids",
      notes: "Introduce new textures and flavours.",
    },
    {
      time: "12:00 – 2:30 PM",
      activity: "Awake window",
      notes: "Interactive play, books, sensory bins.",
    },
    { time: "2:30 – 4:00 PM", activity: "Nap 2", notes: "" },
    { time: "4:00 PM", activity: "Feed (milk) + snack", notes: "" },
    {
      time: "4:00 – 6:00 PM",
      activity: "Awake window",
      notes: "Outdoor time if possible.",
    },
    { time: "5:30 PM", activity: "Dinner solids", notes: "" },
    {
      time: "6:30 PM",
      activity: "Bedtime routine",
      notes: "Bath, milk feed, book.",
    },
    { time: "7:00 PM", activity: "Bed", notes: "" },
  ],
  "12-24m": [
    {
      time: "6:30 – 7:00 AM",
      activity: "Wake + milk/breakfast",
      notes: "Transition to cow's milk around 12 months (consult doctor).",
    },
    {
      time: "7:00 – 9:30 AM",
      activity: "Active morning play",
      notes: "Walking, pushing toys, exploring.",
    },
    {
      time: "9:30 AM",
      activity: "Morning snack",
      notes: "Fruit, crackers, cheese cubes.",
    },
    {
      time: "10:00 AM – 12:00 PM",
      activity: "Outings / structured play",
      notes: "Park, library, play group.",
    },
    {
      time: "12:00 PM",
      activity: "Lunch",
      notes: "Family meals; encourage self-feeding.",
    },
    {
      time: "12:30 – 2:30 PM",
      activity: "Afternoon nap",
      notes: "One consolidated nap of ~1.5–2 hrs.",
    },
    { time: "2:30 PM", activity: "Milk + afternoon snack", notes: "" },
    {
      time: "2:30 – 5:30 PM",
      activity: "Afternoon activities",
      notes: "Creative play, building blocks, books.",
    },
    {
      time: "5:30 PM",
      activity: "Dinner",
      notes: "Offer a variety of textures and flavours.",
    },
    {
      time: "6:30 PM",
      activity: "Bedtime routine",
      notes: "Bath, pyjamas, milk, 1–2 books.",
    },
    {
      time: "7:00 – 7:30 PM",
      activity: "Bed",
      notes: "Consistent bedtime supports sleep quality.",
    },
  ],
}

import type { AgeRange } from "@/types"

export interface PredefinedMilestone {
  title: string
  description: string
  ageRange: AgeRange
}

export const PREDEFINED_MILESTONES: PredefinedMilestone[] = [
  // 0–3 months
  {
    ageRange: "0-3m",
    title: "Umbilical cord falls off",
    description:
      "The umbilical cord stump dries and detaches, usually 1–3 weeks after birth.",
  },
  {
    ageRange: "0-3m",
    title: "First smile",
    description:
      "Baby produces a genuine social smile in response to your face or voice.",
  },
  {
    ageRange: "0-3m",
    title: "Lifts head during tummy time",
    description: "Raises head 45° when placed on stomach.",
  },
  {
    ageRange: "0-3m",
    title: "Tracks moving objects with eyes",
    description: "Follows a slow-moving object side to side.",
  },
  {
    ageRange: "0-3m",
    title: "Responds to sounds",
    description: "Startles at loud noises; quiets to familiar voice.",
  },
  {
    ageRange: "0-3m",
    title: "Coos and makes gurgling sounds",
    description: "Produces vowel-like sounds to communicate.",
  },
  {
    ageRange: "0-3m",
    title: "Recognises parents' faces",
    description: "Shows preference for primary caregivers' faces.",
  },
  {
    ageRange: "0-3m",
    title: "Holds head steady when upright",
    description: "Can hold head steady briefly when held in sitting position.",
  },

  // 3–6 months
  {
    ageRange: "3-6m",
    title: "Rolls from tummy to back",
    description: "Independently rolls over from prone to supine position.",
  },
  {
    ageRange: "3-6m",
    title: "Reaches for and grasps objects",
    description: "Intentionally reaches out to grab a toy or rattle.",
  },
  {
    ageRange: "3-6m",
    title: "Laughs out loud",
    description: "Produces spontaneous laughter.",
  },
  {
    ageRange: "3-6m",
    title: "Recognises own name",
    description: "Turns head or pauses activity when name is called.",
  },
  {
    ageRange: "3-6m",
    title: "Sits with support",
    description: "Maintains sitting position when propped up.",
  },
  {
    ageRange: "3-6m",
    title: "Bears weight on legs when standing",
    description: "Pushes down on legs when feet are placed on a firm surface.",
  },
  {
    ageRange: "3-6m",
    title: "Babbles consonant sounds",
    description: "Produces sounds like 'ba', 'da', 'ga'.",
  },

  // 6–12 months
  {
    ageRange: "6-12m",
    title: "Sits without support",
    description: "Sits independently for several seconds without toppling.",
  },
  {
    ageRange: "6-12m",
    title: "Crawls",
    description: "Moves forward on hands and knees or belly.",
  },
  {
    ageRange: "6-12m",
    title: "Pulls to standing",
    description: "Uses furniture or hands to pull self to standing position.",
  },
  {
    ageRange: "6-12m",
    title: "Pincer grasp",
    description: "Picks up small objects using thumb and index finger.",
  },
  {
    ageRange: "6-12m",
    title: "Says 'mama' or 'dada'",
    description: "Uses mama/dada intentionally to refer to a parent.",
  },
  {
    ageRange: "6-12m",
    title: "Waves bye-bye",
    description: "Waves hand to greet or say goodbye.",
  },
  {
    ageRange: "6-12m",
    title: "Object permanence",
    description: "Searches for a toy that has been hidden from view.",
  },
  {
    ageRange: "6-12m",
    title: "Claps hands",
    description: "Brings both hands together to clap.",
  },
  {
    ageRange: "6-12m",
    title: "First solid foods",
    description: "Successfully accepts and swallows pureed solid foods.",
  },

  // 12–24 months
  {
    ageRange: "12-24m",
    title: "First steps",
    description: "Takes first independent steps without holding on.",
  },
  {
    ageRange: "12-24m",
    title: "Walks independently",
    description: "Walks steadily across a room without assistance.",
  },
  {
    ageRange: "12-24m",
    title: "Says first word",
    description: "Uses a meaningful word intentionally beyond mama/dada.",
  },
  {
    ageRange: "12-24m",
    title: "Follows simple instructions",
    description:
      "Responds to simple one-step commands like 'come here' or 'give me'.",
  },
  {
    ageRange: "12-24m",
    title: "Points to objects of interest",
    description: "Uses index finger to point at things to share attention.",
  },
  {
    ageRange: "12-24m",
    title: "10+ word vocabulary",
    description: "Uses at least 10 recognisable words.",
  },
  {
    ageRange: "12-24m",
    title: "Stacks 2–3 blocks",
    description: "Places blocks on top of each other without knocking over.",
  },
  {
    ageRange: "12-24m",
    title: "Uses spoon or fork",
    description: "Feeds self with a spoon or fork with some spilling.",
  },
  {
    ageRange: "12-24m",
    title: "Two-word combinations",
    description:
      "Starts joining two words together, e.g. 'more milk', 'daddy go'.",
  },
  {
    ageRange: "12-24m",
    title: "Runs",
    description: "Moves quickly in a run-like gait.",
  },
]

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  "0-3m": "0–3 Months",
  "3-6m": "3–6 Months",
  "6-12m": "6–12 Months",
  "12-24m": "12–24 Months",
}

export const AGE_RANGE_ORDER: AgeRange[] = ["0-3m", "3-6m", "6-12m", "12-24m"]

export const CONSTANTS = {
  // ─── Storage keys ────────────────────────────────────────────────────────
  storage: {
    ACTIVE_BABY_KEY: "babycare_active_baby",
    THEME_KEY: "theme",
  },

  // ─── Media queries ───────────────────────────────────────────────────────
  media: {
    COLOR_SCHEME_QUERY: "(prefers-color-scheme: dark)",
  },

  // ─── Pagination ──────────────────────────────────────────────────────────
  pagination: {
    PAGE_SIZE: 10,
  },

  // ─── Feeding reminders ───────────────────────────────────────────────────
  feeding: {
    /**
     * Ordered thresholds used by recommendedReminderMinutes().
     * For each entry, if the child's age (months) is below maxAgeMonths,
     * the corresponding reminder interval applies.
     */
    REMINDER_THRESHOLDS: [
      { maxAgeMonths: 3, minutes: 120 }, // 0–3m: every ~2 h
      { maxAgeMonths: 6, minutes: 180 }, // 3–6m: every ~3 h
    ] as const,
    /** Fallback interval for babies 6 m+ */
    REMINDER_DEFAULT_MINUTES: 240, // 6m+: every ~4 h
    REMINDER_OPTIONS: [
      { label: "Off", minutes: 0 },
      { label: "2h", minutes: 120 },
      { label: "3h", minutes: 180 },
      { label: "4h", minutes: 240 },
    ] as const,
  },
} as const

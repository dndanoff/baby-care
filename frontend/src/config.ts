import { z } from "zod"

/**
 * Validated, typed environment configuration.
 *
 * All `VITE_*` variables must be declared in `.env` (see `.env.example`).
 * A missing required variable throws at startup rather than silently
 * falling back to `undefined` at the call site.
 */
const envSchema = z.object({
  /** Display name shown in the shell header, install banner, and notifications. */
  VITE_APP_NAME: z.string().min(1).default("BabyCare"),
  /** Path to the icon used in browser push notifications. */
  VITE_NOTIFICATION_ICON: z.string().min(1).default("/favicon.svg"),
})

const result = envSchema.safeParse(import.meta.env)

if (!result.success) {
  const messages = result.error.issues
    .map((i) => `  ${i.path.join(".")}: ${i.message}`)
    .join("\n")
  throw new Error(`Invalid environment variables:\n${messages}`)
}

export const config = result.data

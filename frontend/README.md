# BabyCare

**[Try it live →](https://your-domain.com)**<!-- TODO: replace with actual deployed URL -->

A local-first Progressive Web App for tracking baby milestones, feeding sessions, and weight. All data is stored in the browser via IndexedDB — no backend, no account required, nothing leaves the device.

## Features

### Feeding tracker
- Start/stop a live timer for each feeding session
- Select feeding type: left breast, right breast, both breasts, formula, or formula + breast
- Browser push notifications to remind you when the next feed is due (interval auto-suggested by age)
- Paginated history of past sessions with delete support
- Navigation guard prevents accidentally leaving a live session

### Weight tracker
- Log weight entries with date/time
- Line chart showing weight trend over time
- History list with delete support

### Milestones
- Predefined developmental milestones grouped by age range (0–3m, 3–6m, 6–12m, 12–24m)
- Check off milestones as completed (records completion date)
- Add custom milestones
- Edit or delete user-created milestones

### Daily routine
- Age-appropriate sample schedule shown based on the active child's current age range
- Read-only reference; updates automatically as the baby grows

### Tools — White Noise
- Plays looping white noise via Web Audio API
- Volume slider
- Stops automatically on navigation

### Children management
- Add multiple children (name, date of birth, sex, birth weight and height)
- Switch active child from the header
- Edit or delete children

### Settings
- Export all data to JSON
- Import data from a previously exported JSON file
- Clear all data

### App
- Dark / light / system theme toggle
- Installable as a PWA on Android and iOS
- Full offline support via Workbox service worker
- Auto-detects and prompts for app updates (UpdateBanner)
- Install prompt banner (InstallBanner)

---

## Stack

| Layer | Library |
|---|---|
| UI framework | React 19 + TypeScript |
| Bundler | Vite |
| Routing | React Router v7 |
| Local DB | Dexie.js (IndexedDB) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Validation | Zod |
| PWA / offline | vite-plugin-pwa + Workbox |

---

## Getting Started

```bash
npm install
npm run dev       # Start dev server
npm run build     # Type check + bundle for production
npm run preview   # Serve the production build locally
npm run check     # Validate format, lint, and types (read-only)
npm run fix       # Auto-fix format and lint issues
```

---

## Folder map

```
src/
├── main.tsx                   # App entry — router + context providers
├── App.tsx                    # Root route, renders Shell + <Outlet>
├── config.ts                  # Feature flags and runtime config
├── constants.ts               # Shared magic values (pagination, feeding thresholds, etc.)
│
├── types/
│   └── index.ts               # All shared TypeScript types (Child, FeedingSession, WeightEntry, Milestone, …)
│
├── db/
│   ├── database.ts            # Dexie instance + schema definition
│   └── repositories/
│       ├── index.ts           # Re-exports all repositories
│       ├── childRepository.ts
│       ├── feedingRepository.ts
│       ├── weightRepository.ts
│       ├── milestoneRepository.ts
│       └── dataRepository.ts  # Bulk import / export / clear (used by Settings)
│
├── contexts/
│   ├── AppContext.tsx          # Active child + children list; persists to localStorage
│   └── ThemeContext.tsx        # Dark/light/system theme; persists to localStorage
│
├── hooks/
│   ├── useFeedingTimer.ts     # Live feeding session timer (start/stop/reset/elapsed)
│   └── useNavigationGuard.ts  # Blocks React Router navigation when condition is true
│
├── pages/
│   ├── Feeding.tsx            # Feeding tracker page
│   ├── Weight.tsx             # Weight logging + chart page
│   ├── Milestones.tsx         # Milestone checklist page
│   ├── Routine.tsx            # Age-appropriate routine reference page
│   ├── Tools.tsx              # White noise tool page
│   ├── Children.tsx           # Manage children page
│   └── Settings.tsx           # Import / export / clear data page
│
├── components/
│   ├── layout/
│   │   ├── Shell.tsx          # Shared layout: header, drawer nav, mobile bottom nav
│   │   ├── UpdateBanner.tsx   # PWA update-available prompt
│   │   └── InstallBanner.tsx  # PWA install-to-home-screen prompt
│   ├── common/
│   │   ├── Modal.tsx          # Generic modal wrapper
│   │   └── Field.tsx          # Labelled form field wrapper
│   ├── ui/                    # shadcn/ui primitives (Button, etc.)
│   ├── ThemeToggle.tsx        # Dark/light/system switcher
│   └── DataPrivacyNote.tsx    # "Data stays on device" notice
│
├── data/
│   ├── milestones.ts          # Predefined milestone list (PredefinedMilestone[])
│   └── routines.ts            # Age-range routine schedules (RoutineData)
│
├── utils/
│   ├── age.ts                 # Age calculation helpers (getAgeInMonths, getAgeRange, …)
│   ├── format.ts              # Duration / gap / date formatting
│   ├── csv.ts                 # CSV serialisation helpers
│   ├── validate.ts            # Zod schemas for form input
│   └── nanoid.ts              # Tiny ID generator wrapper
│
└── lib/
    └── utils.ts               # cn() — Tailwind class merging (clsx + tailwind-merge)
```

### Key conventions

- Pages read the active child via `useApp()`, then bind to the DB with `useLiveQuery()` from `dexie-react-hooks`. Pages never import Dexie directly.
- All writes go through a repository. Repositories are the only layer that touches `database.ts`.
- Use the `@/` path alias (maps to `src/`) for all internal imports.
- Add new shadcn/ui components with `npx shadcn@latest add <component>` — they land in `src/components/ui/`.

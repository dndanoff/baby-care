# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

- **Arrow functions** for all functions — named function declarations are not used.
- **ESM modules** (`import`/`export`) everywhere — no `require()` or CommonJS.
- **Readability over cleverness** — clear, straightforward code is preferred over compact or "smart" one-liners. If a reader would pause to decipher it, rewrite it.
- **Clean design and separation of concerns** — keep data access, business logic, and UI rendering in distinct layers. Pages/components should not contain data-fetching or transformation logic that belongs in a repository, utility, or hook.

## Commands

All commands run from the `frontend/` directory:

```bash
cd frontend
npm run dev       # Start Vite dev server
npm run build     # Full build: auto-fix → tsc type check → vite bundle
npm run check     # Validate format, lint, and types (read-only)
npm run fix       # Auto-fix format and lint issues
npm run preview   # Serve the production build locally
```

There are no tests in the frontend. The server package may add tests separately.

## Architecture

This is a **local-first PWA** for tracking baby milestones, feeding, and weight. All data lives in the browser via IndexedDB (Dexie.js) — there is no backend or API.

**Stack**: React 19 + TypeScript + Vite + React Router v7 + Tailwind CSS v4 + shadcn/ui + Dexie.js

### Data layer

`src/db/database.ts` defines the Dexie schema. Each entity has a dedicated repository in `src/db/repositories/` that handles all CRUD operations against IndexedDB. Pages never touch Dexie directly; they go through repositories.

`dataRepository.ts` handles bulk import/export and clear — used by the Settings page.

### State management

Two React contexts (no external state library):
- `AppContext` (`src/contexts/AppContext.tsx`) — active child selection, children list, persists active child ID to `localStorage`
- `ThemeContext` (`src/contexts/ThemeContext.tsx`) — dark/light/system theme, also persisted to `localStorage`

Pages read the active child via `useApp()`, then use Dexie's `useLiveQuery()` to reactively query the relevant repository.

### Routing and layout

`src/main.tsx` sets up React Router v7 with both contexts as providers. `src/App.tsx` renders the `Shell` layout component (header + drawer nav + bottom mobile nav) with a router `<Outlet>`. Pages live in `src/pages/`.

### Path alias

`@/*` maps to `src/*` — use this for all internal imports.

### UI components

shadcn/ui components live in `src/components/ui/`. Add new ones with the shadcn CLI (`components.json` has the config). Use `cn()` from `src/lib/utils.ts` for conditional class merging.

### PWA

Configured via `vite-plugin-pwa` in `vite.config.ts`. The service worker caches assets for offline use. The app is installable as a PWA on mobile.

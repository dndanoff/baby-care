# baby-care

A local-first Progressive Web App for tracking baby milestones, feeding sessions, and weight. All data is stored in the browser via IndexedDB — no account required, nothing leaves the device.

**[Try it live →](https://your-domain.com)**<!-- TODO: replace with actual deployed URL -->

### Features

- **Feeding tracker** — live timer, feeding type, push notifications for next feed
- **Weight tracker** — log entries, line chart trend
- **Milestones** — predefined + custom milestones grouped by age range
- **Daily routine** — age-appropriate sample schedule (read-only reference)
- **White noise** — looping Web Audio player with volume control
- **Multiple children** — switch active child from the header
- **PWA** — installable, full offline support, dark/light/system theme

### Stack

| Layer | Library |
|---|---|
| UI framework | React 19 + TypeScript |
| Bundler | Vite |
| Routing | React Router v7 |
| Local DB | Dexie.js (IndexedDB) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Validation | Zod |
| PWA / offline | vite-plugin-pwa + Workbox |

### Getting started

```bash
cd frontend
npm install
npm run dev       # Start dev server
npm run build     # Type check + bundle for production
npm run preview   # Serve the production build locally
npm run check     # Validate format, lint, and types (read-only)
npm run fix       # Auto-fix format and lint issues
```

See [frontend/README.md](frontend/README.md) for the full folder map and architecture notes.

## Server

Planned lightweight backend. Details TBD.

## Repo structure

```
baby-care/
├── frontend/   # React PWA (Vite + React 19 + Dexie.js)
└── server/     # Backend (coming soon)
```

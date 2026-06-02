# Device Sync via Cloudflare KV

## Context

BabyCare is a local-first PWA — all data lives in IndexedDB (Dexie.js) with no backend. Parents often want to share tracking data between devices (e.g., both parents' phones). This feature adds opt-in cloud sync backed by Cloudflare Workers + KV, preserving the offline-first nature while enabling multi-device access.

The design is intentionally simple: one sync ID = one dataset. The ID is the auth token. No accounts, no passwords.

---

## Architecture Overview

```
Device 1 (enable sync)                    Cloudflare Worker
  └─ POST /api/sync/generate  ──────────→  creates KV entry, returns { id }
  └─ shows QR code of ID

Device 2 (join sync)
  └─ enters or scans ID
  └─ GET /api/sync/:id  ────────────────→  returns full data snapshot
  └─ importData() into local IndexedDB

Any device (after sync enabled)
  └─ every DB write triggers background sync
  └─ PUT /api/sync/:id  ────────────────→  stores full data snapshot in KV

App load (sync enabled)
  └─ GET /api/sync/:id  ────────────────→  fetch + importData() before render
```

---

## 1. Cloudflare Worker (new package)

### New directory: `worker/`

```
baby-care/
├── frontend/        # existing
├── server/          # existing
└── worker/          # new
    ├── package.json
    ├── wrangler.toml
    └── src/
        └── index.ts
```

### `wrangler.toml`
```toml
name = "babycare-sync"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "SYNC_KV"
id = "<to be filled after: wrangler kv:namespace create SYNC_KV>"
```

### `worker/src/index.ts` — 3 endpoints

```
POST /api/sync/generate
  - generates nanoid() sync ID
  - stores empty payload in KV: SYNC_KV.put(`sync:${id}`, "{}")
  - returns { id }

GET /api/sync/:id
  - reads SYNC_KV.get(`sync:${id}`)
  - returns 404 if not found, else JSON payload

PUT /api/sync/:id
  - reads body (SyncPayload JSON)
  - writes SYNC_KV.put(`sync:${id}`, body)
  - returns { success: true }
```

CORS headers must be included on all responses (frontend is a different origin).

**SyncPayload type** (shared between worker and frontend):
```typescript
type SyncPayload = {
  babies: Baby[]
  milestones: Milestone[]
  feedingSessions: FeedingSession[]
  weightEntries: WeightEntry[]
  diaperEntries: DiaperEntry[]
  reminders: Reminder[]
}
```

---

## 2. Frontend Changes

### 2a. New file: `frontend/src/lib/sync.ts`

Central sync service. Responsible for:
- `generateSyncId()` — calls `POST /api/sync/generate`, saves ID + enabled flag to localStorage, returns the ID
- `pushSync()` — reads all data via `dataRepository.exportAll()`, calls `PUT /api/sync/:id` — fire-and-forget, never throws
- `fetchAndApplySync(id)` — calls `GET /api/sync/:id`, calls `dataRepository.importData()` with the result
- `scheduleSync()` — debounced wrapper around `pushSync()` (300ms debounce to batch rapid writes); no-op when sync is disabled

**localStorage keys** (add to `CONSTANTS.storage`):
- `babycare_sync_enabled` — `"true"` | `"false"`
- `babycare_sync_id` — the sync ID string

### 2b. `frontend/src/db/repositories/dataRepository.ts`

Add `exportAll()` function alongside existing `clearAll()` and `importData()`:
```typescript
const exportAll = async (): Promise<SyncPayload> => {
  const [babies, milestones, feedingSessions, weightEntries, diaperEntries, reminders] =
    await Promise.all([
      babyRepository.getAll(),
      milestoneRepository.getAll(),
      feedingRepository.getAll(),
      weightRepository.getAll(),
      diaperRepository.getAll(),
      reminderRepository.getAll(),
    ])
  return { babies, milestones, feedingSessions, weightEntries, diaperEntries, reminders }
}
```

### 2c. Background sync hook in `frontend/src/db/database.ts`

After the Dexie DB is instantiated, register table hooks on all 6 tables. This keeps sync concerns out of individual repositories:

```typescript
const syncableTables = ["babies", "milestones", "feedingSessions", "weightEntries", "diaperEntries", "reminders"]
syncableTables.forEach(tableName => {
  db.table(tableName).hook("creating").subscribe(() => scheduleSync())
  db.table(tableName).hook("updating").subscribe(() => scheduleSync())
  db.table(tableName).hook("deleting").subscribe(() => scheduleSync())
})
```

### 2d. App load sync in `frontend/src/App.tsx`

On mount (one-time `useEffect`), check localStorage for sync enabled + ID and fetch remote data if set:

```typescript
useEffect(() => {
  const enabled = localStorage.getItem(CONSTANTS.storage.SYNC_ENABLED) === "true"
  const id = localStorage.getItem(CONSTANTS.storage.SYNC_ID)
  if (enabled && id) {
    fetchAndApplySync(id).then(() => refreshBabies())
  }
}, [])
```

### 2e. Settings page: `frontend/src/pages/Settings.tsx`

Add a new **"Device Sync"** section (above the Danger Zone) with three UI states:

**State: disabled (default)**
- Info card explaining what sync does and the privacy trade-off
- "Enable Device Sync" button → opens confirmation dialog
- "Join Existing Sync" button → opens join flow

**Confirmation dialog (on enable)**
- Explains data will be stored in the cloud
- Cancel / Confirm & Enable buttons
- On confirm: calls `generateSyncId()`, immediately calls `pushSync()`, transitions to enabled state

**State: enabled — this device is the source**
- Displays sync ID in monospace
- Displays QR code of the sync ID (using `react-qr-code`)
- Instructions: "On another device, open Settings and scan or type this code"
- "Disable Sync" button → confirmation → clears `babycare_sync_enabled` and `babycare_sync_id` from localStorage

**Join flow (device 2)**
- Text input for sync ID + "Join" button
- "Scan QR Code" button that activates camera (using `html5-qrcode`)
- On submit: `fetchAndApplySync(id)` → saves ID + enabled to localStorage → `refreshBabies()`

---

## 3. New Packages

### Worker
```bash
cd worker && npm install nanoid
```

### Frontend
```bash
cd frontend && npm install react-qr-code html5-qrcode
```

---

## 4. Files to Create / Modify

| File | Action | What changes |
|------|--------|-------------|
| `worker/` | **Create** | New Cloudflare Worker package |
| `worker/wrangler.toml` | **Create** | Worker config + KV namespace binding |
| `worker/package.json` | **Create** | Worker deps (nanoid, wrangler dev dep) |
| `worker/src/index.ts` | **Create** | 3 endpoints: generate, fetch, store |
| `frontend/src/lib/sync.ts` | **Create** | Sync service (generateSyncId, pushSync, fetchAndApplySync, scheduleSync) |
| `frontend/src/lib/constants.ts` | **Modify** | Add `SYNC_ENABLED` and `SYNC_ID` to `CONSTANTS.storage` |
| `frontend/src/db/repositories/dataRepository.ts` | **Modify** | Add `exportAll()` |
| `frontend/src/db/database.ts` | **Modify** | Register Dexie table hooks → `scheduleSync()` |
| `frontend/src/pages/Settings.tsx` | **Modify** | Add Device Sync section (all 3 UI states) |
| `frontend/src/App.tsx` | **Modify** | Add on-mount sync fetch |
| `frontend/src/types/index.ts` | **Modify** | Add `SyncPayload` type |

---

## 5. Data Flow Details

### Enable sync (Device 1)
1. User clicks "Enable Device Sync" → confirmation dialog
2. Confirm → `generateSyncId()` → POST worker → get `id`
3. Save `id` + `enabled=true` to localStorage
4. `pushSync()` fires immediately (uploads current local data to KV)
5. Settings shows QR code + text ID

### Join sync (Device 2)
1. User opens Settings → "Join Existing Sync"
2. Types or scans ID from Device 1
3. `fetchAndApplySync(id)` → GET worker → `dataRepository.importData(payload)`
4. Save `id` + `enabled=true` to localStorage
5. `refreshBabies()` updates React state
6. App now shows the synced data

### Ongoing sync (both devices)
- Any write to IndexedDB fires Dexie table hooks → `scheduleSync()` (debounced 300ms)
- `scheduleSync()` reads all data via `exportAll()` then PUTs to worker KV
- On each app load, full data is fetched from KV and applied (cloud wins on load)

---

## 6. Conflict Strategy

Last-write-wins. Whichever device wrote to KV most recently is the truth on next app load. No merge logic needed given the use case (two parents sharing one baby's data, rarely writing simultaneously).

---

## 7. Verification

1. **Worker local dev**: `cd worker && npx wrangler dev` — curl all 3 endpoints to verify responses
2. **Generate + QR**: Enable sync in Settings, confirm QR code renders with a valid ID
3. **Join from second browser**: Open a second browser profile, go to Settings → Join, enter the ID, confirm data appears
4. **Background sync**: Add a feeding entry on Device 1, reload Device 2 — data should appear after reload
5. **App load sync**: Reload with sync enabled, confirm data fetch runs before the UI renders
6. **Disable sync**: Confirm localStorage keys are cleared, local data remains intact
7. **Worker deploy**: `cd worker && npx wrangler deploy` — test against production worker URL

---

## Open Decisions (can defer)

- **KV TTL**: No expiry set by default. Can add a long TTL (e.g., 1 year) later if KV storage cost is a concern.
- **Delete on disable**: Disabling sync only clears local keys; KV entry is not deleted. A DELETE endpoint can be added later.
- **Camera fallback**: If the browser denies camera permission, hide the scan button and show only manual entry.

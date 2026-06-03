# Device Sync via Cloudflare KV

## Context

BabyCare is a local-first PWA — all data lives in IndexedDB (Dexie.js) with no backend. Parents often want to share tracking data between devices (e.g., both parents' phones). This feature adds opt-in cloud sync backed by Cloudflare Workers + KV, preserving the offline-first nature while enabling multi-device access.

The design is intentionally simple: one sync ID = one dataset. The ID is the auth token. No accounts, no passwords.

---

## Architecture Overview

```
Device 1 (enable sync)                    Cloudflare Worker
  └─ POST /api/sync/generate  ──────────→  creates KV entry, returns { id }
  └─ shows QR code + text code of ID

Device 2 (join sync)
  └─ types code manually OR scans QR → same input field populated
  └─ GET /api/sync/:id  ────────────────→  returns full data snapshot
  └─ importData() into local IndexedDB

Any device (after sync enabled)
  └─ every DB write triggers background sync
  └─ PUT /api/sync/:id  ────────────────→  stores full data snapshot in KV

App load (sync enabled)
  └─ GET /api/sync/:id  ────────────────→  fetch + importData() before render
```

---

## 1. Cloudflare Worker (in existing `server/` package)

The worker logic lives inside the existing `server/` folder — no new top-level package needed.

### Updated directory structure

```
baby-care/
├── frontend/        # existing
└── server/          # existing — worker code added here
    ├── package.json  # add nanoid, wrangler as dev dep
    ├── wrangler.toml # new — Cloudflare Worker config
    └── src/
        └── index.ts  # new — 3 sync endpoints
```

### `server/wrangler.toml`
```toml
name = "babycare-sync"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "SYNC_KV"
id = "<to be filled after: wrangler kv:namespace create SYNC_KV>"
```

### `server/src/index.ts` — 3 endpoints

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

**SyncPayload type** (shared between server and frontend):
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
- `scheduleSync()` — debounced wrapper around `pushSync()` (300ms debounce to batch rapid writes); no-op when sync is disabled or offline

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
  if (enabled && id && navigator.onLine) {
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
- Displays QR code of the sync ID (using `react-qr-code`)
- **Always shows the sync ID as readable text directly below the QR code** (monospace, selectable, copyable)
- Instructions: "On another device, open Settings → Join Existing Sync, then scan this QR code or type the code below"
- "Disable Sync" button → confirmation → clears `babycare_sync_enabled` and `babycare_sync_id` from localStorage

**Join flow (device 2)**
- Single text input for the sync code
- "Scan QR Code" button — activates camera, and when a code is successfully scanned it is placed into the text input (does not auto-submit — user reviews and presses "Join")
- User can also type or paste the code directly into the same input field
- Camera fallback: if browser denies camera permission, hide the scan button silently; manual entry still works
- On "Join": `fetchAndApplySync(id)` → saves ID + enabled to localStorage → `refreshBabies()`

---

## 3. New Packages

### Server
```bash
cd server && npm install nanoid
npm install -D wrangler
```

### Frontend
```bash
cd frontend && npm install react-qr-code html5-qrcode
```

---

## 4. Files to Create / Modify

| File | Action | What changes |
|------|--------|-------------|
| `server/wrangler.toml` | **Create** | Worker config + KV namespace binding |
| `server/src/index.ts` | **Create** | 3 endpoints: generate, fetch, store |
| `server/package.json` | **Modify** | Add nanoid dep, wrangler dev dep |
| `frontend/src/lib/sync.ts` | **Create** | Sync service (generateSyncId, pushSync, fetchAndApplySync, scheduleSync) |
| `frontend/src/lib/constants.ts` | **Modify** | Add `SYNC_ENABLED` and `SYNC_ID` to `CONSTANTS.storage` |
| `frontend/src/db/repositories/dataRepository.ts` | **Modify** | Add `exportAll()` |
| `frontend/src/db/database.ts` | **Modify** | Register Dexie table hooks → `scheduleSync()` |
| `frontend/src/pages/Settings.tsx` | **Modify** | Add Device Sync section (all 3 UI states) |
| `frontend/src/App.tsx` | **Modify** | Add on-mount sync fetch (online-gated) |
| `frontend/src/types/index.ts` | **Modify** | Add `SyncPayload` type |

---

## 5. Data Flow Details

### Enable sync (Device 1)
1. User clicks "Enable Device Sync" → confirmation dialog
2. Confirm → `generateSyncId()` → POST worker → get `id`
3. Save `id` + `enabled=true` to localStorage
4. `pushSync()` fires immediately (uploads current local data to KV)
5. Settings shows QR code with sync ID text always visible below it

### Join sync (Device 2)
1. User opens Settings → "Join Existing Sync"
2. Types the code manually, pastes it, or taps "Scan QR Code" — either way the code ends up in the single input field
3. User presses "Join"
4. `fetchAndApplySync(id)` → GET worker → `dataRepository.importData(payload)`
5. Save `id` + `enabled=true` to localStorage
6. `refreshBabies()` updates React state
7. App now shows the synced data

### Ongoing sync (both devices)
- Any write to IndexedDB fires Dexie table hooks → `scheduleSync()` (debounced 300ms)
- `scheduleSync()` is a no-op when offline (`!navigator.onLine`) — writes are not queued
- When online, reads all data via `exportAll()` then PUTs to worker KV
- On each app load while online, full data is fetched from KV and applied (cloud wins on load)

---

## 6. Conflict Strategy

Last-write-wins. Whichever device wrote to KV most recently is the truth on next app load. No merge logic needed given the use case (two parents sharing one baby's data, rarely writing simultaneously).

---

## 7. Offline Mode Strategy

BabyCare is local-first — the app works fully without internet. Sync is additive and must never break the offline experience.

### Behaviour when offline

| Event | Online | Offline |
|-------|--------|---------|
| App load | Fetches KV snapshot, applies it, renders | Skips fetch entirely, renders from local IndexedDB |
| User writes data | Writes locally + schedules background sync push | Writes locally only — sync push is silently skipped |
| User opens Device Sync settings | Full UI available | QR code and code displayed normally (for pairing) |
| "Enable Device Sync" | Calls POST worker to get ID, then pushes data | Shows an error toast: "No internet connection — try again when online" |
| "Join Existing Sync" | Fetches remote data and imports | Shows an error toast: "No internet connection — sync data could not be fetched" |
| Background push (`scheduleSync`) | Pushes data to KV | `navigator.onLine` check gates the call — no push, no error, no queue |

### Pending writes / reconnect

The design does **not** queue offline writes for later upload. Rationale:
- Both parents typically use the app on the same home WiFi; true offline scenarios are short (airplane mode, poor signal)
- Queueing adds complexity and risk of replay conflicts
- On reconnect, the next write naturally triggers `scheduleSync()` which uploads the full current state (effectively catching up)

If the device comes back online and the user makes any new write, all accumulated local changes are pushed at once as a full snapshot. If no write happens, the data remains local-only until the next app load where the remote snapshot will win — this is acceptable given the last-write-wins conflict model.

### Offline indicators (UI)

- The Device Sync settings card shows a subtle "Offline — sync paused" badge when `navigator.onLine === false`
- The badge disappears automatically when the browser fires the `online` event
- No other UI changes — the rest of the app is unaffected

---

## 8. Verification

1. **Worker local dev**: `cd server && npx wrangler dev` — curl all 3 endpoints to verify responses
2. **Generate + QR**: Enable sync in Settings, confirm QR code renders with the sync ID text always shown below it
3. **Join — manual entry**: Open a second browser profile, go to Settings → Join, type the code, confirm data appears
4. **Join — QR scan**: Use the scan button on a mobile device, confirm scanned value populates the input field, then confirm data appears after pressing Join
5. **Background sync**: Add a feeding entry on Device 1, reload Device 2 — data should appear after reload
6. **App load sync**: Reload with sync enabled, confirm data fetch runs before the UI renders
7. **Offline — app load**: Enable airplane mode, reload app, confirm it renders from local IndexedDB without errors
8. **Offline — write**: In airplane mode, add an entry, confirm it saves locally; re-enable network, add another entry, confirm both entries appear in the KV after the second write
9. **Offline badge**: Disconnect network while Settings is open, confirm "sync paused" badge appears; reconnect, confirm it disappears
10. **Disable sync**: Confirm localStorage keys are cleared, local data remains intact
11. **Worker deploy**: `cd server && npx wrangler deploy` — test against production worker URL

---

## Open Decisions (can defer)

- **KV TTL**: No expiry set by default. Can add a long TTL (e.g., 1 year) later if KV storage cost is a concern.
- **Delete on disable**: Disabling sync only clears local keys; KV entry is not deleted. A DELETE endpoint can be added later.
- **Reconnect push**: Could listen to the `online` window event and trigger `scheduleSync()` automatically on reconnect — deferred to keep the first version simple.

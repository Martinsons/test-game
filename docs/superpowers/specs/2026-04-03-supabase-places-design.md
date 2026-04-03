# Supabase Places Migration Design

**Date:** 2026-04-03  
**Status:** Approved

## Overview

Move hardcoded place data from `lib/places.ts` and `lib/place-images.ts` into a Supabase PostgreSQL table. Fetch data server-side in the Next.js App Router page, then pass to a client game component.

## Database Schema

Table: `places`

| column | type | nullable | notes |
|---|---|---|---|
| `id` | `bigint` (auto-increment) | no | Primary key |
| `name` | `text` | no | e.g. "Rīga" |
| `lat` | `float8` | no | Latitude |
| `lng` | `float8` | no | Longitude |
| `hint` | `text` | no | Latvian hint text |
| `category` | `text` | no | "city", "town", or "poi" |
| `image_path` | `text` | yes | e.g. "/images/places/riga.jpg" — null if no image |

All 41 existing places are seeded into this table. The `image_path` column replaces the `PLACE_IMAGES` lookup in `lib/place-images.ts`.

## Architecture

### Data flow

```
HTTP Request
  → app/page.tsx (Server Component)
      → lib/supabase.ts (server-only client)
          → Supabase DB: SELECT * FROM places
      ← Place[]
  → <GameClient places={places} />  (Client Component)
      → all game state and interactivity
```

Places are fetched once per page load, before HTML is sent to the browser. No client-side fetch, no loading state.

### New files

- **`lib/supabase.ts`** — creates and exports a server-only Supabase client using `SUPABASE_URL` and `SUPABASE_KEY` env vars (no `NEXT_PUBLIC_` prefix needed)
- **`components/GameClient.tsx`** — current `app/page.tsx` game logic extracted into a `"use client"` component; accepts `places: Place[]` as a prop
- **`scripts/seed.mjs`** — one-time Node script that inserts all 41 hardcoded places into Supabase

### Modified files

- **`app/page.tsx`** — becomes a Server Component; fetches places from Supabase; renders `<GameClient places={places} />`
- **`lib/places.ts`** — remove `RAW_PLACES`, `PLACES`, and `PLACE_IMAGES` import; keep `Place` type, `DIFFICULTY_CONFIG`, `getPlacesForDifficulty`, `calculateDistance`, `calculatePoints`, `getRating`

### Deleted files

- **`lib/place-images.ts`** — image paths now stored in the `image_path` DB column

## Environment Variables

No changes to `.env.local`. Existing vars are used as-is:
```
SUPABASE_URL=...
SUPABASE_KEY=...
```

## Dependencies

- Add `@supabase/supabase-js` to `dependencies`

## Seeding

`scripts/seed.mjs` is a standalone script run once manually:
```
node scripts/seed.mjs
```

It upserts all 41 places using `name` as the unique conflict key. Safe to re-run.

## Out of scope

- Supabase Storage for images (images remain in `/public/images/places/`)
- Any game logic changes
- Score saving / leaderboard

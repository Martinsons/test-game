# Categories, Places Expansion & Game Setup Redesign

**Date:** 2026-04-03  
**Status:** Approved

## Overview

Add `village` and `lake` as new place categories. Add a `difficulty_level` field to each place (how hard it is to locate, independent of category). Redesign the game setup screen to let players pick categories, difficulty, and photo mode freely — replacing the fixed Easy/Medium/Hard/Expert presets.

---

## Data Model

### New `difficulty_level` column

Add `difficulty_level text not null` to the `places` table with values `"easy"`, `"medium"`, or `"hard"`. This reflects how recognizable/easy-to-locate the place is, independent of its category.

### Expanded `category` column

The `category` column gains two new valid values: `"village"` and `"lake"`.
Existing values (`"city"`, `"town"`, `"poi"`) remain unchanged.

### Difficulty ratings for existing places

| Category | difficulty_level | Examples |
|---|---|---|
| city | easy | All 10 cities (Rīga, Daugavpils, …) |
| town | medium | All 20 towns (Cēsis, Sigulda, …) |
| poi — well-known | easy | Rundāles pils, Turaidas pils, Brīvības piemineklis, Aglonas bazilika, Kolkas rags |
| poi — moderate | medium | Gaizņkalns, Ķemeru nacionālais parks, Slīteres nacionālais parks, Engures ezers |
| poi — obscure | hard | Liepājas karostas cietums, Rāznas ezers |

### New places to add

**Villages (category: "village", difficulty_level: "hard")**

| name | lat | lng | hint |
|---|---|---|---|
| Renda | 57.0722 | 22.4914 | Ciems Kurzemē |
| Stende | 57.1683 | 22.5258 | Ciems Talsu novadā |
| Smārde | 56.9833 | 23.4000 | Ciems Engures novadā |
| Eleja | 56.4167 | 23.6833 | Ciems Jelgavas novadā |

**Lakes (category: "lake")**

| name | lat | lng | hint | difficulty_level |
|---|---|---|---|---|
| Lubāns | 56.8667 | 26.7167 | Lielākais ezers Latvijā | easy |
| Burtnieks | 57.6833 | 25.2667 | Lielākais ezers Vidzemē | easy |
| Usmas ezers | 57.2167 | 22.1333 | Lielākais ezers Kurzemē | medium |
| Alūksnes ezers | 57.4167 | 27.0500 | Ezers Alūksnes tuvumā | medium |

Note: **Rāznas ezers** and **Engures ezers** are currently in the DB as `category: "poi"`. Their category changes to `"lake"` as part of this migration. Rāznas ezers → `difficulty_level: "easy"`, Engures ezers → `difficulty_level: "medium"`.

---

## Game Setup Screen

`components/DifficultySelect.tsx` is replaced by `components/GameSetup.tsx`.

### Layout

Three stacked sections on a single screen:

**1. Categories** (multi-select toggles, at least one required)
- 🏙️ Pilsētas (city)
- 🏘️ Mazpilsētas (town)
- 🏡 Ciemi (village)
- 🌊 Ezeri (lake)
- 📍 Interesantas vietas (poi)

**2. Difficulty** (single-select)
- 🟢 Viegli — well-known places
- 🟡 Vidēji — moderately known
- 🔴 Grūti — obscure places
- 🌈 Visi — all difficulty levels

Default selection: all categories on, difficulty = "Visi".

**3. Photo mode** (toggle, off by default)
- 📷 Foto režīms — shows photo instead of place name
- When enabled, pool is limited to places that have an `image`

**Start button** shows live place count: `Sākt spēli · 18 vietas`. Disabled when count = 0.

### GameConfig type

```typescript
export interface GameConfig {
  categories: Category[];
  difficulty: "easy" | "medium" | "hard" | "all";
  photoMode: boolean;
}
```

---

## Game Logic Changes

### `lib/places.ts`

- Add `"village"` and `"lake"` to `Category` type
- Add `difficulty_level: "easy" | "medium" | "hard"` to `Place` interface
- Remove `Difficulty` type, `DIFFICULTY_CONFIG`, `getPlacesForDifficulty`
- Add `GameConfig` interface
- Add `getPlacesForConfig(places: Place[], config: GameConfig, count: number): Place[]`
  - Filters by `config.categories` (place.category must be in array)
  - Filters by `config.difficulty` (or all if "all")
  - Filters by `config.photoMode` (requires `!!place.image`)
  - Shuffles and slices to `count`

### `components/GameClient.tsx`

- `handleStart` receives `GameConfig` instead of `Difficulty`
- Replace `getPlacesForDifficulty(places, diff, ROUNDS)` with `getPlacesForConfig(places, config, ROUNDS)`
- Question bar: show place name in normal mode; hide in photo mode
- `FloatingImagePanel` activates when `config.photoMode && !!currentPlace?.image`
- `ResultCard` already reveals place name after guess — no change needed
- Remove all `isExpert` references, replace with `config.photoMode`

### `app/page.tsx`

No changes — still fetches all places and passes to `GameClient`.

---

## Out of Scope

- Map tile selection (separate feature)
- Scoring changes
- Images for new places (villages/lakes have no photos; photo mode simply won't include them until images are added)

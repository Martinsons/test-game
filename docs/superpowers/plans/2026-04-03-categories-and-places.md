# Categories & Places Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `village` and `lake` categories, assign per-place difficulty levels, and replace the fixed difficulty presets with a free-form setup screen (category checkboxes + difficulty selector + photo mode toggle).

**Architecture:** DB gets a `difficulty_level` column and new places; `lib/places.ts` replaces the `Difficulty`/`DIFFICULTY_CONFIG` model with `GameConfig`/`getPlacesForConfig`; `DifficultySelect` is deleted and replaced by `GameSetup`; `GameClient` and `GameOver` are updated to use `GameConfig`.

**Tech Stack:** Next.js 16 App Router, Supabase (MCP), TypeScript, Tailwind CSS, React

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| DB migration | Supabase MCP | Add `difficulty_level` column, update existing rows, add 8 new places |
| Modify | `scripts/seed.mjs` | Add `difficulty_level` field and new places to keep seed in sync |
| Modify | `lib/places.ts` | New types (`Category`, `DifficultyLevel`, `GameConfig`), replace `getPlacesForDifficulty` with `getPlacesForConfig`, remove `Difficulty`/`DIFFICULTY_CONFIG` |
| Create | `components/GameSetup.tsx` | Category checkboxes + difficulty radio + photo mode toggle + live count |
| Modify | `components/GameOver.tsx` | Replace `difficulty: Difficulty` prop with `modeLabel: string` |
| Modify | `components/GameClient.tsx` | Use `GameConfig`, `GameSetup`, `getPlacesForConfig`; replace `isExpert` with `gameConfig.photoMode` |
| Delete | `components/DifficultySelect.tsx` | Replaced by `GameSetup` |

---

## Task 1: DB Migration

**Files:** Supabase MCP + `scripts/seed.mjs`

This task uses the Supabase MCP tools (`apply_migration`, `execute_sql`) to evolve the schema and data. The project ID is `zenyxfxjgbqlvkjhbssd`.

- [ ] **Step 1: Add `difficulty_level` column and populate existing rows**

Run via `mcp__plugin_supabase_supabase__apply_migration` with name `add_difficulty_level`:

```sql
-- Add column with default so existing rows get 'medium'
ALTER TABLE places ADD COLUMN difficulty_level text NOT NULL DEFAULT 'medium';

-- Cities are easy
UPDATE places SET difficulty_level = 'easy' WHERE category = 'city';

-- Well-known POIs are easy
UPDATE places SET difficulty_level = 'easy'
  WHERE name IN (
    'Rundāles pils', 'Turaidas pils', 'Brīvības piemineklis',
    'Aglonas bazilika', 'Kolkas rags'
  );

-- Obscure POI is hard
UPDATE places SET difficulty_level = 'hard' WHERE name = 'Liepājas karostas cietums';

-- Migrate Rāznas ezers: poi → lake, hard → easy
UPDATE places SET category = 'lake', difficulty_level = 'easy' WHERE name = 'Rāznas ezers';

-- Migrate Engures ezers: poi → lake (difficulty stays medium)
UPDATE places SET category = 'lake' WHERE name = 'Engures ezers';
```

- [ ] **Step 2: Insert new villages and lakes**

Run via `mcp__plugin_supabase_supabase__execute_sql`:

```sql
INSERT INTO places (name, lat, lng, hint, category, difficulty_level) VALUES
  ('Renda',          57.0722, 22.4914, 'Ciems Kurzemē',          'village', 'hard'),
  ('Stende',         57.1683, 22.5258, 'Ciems Talsu novadā',     'village', 'hard'),
  ('Smārde',         56.9833, 23.4000, 'Ciems Engures novadā',   'village', 'hard'),
  ('Eleja',          56.4167, 23.6833, 'Ciems Jelgavas novadā',  'village', 'hard'),
  ('Lubāns',         56.8667, 26.7167, 'Lielākais ezers Latvijā','lake',    'easy'),
  ('Burtnieks',      57.6833, 25.2667, 'Lielākais ezers Vidzemē','lake',    'easy'),
  ('Usmas ezers',    57.2167, 22.1333, 'Lielākais ezers Kurzemē','lake',    'medium'),
  ('Alūksnes ezers', 57.4167, 27.0500, 'Ezers Alūksnes tuvumā', 'lake',    'medium');
```

- [ ] **Step 3: Verify counts**

Run via `mcp__plugin_supabase_supabase__execute_sql`:

```sql
SELECT category, difficulty_level, count(*) FROM places GROUP BY category, difficulty_level ORDER BY category, difficulty_level;
```

Expected results (49 total rows):
- city / easy: 10
- town / medium: 20
- village / hard: 4
- lake / easy: 3 (Rāznas, Lubāns, Burtnieks)
- lake / medium: 3 (Engures, Usmas, Alūksnes)
- poi / easy: 5 (Rundāles, Turaidas, Brīvības, Aglonas, Kolkas)
- poi / medium: 3 (Gaizņkalns, Ķemeru, Slīteres)
- poi / hard: 1 (Liepājas karostas)

- [ ] **Step 4: Update `scripts/seed.mjs` to include `difficulty_level` and new places**

Replace `scripts/seed.mjs` with:

```javascript
// scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const places = [
  // Cities — easy
  { name: "Rīga",          lat: 56.9496, lng: 24.1052, hint: "Galvaspilsēta",                   category: "city", difficulty_level: "easy", image: "/images/places/riga.jpg" },
  { name: "Daugavpils",    lat: 55.8749, lng: 26.5356, hint: "Otrā lielākā pilsēta",              category: "city", difficulty_level: "easy", image: "/images/places/daugavpils.JPG" },
  { name: "Liepāja",       lat: 56.5047, lng: 21.0107, hint: "Pilsēta, kur pūš vējš",            category: "city", difficulty_level: "easy", image: "/images/places/liepaja.jpg" },
  { name: "Jelgava",       lat: 56.6511, lng: 23.7134, hint: "Zemgales galvaspilsēta",            category: "city", difficulty_level: "easy", image: "/images/places/jelgava.jpg" },
  { name: "Jūrmala",       lat: 56.9680, lng: 23.7704, hint: "Kūrortpilsēta",                    category: "city", difficulty_level: "easy", image: "/images/places/jurmala.png" },
  { name: "Ventspils",     lat: 57.3942, lng: 21.5647, hint: "Ostas pilsēta",                    category: "city", difficulty_level: "easy", image: "/images/places/ventspils.jpg" },
  { name: "Rēzekne",       lat: 56.5099, lng: 27.3340, hint: "Latgales sirds",                   category: "city", difficulty_level: "easy", image: "/images/places/rezekne.jpg" },
  { name: "Valmiera",      lat: 57.5384, lng: 25.4263, hint: "Pilsēta pie Gaujas",               category: "city", difficulty_level: "easy", image: "/images/places/valmiera.jpg" },
  { name: "Jēkabpils",     lat: 56.4995, lng: 25.8606, hint: "Pilsēta pie Daugavas",             category: "city", difficulty_level: "easy", image: "/images/places/jekabpils.jpg" },
  { name: "Ogre",          lat: 56.8166, lng: 24.6047, hint: "Pilsēta netālu no Rīgas",          category: "city", difficulty_level: "easy", image: "/images/places/ogre-latvia.jpg" },
  // Towns — medium
  { name: "Cēsis",         lat: 57.3119, lng: 25.2748, hint: "Viduslaiku pilsēta",               category: "town", difficulty_level: "medium", image: "/images/places/cesis.jpg" },
  { name: "Kuldīga",       lat: 56.9677, lng: 21.9681, hint: "Ventas rumba",                     category: "town", difficulty_level: "medium", image: "/images/places/kuldiga.jpg" },
  { name: "Sigulda",       lat: 57.1514, lng: 24.8514, hint: "Latvijas Šveice",                  category: "town", difficulty_level: "medium", image: "/images/places/sigulda.png" },
  { name: "Tukums",        lat: 56.9668, lng: 23.1526, hint: "Pilsēta Zemgalē",                  category: "town", difficulty_level: "medium", image: "/images/places/tukums.jpg" },
  { name: "Talsi",         lat: 57.2455, lng: 22.5815, hint: "Deviņu pakalnu pilsēta",           category: "town", difficulty_level: "medium", image: "/images/places/talsi.jpg" },
  { name: "Bauska",        lat: 56.4079, lng: 24.1944, hint: "Pilsēta pie Lielupes sākuma",      category: "town", difficulty_level: "medium", image: "/images/places/bauska.jpg" },
  { name: "Dobele",        lat: 56.6254, lng: 23.2793, hint: "Ceriņu pilsēta",                   category: "town", difficulty_level: "medium", image: "/images/places/dobele.jpg" },
  { name: "Saldus",        lat: 56.6636, lng: 22.4888, hint: "Pilsēta Kurzemē",                  category: "town", difficulty_level: "medium", image: null },
  { name: "Krāslava",      lat: 55.8951, lng: 27.1681, hint: "Pilsēta pie Daugavas Latgalē",     category: "town", difficulty_level: "medium", image: "/images/places/kraslava.jpg" },
  { name: "Ludza",         lat: 56.5467, lng: 27.7192, hint: "Viena no vecākajām pilsētām",      category: "town", difficulty_level: "medium", image: "/images/places/ludza.jpg" },
  { name: "Madona",        lat: 56.8538, lng: 26.2173, hint: "Vidzemes augstienes pilsēta",      category: "town", difficulty_level: "medium", image: "/images/places/madona-latvia.jpg" },
  { name: "Gulbene",       lat: 57.1749, lng: 26.7527, hint: "Bānītis",                          category: "town", difficulty_level: "medium", image: "/images/places/gulbene.jpg" },
  { name: "Balvi",         lat: 57.1314, lng: 27.2658, hint: "Pilsēta Ziemeļlatgalē",            category: "town", difficulty_level: "medium", image: "/images/places/balvi.jpg" },
  { name: "Alūksne",       lat: 57.4225, lng: 27.0484, hint: "Ezera pilsēta Vidzemē",            category: "town", difficulty_level: "medium", image: "/images/places/aluksne.jpg" },
  { name: "Limbaži",       lat: 57.5136, lng: 24.7135, hint: "Pilsēta Vidzemē",                  category: "town", difficulty_level: "medium", image: "/images/places/limbazi.jpg" },
  { name: "Smiltene",      lat: 57.4242, lng: 25.9014, hint: "Pilsēta Vidzemē",                  category: "town", difficulty_level: "medium", image: "/images/places/smiltene.jpg" },
  { name: "Preiļi",        lat: 56.2942, lng: 26.7246, hint: "Pilsēta Latgalē",                  category: "town", difficulty_level: "medium", image: "/images/places/preili.JPG" },
  { name: "Līvāni",        lat: 56.3540, lng: 26.1756, hint: "Stikla pilsēta",                   category: "town", difficulty_level: "medium", image: "/images/places/livani.jpg" },
  { name: "Aizkraukle",    lat: 56.6048, lng: 25.2551, hint: "Pilsēta pie Daugavas",             category: "town", difficulty_level: "medium", image: "/images/places/aizkraukle.png" },
  { name: "Aizpute",       lat: 56.7180, lng: 21.6013, hint: "Pilsēta Kurzemē",                  category: "town", difficulty_level: "medium", image: "/images/places/aizpute.jpg" },
  // Villages — hard
  { name: "Renda",         lat: 57.0722, lng: 22.4914, hint: "Ciems Kurzemē",          category: "village", difficulty_level: "hard", image: null },
  { name: "Stende",        lat: 57.1683, lng: 22.5258, hint: "Ciems Talsu novadā",     category: "village", difficulty_level: "hard", image: null },
  { name: "Smārde",        lat: 56.9833, lng: 23.4000, hint: "Ciems Engures novadā",   category: "village", difficulty_level: "hard", image: null },
  { name: "Eleja",         lat: 56.4167, lng: 23.6833, hint: "Ciems Jelgavas novadā",  category: "village", difficulty_level: "hard", image: null },
  // Lakes
  { name: "Rāznas ezers",  lat: 56.3167, lng: 27.4500, hint: "Latgales lielākais ezers",         category: "lake", difficulty_level: "easy",   image: null },
  { name: "Engures ezers", lat: 57.1833, lng: 23.1333, hint: "Lielākais piekrastes ezers",        category: "lake", difficulty_level: "medium", image: "/images/places/engure-lake.jpg" },
  { name: "Lubāns",        lat: 56.8667, lng: 26.7167, hint: "Lielākais ezers Latvijā",           category: "lake", difficulty_level: "easy",   image: null },
  { name: "Burtnieks",     lat: 57.6833, lng: 25.2667, hint: "Lielākais ezers Vidzemē",           category: "lake", difficulty_level: "easy",   image: null },
  { name: "Usmas ezers",   lat: 57.2167, lng: 22.1333, hint: "Lielākais ezers Kurzemē",           category: "lake", difficulty_level: "medium", image: null },
  { name: "Alūksnes ezers",lat: 57.4167, lng: 27.0500, hint: "Ezers Alūksnes tuvumā",            category: "lake", difficulty_level: "medium", image: null },
  // POI — easy
  { name: "Rundāles pils",              lat: 56.4133, lng: 24.0241, hint: "Baroka stila pils",                         category: "poi", difficulty_level: "easy",   image: "/images/places/rundale-palace.jpg" },
  { name: "Turaidas pils",              lat: 57.1849, lng: 24.8478, hint: "Sarkanā pils Siguldas tuvumā",              category: "poi", difficulty_level: "easy",   image: "/images/places/turaida-castle.JPG" },
  { name: "Aglonas bazilika",           lat: 56.1327, lng: 27.0045, hint: "Katoļu svētvieta Latgalē",                  category: "poi", difficulty_level: "easy",   image: null },
  { name: "Kolkas rags",                lat: 57.7559, lng: 22.5934, hint: "Kur satiekas Baltijas jūra un Rīgas līcis", category: "poi", difficulty_level: "easy",   image: "/images/places/cape-kolka.jpg" },
  { name: "Brīvības piemineklis",       lat: 56.9514, lng: 24.1132, hint: "Milda — Rīgas simbols",                     category: "poi", difficulty_level: "easy",   image: "/images/places/freedom-monument.jpg" },
  // POI — medium
  { name: "Gaizņkalns",                 lat: 57.0847, lng: 25.9667, hint: "Augstākais kalns Latvijā (312 m)",          category: "poi", difficulty_level: "medium", image: "/images/places/gaizinkalns.jpg" },
  { name: "Ķemeru nacionālais parks",   lat: 56.9167, lng: 23.4833, hint: "Purvi un sēravoti",                         category: "poi", difficulty_level: "medium", image: "/images/places/kemeri-national-park.JPG" },
  { name: "Slīteres nacionālais parks", lat: 57.6333, lng: 22.2833, hint: "Dabas parks Ziemeļkurzemē",                 category: "poi", difficulty_level: "medium", image: "/images/places/slitere-national-park.jpg" },
  // POI — hard
  { name: "Liepājas karostas cietums",  lat: 56.5556, lng: 20.9833, hint: "Vēsturisks militārs cietums",               category: "poi", difficulty_level: "hard",   image: null },
];

const { error } = await supabase
  .from("places")
  .upsert(places, { onConflict: "name" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log(`Seeded ${places.length} places successfully.`);
```

- [ ] **Step 5: Commit**

```bash
git add scripts/seed.mjs
git commit -m "feat: update seed script with difficulty_level and new places"
```

---

## Task 2: Update `lib/places.ts`

**Files:**
- Modify: `lib/places.ts`

- [ ] **Step 1: Replace `lib/places.ts` with new content**

```typescript
export type Category = "city" | "town" | "village" | "lake" | "poi";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Place {
  name: string;
  lat: number;
  lng: number;
  hint: string;
  category: Category;
  difficulty_level: DifficultyLevel;
  image?: string | null;
}

export interface GameConfig {
  categories: Category[];
  difficulty: DifficultyLevel | "all";
  photoMode: boolean;
}

export function getPlacesForConfig(places: Place[], config: GameConfig, count: number): Place[] {
  const pool = places.filter(p => {
    if (!config.categories.includes(p.category)) return false;
    if (config.difficulty !== "all" && p.difficulty_level !== config.difficulty) return false;
    if (config.photoMode && !p.image) return false;
    return true;
  });
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculatePoints(distanceKm: number): number {
  if (distanceKm < 1) return 1000;
  return Math.max(0, Math.round(1000 * Math.exp(-distanceKm / 50)));
}

export function getRating(points: number): string {
  if (points >= 950) return "Perfekti! 🎯";
  if (points >= 800) return "Izcili! 🌟";
  if (points >= 600) return "Labi! 👍";
  if (points >= 300) return "Normāli 🤔";
  if (points >= 100) return "Var labāk 😅";
  return "Hmm... 🗺️";
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/martinswork/test-game-new && npx tsc --noEmit 2>&1 | head -30
```

Expected: errors in GameClient, GameOver (they still import removed types) — that is expected at this step. What must NOT appear: errors inside lib/places.ts itself.

- [ ] **Step 3: Commit**

```bash
git add lib/places.ts
git commit -m "refactor: replace Difficulty/DIFFICULTY_CONFIG with GameConfig and getPlacesForConfig"
```

---

## Task 3: Create `components/GameSetup.tsx`

**Files:**
- Create: `components/GameSetup.tsx`

- [ ] **Step 1: Create the file**

```typescript
"use client";

import { useState } from "react";
import { Place, Category, GameConfig } from "@/lib/places";

interface Props {
  places: Place[];
  onStart: (config: GameConfig) => void;
}

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "city",    label: "Pilsētas",           emoji: "🏙️" },
  { value: "town",    label: "Mazpilsētas",         emoji: "🏘️" },
  { value: "village", label: "Ciemi",               emoji: "🏡" },
  { value: "lake",    label: "Ezeri",               emoji: "🌊" },
  { value: "poi",     label: "Interesantas vietas", emoji: "📍" },
];

const DIFFICULTIES: { value: GameConfig["difficulty"]; label: string; emoji: string; description: string }[] = [
  { value: "easy",   label: "Viegli",  emoji: "🟢", description: "Labi zināmas vietas" },
  { value: "medium", label: "Vidēji",  emoji: "🟡", description: "Vidēji zināmas" },
  { value: "hard",   label: "Grūti",   emoji: "🔴", description: "Maz zināmas vietas" },
  { value: "all",    label: "Visi",    emoji: "🌈", description: "Visas grūtības" },
];

export default function GameSetup({ places, onStart }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    ["city", "town", "village", "lake", "poi"]
  );
  const [difficulty, setDifficulty] = useState<GameConfig["difficulty"]>("all");
  const [photoMode, setPhotoMode] = useState(false);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const count = places.filter(p => {
    if (!selectedCategories.includes(p.category)) return false;
    if (difficulty !== "all" && p.difficulty_level !== difficulty) return false;
    if (photoMode && !p.image) return false;
    return true;
  }).length;

  const handleStart = () => {
    if (count === 0) return;
    onStart({ categories: selectedCategories, difficulty, photoMode });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white items-center justify-center px-4 overflow-y-auto">
      <h1 className="text-4xl font-black text-red-400 mb-2">🇱🇻 Latvijas Karte</h1>
      <p className="text-gray-400 mb-8 text-lg">Izvēlies spēles iestatījumus</p>

      <div className="w-full max-w-lg space-y-6">

        {/* Categories */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Kategorijas</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label, emoji }) => {
              const active = selectedCategories.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleCategory(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                    active
                      ? "bg-red-500 border-red-500 text-white"
                      : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Grūtības pakāpe</p>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTIES.map(({ value, label, emoji, description }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all ${
                  difficulty === value
                    ? "bg-gray-700 border-gray-500 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-gray-500 text-center leading-tight">{description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo mode */}
        <div>
          <button
            onClick={() => setPhotoMode(p => !p)}
            className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all ${
              photoMode
                ? "bg-gray-700 border-gray-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            <span className="text-2xl">📷</span>
            <div className="text-left">
              <div className="font-semibold text-sm">Foto režīms</div>
              <div className="text-xs text-gray-500">Uzmin vietu pēc fotogrāfijas</div>
            </div>
            <div className={`ml-auto w-10 h-6 rounded-full transition-colors flex-shrink-0 ${photoMode ? "bg-red-500" : "bg-gray-700"}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${photoMode ? "translate-x-5" : "translate-x-1"}`} />
            </div>
          </button>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={count === 0}
          className="w-full py-4 rounded-xl font-black text-lg transition-all bg-red-500 hover:bg-red-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sākt spēli · {count} vietas
        </button>

      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles for this file**

```bash
cd /Users/martinswork/test-game-new && npx tsc --noEmit 2>&1 | grep "GameSetup"
```

Expected: no errors mentioning GameSetup.tsx.

- [ ] **Step 3: Commit**

```bash
git add components/GameSetup.tsx
git commit -m "feat: add GameSetup component with category/difficulty/photo mode selection"
```

---

## Task 4: Update `components/GameOver.tsx`

**Files:**
- Modify: `components/GameOver.tsx`

`GameOver` currently imports `Difficulty` and `DIFFICULTY_CONFIG` (both removed). Replace the `difficulty: Difficulty` prop with `modeLabel: string`.

- [ ] **Step 1: Replace `components/GameOver.tsx` with**

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";

const ROUNDS = 10;

interface Props {
  visible: boolean;
  score: number;
  modeLabel: string;
  onRestart: () => void;
}

export default function GameOver({ visible, score, modeLabel, onRestart }: Props) {
  const maxScore = ROUNDS * 1000;
  const percentage = Math.round((score / maxScore) * 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center"
          style={{ zIndex: 2000 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 250, damping: 22 }}
            className="text-center"
          >
            <div className="text-4xl font-black text-red-400 mb-1">Spēle beigusies!</div>
            <div className="text-gray-500 mb-6">{modeLabel}</div>
            <div className="text-7xl font-black text-white my-4">{score}</div>
            <div className="text-gray-400 text-lg mb-1">no {maxScore} iespējamiem punktiem</div>
            <div className="text-gray-500 text-sm mb-10">{percentage}% precizitāte</div>
            <button
              onClick={onRestart}
              className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-bold px-10 py-4 rounded-xl text-lg"
            >
              Spēlēt vēlreiz
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/GameOver.tsx
git commit -m "refactor: replace Difficulty prop with modeLabel string in GameOver"
```

---

## Task 5: Update `components/GameClient.tsx` and delete `DifficultySelect.tsx`

**Files:**
- Modify: `components/GameClient.tsx`
- Delete: `components/DifficultySelect.tsx`

- [ ] **Step 1: Replace `components/GameClient.tsx` with**

```typescript
"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import {
  Place,
  GameConfig,
  getPlacesForConfig,
  calculateDistance,
  calculatePoints,
} from "@/lib/places";
import GameSetup from "@/components/GameSetup";
import ResultCard from "@/components/ResultCard";
import GameOver from "@/components/GameOver";
import FloatingImagePanel from "@/components/FloatingImagePanel";

const GameMap = dynamic(() => import("@/components/GameMap"), { ssr: false });

const ROUNDS = 10;

const DIFFICULTY_LABELS: Record<GameConfig["difficulty"], string> = {
  easy:   "🟢 Viegli",
  medium: "🟡 Vidēji",
  hard:   "🔴 Grūti",
  all:    "🌈 Visi",
};

interface Props {
  places: Place[];
}

export default function GameClient({ places }: Props) {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gamePlaces, setGamePlaces] = useState<Place[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [guessLatLng, setGuessLatLng] = useState<[number, number] | null>(null);
  const [actualLatLng, setActualLatLng] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState(0);
  const [points, setPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const roundRef = useRef(round);
  const showResultRef = useRef(showResult);
  roundRef.current = round;
  showResultRef.current = showResult;

  const gamePlacesRef = useRef(gamePlaces);
  gamePlacesRef.current = gamePlaces;

  const handleStart = (config: GameConfig) => {
    setGamePlaces(getPlacesForConfig(places, config, ROUNDS));
    setGameConfig(config);
    setRound(0);
    setScore(0);
    setShowResult(false);
    setShowGameOver(false);
    setGuessLatLng(null);
    setActualLatLng(null);
  };

  const handleGuess = useCallback((lat: number, lng: number) => {
    if (showResultRef.current) return;
    const place = gamePlacesRef.current[roundRef.current];
    if (!place) return;
    const dist = calculateDistance(lat, lng, place.lat, place.lng);
    const pts = calculatePoints(dist);
    setGuessLatLng([lat, lng]);
    setActualLatLng([place.lat, place.lng]);
    setDistance(dist);
    setPoints(pts);
    setScore((s) => s + pts);
    setShowResult(true);
  }, []);

  const handleNext = () => {
    const isLast = round === gamePlaces.length - 1;
    setShowResult(false);
    setGuessLatLng(null);
    setActualLatLng(null);
    if (isLast) {
      setShowGameOver(true);
    } else {
      setRound((r) => r + 1);
    }
  };

  const handleRestart = () => {
    setGameConfig(null);
    setGamePlaces([]);
    setRound(0);
    setScore(0);
    setGuessLatLng(null);
    setActualLatLng(null);
    setShowResult(false);
    setShowGameOver(false);
  };

  if (!gameConfig) {
    return <GameSetup places={places} onStart={handleStart} />;
  }

  const currentPlace = gamePlaces[round] ?? null;
  const totalRounds = gamePlaces.length;
  const isPhotoMode = gameConfig.photoMode;
  const modeLabel = `${DIFFICULTY_LABELS[gameConfig.difficulty]}${isPhotoMode ? " · 📷" : ""}`;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-red-400 tracking-tight">🇱🇻 Latvijas Karte</h1>
          <span className="text-sm text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">
            {modeLabel}
          </span>
          <button
            onClick={handleRestart}
            className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 rounded-full px-3 py-0.5 transition-colors"
          >
            ← Izvēlne
          </button>
        </div>
        <div className="flex gap-6 text-sm">
          <span className="text-gray-400">
            Raunds <strong className="text-white">{Math.min(round + 1, totalRounds)}</strong> / {totalRounds}
          </span>
          <span className="text-gray-400">
            Punkti <strong className="text-red-400 text-base">{score}</strong>
          </span>
        </div>
      </header>

      {!isPhotoMode && (
        <div className="bg-gray-900 border-b border-gray-800 text-center py-4 shrink-0">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Kur atrodas...</p>
          <p className="text-3xl font-black text-white">{currentPlace?.name ?? "..."}</p>
          {currentPlace?.hint && (
            <p className="text-gray-500 text-sm mt-1">{currentPlace.hint}</p>
          )}
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        <GameMap
          onGuess={handleGuess}
          guessLatLng={guessLatLng}
          actualLatLng={actualLatLng}
          disabled={showResult || showGameOver}
        />

        {isPhotoMode && currentPlace?.image && (
          <FloatingImagePanel key={currentPlace.name} imageUrl={currentPlace.image} />
        )}

        <ResultCard
          visible={showResult}
          distance={distance}
          points={points}
          placeName={isPhotoMode ? (currentPlace?.name ?? "") : undefined}
          isLastRound={round === totalRounds - 1}
          onNext={handleNext}
        />
        <GameOver
          visible={showGameOver}
          score={score}
          modeLabel={modeLabel}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Delete `DifficultySelect.tsx`**

```bash
rm /Users/martinswork/test-game-new/components/DifficultySelect.tsx
```

- [ ] **Step 3: Verify TypeScript is clean**

```bash
cd /Users/martinswork/test-game-new && npx tsc --noEmit 2>&1
```

Expected: no output (zero errors).

- [ ] **Step 4: Commit**

```bash
git add components/GameClient.tsx components/DifficultySelect.tsx
git commit -m "feat: wire GameConfig through GameClient, replace DifficultySelect with GameSetup"
```

---

## Task 6: Verify Build

**Files:** none

- [ ] **Step 1: Run production build**

```bash
cd /Users/martinswork/test-game-new && npm run build 2>&1
```

Expected: build succeeds with `Route (app) / ƒ (Dynamic)`. No TypeScript errors, no compilation errors.

- [ ] **Step 2: Commit if anything needed fixing**

If the build revealed any issues (e.g. missing props, type errors), fix them and commit with `fix: resolve build errors after category expansion`.

- [ ] **Step 3: Push to main**

```bash
git push origin main
```

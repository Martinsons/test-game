# Supabase Places Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move hardcoded place data from TypeScript files into a Supabase PostgreSQL table, fetching it server-side on page load.

**Architecture:** `app/page.tsx` becomes an async Server Component that queries Supabase and passes `Place[]` to a new `"use client"` `GameClient` component. The Supabase client lives in `lib/supabase.ts` and is never bundled client-side. All game logic and state stays unchanged — only data sourcing changes.

**Tech Stack:** Next.js 16 App Router, `@supabase/supabase-js`, Supabase PostgreSQL

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `lib/supabase.ts` | Server-only Supabase client instance |
| Create | `components/GameClient.tsx` | All game UI/state (extracted from page.tsx), `"use client"` |
| Create | `scripts/seed.mjs` | One-time script to insert all 41 places into Supabase |
| Modify | `lib/places.ts` | Remove hardcoded data; update `getPlacesForDifficulty` signature |
| Modify | `app/page.tsx` | Server Component: fetch places, render `<GameClient places={places} />` |
| Modify | `package.json` | Add `@supabase/supabase-js` dependency |
| Delete | `lib/place-images.ts` | Image paths now stored in DB `image` column |

---

## Task 1: Install @supabase/supabase-js

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install @supabase/supabase-js
```

Expected output: package added to `node_modules`, `package.json` `dependencies` now includes `"@supabase/supabase-js": "^2.x.x"`.

- [ ] **Step 2: Verify**

```bash
node -e "require('@supabase/supabase-js'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @supabase/supabase-js"
```

---

## Task 2: Create `places` table in Supabase

**Files:** (SQL run in Supabase dashboard, no local files changed)

- [ ] **Step 1: Open Supabase SQL Editor**

Go to your Supabase project → SQL Editor → New query.

- [ ] **Step 2: Run this SQL to create the table and enable public read access**

```sql
create table places (
  id bigint generated always as identity primary key,
  name text not null,
  lat float8 not null,
  lng float8 not null,
  hint text not null,
  category text not null,
  image text
);

alter table places enable row level security;

create policy "Public read access"
  on places for select
  using (true);
```

- [ ] **Step 3: Verify the table exists**

In Supabase: Table Editor → confirm `places` table appears with the 7 columns above.

---

## Task 3: Create `lib/supabase.ts`

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create the file**

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

This file is only ever imported in Server Components or server-side scripts, so the credentials stay out of the client bundle.

- [ ] **Step 2: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: add server-only Supabase client"
```

---

## Task 4: Create and run `scripts/seed.mjs`

**Files:**
- Create: `scripts/seed.mjs`

- [ ] **Step 1: Create the seed script**

```javascript
// scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const places = [
  // Cities
  { name: "Rīga",          lat: 56.9496, lng: 24.1052, hint: "Galvaspilsēta",                   category: "city", image: "/images/places/riga.jpg" },
  { name: "Daugavpils",    lat: 55.8749, lng: 26.5356, hint: "Otrā lielākā pilsēta",              category: "city", image: "/images/places/daugavpils.JPG" },
  { name: "Liepāja",       lat: 56.5047, lng: 21.0107, hint: "Pilsēta, kur pūš vējš",            category: "city", image: "/images/places/liepaja.jpg" },
  { name: "Jelgava",       lat: 56.6511, lng: 23.7134, hint: "Zemgales galvaspilsēta",            category: "city", image: "/images/places/jelgava.jpg" },
  { name: "Jūrmala",       lat: 56.9680, lng: 23.7704, hint: "Kūrortpilsēta",                    category: "city", image: "/images/places/jurmala.png" },
  { name: "Ventspils",     lat: 57.3942, lng: 21.5647, hint: "Ostas pilsēta",                    category: "city", image: "/images/places/ventspils.jpg" },
  { name: "Rēzekne",       lat: 56.5099, lng: 27.3340, hint: "Latgales sirds",                   category: "city", image: "/images/places/rezekne.jpg" },
  { name: "Valmiera",      lat: 57.5384, lng: 25.4263, hint: "Pilsēta pie Gaujas",               category: "city", image: "/images/places/valmiera.jpg" },
  { name: "Jēkabpils",     lat: 56.4995, lng: 25.8606, hint: "Pilsēta pie Daugavas",             category: "city", image: "/images/places/jekabpils.jpg" },
  { name: "Ogre",          lat: 56.8166, lng: 24.6047, hint: "Pilsēta netālu no Rīgas",          category: "city", image: "/images/places/ogre-latvia.jpg" },
  // Towns
  { name: "Cēsis",         lat: 57.3119, lng: 25.2748, hint: "Viduslaiku pilsēta",               category: "town", image: "/images/places/cesis.jpg" },
  { name: "Kuldīga",       lat: 56.9677, lng: 21.9681, hint: "Ventas rumba",                     category: "town", image: "/images/places/kuldiga.jpg" },
  { name: "Sigulda",       lat: 57.1514, lng: 24.8514, hint: "Latvijas Šveice",                  category: "town", image: "/images/places/sigulda.png" },
  { name: "Tukums",        lat: 56.9668, lng: 23.1526, hint: "Pilsēta Zemgalē",                  category: "town", image: "/images/places/tukums.jpg" },
  { name: "Talsi",         lat: 57.2455, lng: 22.5815, hint: "Deviņu pakalnu pilsēta",           category: "town", image: "/images/places/talsi.jpg" },
  { name: "Bauska",        lat: 56.4079, lng: 24.1944, hint: "Pilsēta pie Lielupes sākuma",      category: "town", image: "/images/places/bauska.jpg" },
  { name: "Dobele",        lat: 56.6254, lng: 23.2793, hint: "Ceriņu pilsēta",                   category: "town", image: "/images/places/dobele.jpg" },
  { name: "Saldus",        lat: 56.6636, lng: 22.4888, hint: "Pilsēta Kurzemē",                  category: "town", image: null },
  { name: "Krāslava",      lat: 55.8951, lng: 27.1681, hint: "Pilsēta pie Daugavas Latgalē",     category: "town", image: "/images/places/kraslava.jpg" },
  { name: "Ludza",         lat: 56.5467, lng: 27.7192, hint: "Viena no vecākajām pilsētām",      category: "town", image: "/images/places/ludza.jpg" },
  { name: "Madona",        lat: 56.8538, lng: 26.2173, hint: "Vidzemes augstienes pilsēta",      category: "town", image: "/images/places/madona-latvia.jpg" },
  { name: "Gulbene",       lat: 57.1749, lng: 26.7527, hint: "Bānītis",                          category: "town", image: "/images/places/gulbene.jpg" },
  { name: "Balvi",         lat: 57.1314, lng: 27.2658, hint: "Pilsēta Ziemeļlatgalē",            category: "town", image: "/images/places/balvi.jpg" },
  { name: "Alūksne",       lat: 57.4225, lng: 27.0484, hint: "Ezera pilsēta Vidzemē",            category: "town", image: "/images/places/aluksne.jpg" },
  { name: "Limbaži",       lat: 57.5136, lng: 24.7135, hint: "Pilsēta Vidzemē",                  category: "town", image: "/images/places/limbazi.jpg" },
  { name: "Smiltene",      lat: 57.4242, lng: 25.9014, hint: "Pilsēta Vidzemē",                  category: "town", image: "/images/places/smiltene.jpg" },
  { name: "Preiļi",        lat: 56.2942, lng: 26.7246, hint: "Pilsēta Latgalē",                  category: "town", image: "/images/places/preili.JPG" },
  { name: "Līvāni",        lat: 56.3540, lng: 26.1756, hint: "Stikla pilsēta",                   category: "town", image: "/images/places/livani.jpg" },
  { name: "Aizkraukle",    lat: 56.6048, lng: 25.2551, hint: "Pilsēta pie Daugavas",             category: "town", image: "/images/places/aizkraukle.png" },
  { name: "Aizpute",       lat: 56.7180, lng: 21.6013, hint: "Pilsēta Kurzemē",                  category: "town", image: "/images/places/aizpute.jpg" },
  // Points of interest
  { name: "Gaizņkalns",                 lat: 57.0847, lng: 25.9667, hint: "Augstākais kalns Latvijā (312 m)",          category: "poi", image: "/images/places/gaizinkalns.jpg" },
  { name: "Kolkas rags",                lat: 57.7559, lng: 22.5934, hint: "Kur satiekas Baltijas jūra un Rīgas līcis", category: "poi", image: "/images/places/cape-kolka.jpg" },
  { name: "Rundāles pils",              lat: 56.4133, lng: 24.0241, hint: "Baroka stila pils",                         category: "poi", image: "/images/places/rundale-palace.jpg" },
  { name: "Turaidas pils",              lat: 57.1849, lng: 24.8478, hint: "Sarkanā pils Siguldas tuvumā",              category: "poi", image: "/images/places/turaida-castle.JPG" },
  { name: "Aglonas bazilika",           lat: 56.1327, lng: 27.0045, hint: "Katoļu svētvieta Latgalē",                  category: "poi", image: null },
  { name: "Ķemeru nacionālais parks",   lat: 56.9167, lng: 23.4833, hint: "Purvi un sēravoti",                         category: "poi", image: "/images/places/kemeri-national-park.JPG" },
  { name: "Slīteres nacionālais parks", lat: 57.6333, lng: 22.2833, hint: "Dabas parks Ziemeļkurzemē",                 category: "poi", image: "/images/places/slitere-national-park.jpg" },
  { name: "Engures ezers",              lat: 57.1833, lng: 23.1333, hint: "Lielākais piekrastes ezers",                category: "poi", image: "/images/places/engure-lake.jpg" },
  { name: "Rāznas ezers",               lat: 56.3167, lng: 27.4500, hint: "Latgales lielākais ezers",                  category: "poi", image: null },
  { name: "Brīvības piemineklis",       lat: 56.9514, lng: 24.1132, hint: "Milda — Rīgas simbols",                     category: "poi", image: "/images/places/freedom-monument.jpg" },
  { name: "Liepājas karostas cietums",  lat: 56.5556, lng: 20.9833, hint: "Vēsturisks militārs cietums",               category: "poi", image: null },
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

- [ ] **Step 2: Run the seed script**

```bash
node --env-file=.env.local scripts/seed.mjs
```

Expected output:
```
Seeded 41 places successfully.
```

- [ ] **Step 3: Verify in Supabase**

Supabase → Table Editor → `places` → confirm 41 rows exist.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed.mjs
git commit -m "feat: add Supabase seed script for places"
```

---

## Task 5: Update `lib/places.ts` and delete `lib/place-images.ts`

**Files:**
- Modify: `lib/places.ts`
- Delete: `lib/place-images.ts`

- [ ] **Step 1: Replace `lib/places.ts` with this content**

Remove the hardcoded data and the `place-images` import. Update `getPlacesForDifficulty` to accept the places array as its first argument (since there is no longer a module-level `PLACES` constant).

```typescript
export type Category = "city" | "town" | "poi";
export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface Place {
  name: string;
  lat: number;
  lng: number;
  hint: string;
  category: Category;
  image?: string | null;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string;
  description: string;
  emoji: string;
  filter: (p: Place) => boolean;
}> = {
  easy:   { label: "Viegli",   emoji: "🟢", description: "Tikai lielās pilsētas",       filter: p => p.category === "city" },
  medium: { label: "Vidēji",   emoji: "🟡", description: "Pilsētas un mazpilsētas",      filter: p => p.category === "city" || p.category === "town" },
  hard:   { label: "Grūti",    emoji: "🔴", description: "Visas vietas",                filter: () => true },
  expert: { label: "Eksperts", emoji: "⚫", description: "Atpazīsti pēc foto!",         filter: p => p.category === "poi" && !!p.image },
};

export function getPlacesForDifficulty(places: Place[], difficulty: Difficulty, count: number): Place[] {
  const pool = places.filter(DIFFICULTY_CONFIG[difficulty].filter);
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

- [ ] **Step 2: Delete `lib/place-images.ts`**

```bash
rm lib/place-images.ts
```

- [ ] **Step 3: Commit**

```bash
git add lib/places.ts lib/place-images.ts
git commit -m "refactor: remove hardcoded places data, update getPlacesForDifficulty signature"
```

---

## Task 6: Create `components/GameClient.tsx`

**Files:**
- Create: `components/GameClient.tsx`

This is the current `app/page.tsx` game logic, extracted into a `"use client"` component. It accepts `places: Place[]` as a prop and calls `getPlacesForDifficulty(places, diff, ROUNDS)`.

- [ ] **Step 1: Create the file**

```typescript
"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import {
  Place,
  Difficulty,
  DIFFICULTY_CONFIG,
  getPlacesForDifficulty,
  calculateDistance,
  calculatePoints,
} from "@/lib/places";
import DifficultySelect from "@/components/DifficultySelect";
import ResultCard from "@/components/ResultCard";
import GameOver from "@/components/GameOver";
import FloatingImagePanel from "@/components/FloatingImagePanel";

const GameMap = dynamic(() => import("@/components/GameMap"), { ssr: false });

const ROUNDS = 10;

interface Props {
  places: Place[];
}

export default function GameClient({ places }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
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

  const handleStart = (diff: Difficulty) => {
    setGamePlaces(getPlacesForDifficulty(places, diff, ROUNDS));
    setDifficulty(diff);
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
    setDifficulty(null);
    setGamePlaces([]);
    setRound(0);
    setScore(0);
    setGuessLatLng(null);
    setActualLatLng(null);
    setShowResult(false);
    setShowGameOver(false);
  };

  if (!difficulty) {
    return <DifficultySelect onSelect={handleStart} />;
  }

  const currentPlace = gamePlaces[round] ?? null;
  const totalRounds = gamePlaces.length;
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const isExpert = difficulty === "expert";

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-red-400 tracking-tight">🇱🇻 Latvijas Karte</h1>
          <span className="text-sm text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">
            {cfg.emoji} {cfg.label}
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

      {!isExpert && (
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

        {isExpert && currentPlace?.image && (
          <FloatingImagePanel key={currentPlace.name} imageUrl={currentPlace.image} />
        )}

        <ResultCard
          visible={showResult}
          distance={distance}
          points={points}
          placeName={isExpert ? (currentPlace?.name ?? "") : undefined}
          isLastRound={round === totalRounds - 1}
          onNext={handleNext}
        />
        <GameOver visible={showGameOver} score={score} difficulty={difficulty} onRestart={handleRestart} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/GameClient.tsx
git commit -m "feat: extract GameClient as client component accepting places prop"
```

---

## Task 7: Update `app/page.tsx` to Server Component

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with this content**

```typescript
import { supabase } from "@/lib/supabase";
import { Place } from "@/lib/places";
import GameClient from "@/components/GameClient";

export default async function Home() {
  const { data, error } = await supabase.from("places").select("*");

  if (error || !data) {
    throw new Error(`Failed to load places: ${error?.message ?? "no data"}`);
  }

  return <GameClient places={data as Place[]} />;
}
```

Note: no `"use client"` directive — this is a Server Component by default in Next.js App Router.

- [ ] **Step 2: Start the dev server and verify**

```bash
npm run dev
```

Open `http://localhost:3000`. The game should load, all 4 difficulty modes should work, and expert mode should show images.

- [ ] **Step 3: Check the terminal for errors**

Expected: no errors. If you see `Failed to load places`, verify:
1. `.env.local` has `SUPABASE_URL` and `SUPABASE_KEY` set correctly
2. The `places` table has the RLS policy from Task 2
3. The seed ran successfully (41 rows in the table)

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: fetch places from Supabase in server component"
```

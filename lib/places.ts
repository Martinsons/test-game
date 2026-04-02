import { PLACE_IMAGES } from "./place-images";

export type Category = "city" | "town" | "poi";
export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface Place {
  name: string;
  lat: number;
  lng: number;
  hint: string;
  category: Category;
  image?: string; // local path to downloaded image
}

const RAW_PLACES = [
  // Major cities
  { name: "Rīga",          lat: 56.9496, lng: 24.1052, hint: "Galvaspilsēta",             category: "city" as Category },
  { name: "Daugavpils",    lat: 55.8749, lng: 26.5356, hint: "Otrā lielākā pilsēta",       category: "city" as Category },
  { name: "Liepāja",       lat: 56.5047, lng: 21.0107, hint: "Pilsēta, kur pūš vējš",     category: "city" as Category },
  { name: "Jelgava",       lat: 56.6511, lng: 23.7134, hint: "Zemgales galvaspilsēta",     category: "city" as Category },
  { name: "Jūrmala",       lat: 56.9680, lng: 23.7704, hint: "Kūrortpilsēta",              category: "city" as Category },
  { name: "Ventspils",     lat: 57.3942, lng: 21.5647, hint: "Ostas pilsēta",              category: "city" as Category },
  { name: "Rēzekne",       lat: 56.5099, lng: 27.3340, hint: "Latgales sirds",             category: "city" as Category },
  { name: "Valmiera",      lat: 57.5384, lng: 25.4263, hint: "Pilsēta pie Gaujas",         category: "city" as Category },
  { name: "Jēkabpils",     lat: 56.4995, lng: 25.8606, hint: "Pilsēta pie Daugavas",       category: "city" as Category },
  { name: "Ogre",          lat: 56.8166, lng: 24.6047, hint: "Pilsēta netālu no Rīgas",    category: "city" as Category },
  // Towns
  { name: "Cēsis",         lat: 57.3119, lng: 25.2748, hint: "Viduslaiku pilsēta",         category: "town" as Category },
  { name: "Kuldīga",       lat: 56.9677, lng: 21.9681, hint: "Ventas rumba",               category: "town" as Category },
  { name: "Sigulda",       lat: 57.1514, lng: 24.8514, hint: "Latvijas Šveice",            category: "town" as Category },
  { name: "Tukums",        lat: 56.9668, lng: 23.1526, hint: "Pilsēta Zemgalē",            category: "town" as Category },
  { name: "Talsi",         lat: 57.2455, lng: 22.5815, hint: "Deviņu pakalnu pilsēta",     category: "town" as Category },
  { name: "Bauska",        lat: 56.4079, lng: 24.1944, hint: "Pilsēta pie Lielupes sākuma",category: "town" as Category },
  { name: "Dobele",        lat: 56.6254, lng: 23.2793, hint: "Ceriņu pilsēta",             category: "town" as Category },
  { name: "Saldus",        lat: 56.6636, lng: 22.4888, hint: "Pilsēta Kurzemē",            category: "town" as Category },
  { name: "Krāslava",      lat: 55.8951, lng: 27.1681, hint: "Pilsēta pie Daugavas Latgalē", category: "town" as Category },
  { name: "Ludza",         lat: 56.5467, lng: 27.7192, hint: "Viena no vecākajām pilsētām",category: "town" as Category },
  { name: "Madona",        lat: 56.8538, lng: 26.2173, hint: "Vidzemes augstienes pilsēta",category: "town" as Category },
  { name: "Gulbene",       lat: 57.1749, lng: 26.7527, hint: "Bānītis",                    category: "town" as Category },
  { name: "Balvi",         lat: 57.1314, lng: 27.2658, hint: "Pilsēta Ziemeļlatgalē",      category: "town" as Category },
  { name: "Alūksne",       lat: 57.4225, lng: 27.0484, hint: "Ezera pilsēta Vidzemē",      category: "town" as Category },
  { name: "Limbaži",       lat: 57.5136, lng: 24.7135, hint: "Pilsēta Vidzemē",            category: "town" as Category },
  { name: "Smiltene",      lat: 57.4242, lng: 25.9014, hint: "Pilsēta Vidzemē",            category: "town" as Category },
  { name: "Preiļi",        lat: 56.2942, lng: 26.7246, hint: "Pilsēta Latgalē",            category: "town" as Category },
  { name: "Līvāni",        lat: 56.3540, lng: 26.1756, hint: "Stikla pilsēta",             category: "town" as Category },
  { name: "Aizkraukle",    lat: 56.6048, lng: 25.2551, hint: "Pilsēta pie Daugavas",       category: "town" as Category },
  { name: "Aizpute",       lat: 56.7180, lng: 21.6013, hint: "Pilsēta Kurzemē",            category: "town" as Category },
  // Points of interest
  { name: "Gaizņkalns",                 lat: 57.0847, lng: 25.9667, hint: "Augstākais kalns Latvijā (312 m)",          category: "poi" as Category },
  { name: "Kolkas rags",                lat: 57.7559, lng: 22.5934, hint: "Kur satiekas Baltijas jūra un Rīgas līcis", category: "poi" as Category },
  { name: "Rundāles pils",              lat: 56.4133, lng: 24.0241, hint: "Baroka stila pils",                         category: "poi" as Category },
  { name: "Turaidas pils",              lat: 57.1849, lng: 24.8478, hint: "Sarkanā pils Siguldas tuvumā",              category: "poi" as Category },
  { name: "Aglonas bazilika",           lat: 56.1327, lng: 27.0045, hint: "Katoļu svētvieta Latgalē",                  category: "poi" as Category },
  { name: "Ķemeru nacionālais parks",   lat: 56.9167, lng: 23.4833, hint: "Purvi un sēravoti",                         category: "poi" as Category },
  { name: "Slīteres nacionālais parks", lat: 57.6333, lng: 22.2833, hint: "Dabas parks Ziemeļkurzemē",                 category: "poi" as Category },
  { name: "Engures ezers",              lat: 57.1833, lng: 23.1333, hint: "Lielākais piekrastes ezers",                category: "poi" as Category },
  { name: "Rāznas ezers",               lat: 56.3167, lng: 27.4500, hint: "Latgales lielākais ezers",                  category: "poi" as Category },
  { name: "Brīvības piemineklis",       lat: 56.9514, lng: 24.1132, hint: "Milda — Rīgas simbols",                     category: "poi" as Category },
  { name: "Liepājas karostas cietums",  lat: 56.5556, lng: 20.9833, hint: "Vēsturisks militārs cietums",               category: "poi" as Category },
];

// Attach downloaded images from place-images.ts
export const PLACES: Place[] = RAW_PLACES.map((p) => ({
  ...p,
  image: PLACE_IMAGES[p.name],
}));

export const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string;
  description: string;
  emoji: string;
  filter: (p: Place) => boolean;
}> = {
  easy:   { label: "Viegli",   emoji: "🟢", description: "Tikai lielās pilsētas", filter: p => p.category === "city" },
  medium: { label: "Vidēji",   emoji: "🟡", description: "Pilsētas un mazpilsētas", filter: p => p.category === "city" || p.category === "town" },
  hard:   { label: "Grūti",    emoji: "🔴", description: "Visas vietas", filter: () => true },
  expert: { label: "Eksperts", emoji: "⚫", description: "Atpazīsti pēc foto!", filter: p => p.category === "poi" && !!p.image },
};

export function getPlacesForDifficulty(difficulty: Difficulty, count: number): Place[] {
  const pool = PLACES.filter(DIFFICULTY_CONFIG[difficulty].filter);
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

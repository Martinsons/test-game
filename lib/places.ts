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

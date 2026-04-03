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

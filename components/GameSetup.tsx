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

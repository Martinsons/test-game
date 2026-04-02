"use client";

import { Difficulty, DIFFICULTY_CONFIG, PLACES } from "@/lib/places";

interface Props {
  onSelect: (difficulty: Difficulty) => void;
}

const ORDER: Difficulty[] = ["easy", "medium", "hard", "expert"];

export default function DifficultySelect({ onSelect }: Props) {
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white items-center justify-center px-4">
      <h1 className="text-4xl font-black text-red-400 mb-2">🇱🇻 Latvijas Karte</h1>
      <p className="text-gray-400 mb-10 text-lg">Izvēlies grūtības pakāpi</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        {ORDER.map((diff) => {
          const cfg = DIFFICULTY_CONFIG[diff];
          const count = PLACES.filter(cfg.filter).length;
          return (
            <button
              key={diff}
              onClick={() => onSelect(diff)}
              className="bg-gray-900 hover:bg-gray-800 active:scale-95 border border-gray-700 hover:border-gray-500 transition-all rounded-2xl p-6 text-left group"
            >
              <div className="text-3xl mb-2">{cfg.emoji}</div>
              <div className="text-xl font-bold text-white mb-1">{cfg.label}</div>
              <div className="text-gray-400 text-sm mb-3">{cfg.description}</div>
              <div className="text-gray-600 text-xs">{count} vietas</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

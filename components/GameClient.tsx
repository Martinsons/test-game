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
          totalRounds={totalRounds}
          modeLabel={modeLabel}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
}

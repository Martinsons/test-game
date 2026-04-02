"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getRating } from "@/lib/places";

interface Props {
  visible: boolean;
  distance: number;
  points: number;
  isLastRound: boolean;
  onNext: () => void;
  placeName?: string; // shown in expert mode after reveal
}

export default function ResultCard({ visible, distance, points, isLastRound, onNext, placeName }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2000 }}
        >
          <div className="pointer-events-auto bg-gray-900/95 border border-gray-700 rounded-2xl px-12 py-8 text-center shadow-2xl min-w-[300px]">
            <div className="text-2xl font-bold text-white mb-1">{getRating(points)}</div>
            {placeName && (
              <div className="text-red-400 font-bold text-lg mb-1">{placeName}</div>
            )}
            <div className="text-gray-400 text-sm mb-4">
              Attālums: <span className="text-white font-semibold">{distance.toFixed(1)} km</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 15 }}
              className="text-5xl font-black text-red-400 mb-6"
            >
              +{points}
            </motion.div>
            <button
              onClick={onNext}
              className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-semibold px-8 py-3 rounded-xl text-base"
            >
              {isLastRound ? "Redzēt rezultātu" : "Nākamais →"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

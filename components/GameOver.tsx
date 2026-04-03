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

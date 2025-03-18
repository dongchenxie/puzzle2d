'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GameControlsProps {
  onReset: () => void;
  onNextLevel?: () => void;
  onPrevLevel?: () => void;
  isComplete: boolean;
  hasNextLevel: boolean;
  hasPrevLevel: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onReset,
  onNextLevel,
  onPrevLevel,
  isComplete,
  hasNextLevel,
  hasPrevLevel,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4 mb-8">
      <motion.button
        className="px-4 py-2 bg-pink-500 text-white rounded-full shadow-md hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
        onClick={onReset}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Reset Level
      </motion.button>

      {hasPrevLevel && onPrevLevel && (
        <motion.button
          className="px-4 py-2 bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={onPrevLevel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Previous Level
        </motion.button>
      )}

      {isComplete && hasNextLevel && onNextLevel && (
        <motion.button
          className="px-4 py-2 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={onNextLevel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          Next Level
        </motion.button>
      )}

      {isComplete && !hasNextLevel && (
        <motion.div
          className="px-6 py-3 bg-yellow-400 text-yellow-800 rounded-full shadow-md font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          🎉 You completed all levels! 🎉
        </motion.div>
      )}
    </div>
  );
};

export default GameControls; 
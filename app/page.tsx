'use client';

import { useEffect, useState } from 'react';
import Game from './components/Game';
import { motion } from 'framer-motion';

export default function Home() {
  const [availableLevels, setAvailableLevels] = useState<string[]>([
    'level1', 'level2', 'level3', 'level4', 'level5'
  ]);
  const [selectedLevel, setSelectedLevel] = useState('level1');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time to allow assets to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel(event.target.value);
  };

  const levelSizes: Record<string, string> = {
    'level1': '5×5',
    'level2': '5×5',
    'level3': '10×10',
    'level4': '15×15',
    'level5': '20×20',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="text-3xl font-bold text-pink-500"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: [0, 10, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5 
          }}
        >
          Loading Sweet Puzzles...
        </motion.div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-8 px-4">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-pink-600 mb-2 drop-shadow-sm">
          Puzzle2D
        </h1>
        <p className="text-purple-600 text-lg max-w-md mx-auto">
          A sweet puzzle adventure! Drag and drop the candy pieces to complete each level.
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-md mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="bg-white rounded-lg shadow-md p-4 inline-block">
          <label htmlFor="level-select" className="block text-gray-700 mb-2 font-medium">
            Choose a puzzle size:
          </label>
          <div className="flex items-center justify-center">
            <select
              id="level-select"
              value={selectedLevel}
              onChange={handleLevelChange}
              className="block w-full max-w-xs px-4 py-2 text-purple-700 bg-white border border-pink-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {availableLevels.map((levelId) => (
                <option key={levelId} value={levelId}>
                  {levelId.replace('level', 'Level ')} - {levelSizes[levelId]} board
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="w-full"
        key={selectedLevel} // This makes the component re-render when the level changes
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Game 
          initialLevelId={selectedLevel} 
          availableLevels={availableLevels} 
        />
      </motion.div>

      <motion.footer
        className="mt-12 text-center text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p>
          Drag pieces onto the board. Use the buttons on pieces to rotate and flip.
          <br />
          Pieces will automatically snap to valid positions when dropped correctly.
          <br />
          Complete the level by placing all pieces on the board!
        </p>
      </motion.footer>
    </main>
  );
}

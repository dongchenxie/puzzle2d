'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Level, Position } from '../types';

interface PuzzleBoardProps {
  level: Level;
  onCellClick?: (position: Position) => void;
}

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ level, onCellClick }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(60);
  const [boardWidth, setBoardWidth] = useState(0);
  const [boardHeight, setBoardHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (boardRef.current) {
        const width = level.grid[0].length;
        const height = level.grid.length;
        
        // Calculate the max size that fits the screen
        const maxWidth = Math.min(window.innerWidth * 0.9, 800); // Increased from 500 to 800 for larger boards
        const maxCellSize = Math.floor(maxWidth / width);
        const adjustedCellSize = Math.min(maxCellSize, 60); // Cap at 60px for very small boards
        
        setCellSize(adjustedCellSize);
        setBoardWidth(width * adjustedCellSize);
        setBoardHeight(height * adjustedCellSize);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [level]);

  const handleCellClick = (position: Position) => {
    if (onCellClick) {
      onCellClick(position);
    }
  };

  const getCellStyle = (cell: string) => {
    if (cell === 'X') {
      return 'bg-gray-800'; // Immovable blocker
    } else {
      return 'bg-white'; // All other cells (including '0' and numbered cells) are white
    }
  };

  return (
    <div className="flex items-center justify-center pb-6">
      <motion.div
        ref={boardRef}
        className="grid shadow-lg rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${level.grid[0].length}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${level.grid.length}, ${cellSize}px)`,
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {level.grid.map((row, y) =>
          row.map((cell, x) => (
            <motion.div
              key={`cell-${x}-${y}`}
              className={`flex items-center justify-center border border-gray-200 ${getCellStyle(cell)}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
              onClick={() => handleCellClick({ x, y })}
              whileHover={{ scale: cell === '0' ? 1.05 : 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.01 * (x + y) }}
            >
              {cell === 'X' && (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default PuzzleBoard; 
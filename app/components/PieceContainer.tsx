'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PuzzlePiece as PuzzlePieceType } from '../types';
import PuzzlePiece from './PuzzlePiece';

interface PieceContainerProps {
  pieces: PuzzlePieceType[];
  cellSize: number;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, position: { x: number; y: number }) => void;
  onRotate: (id: string) => void;
  onFlip: (id: string) => void;
  activePieceId: string | null;
}

const PieceContainer: React.FC<PieceContainerProps> = ({
  pieces,
  cellSize,
  onDragStart,
  onDragEnd,
  onRotate,
  onFlip,
  activePieceId,
}) => {
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Calculate the dimensions needed for the container
    const unplacedPieces = pieces.filter(p => !p.isPlaced);
    const totalWidth = Math.min(
      window.innerWidth * 0.9,
      unplacedPieces.length * cellSize * 3 + 40
    );
    const height = Math.max(cellSize * 5, 150); // Ensure minimum height for small cell sizes

    setContainerDimensions({ width: totalWidth, height });

    // Arrange the pieces in the container
    arrangeUnplacedPieces(unplacedPieces, totalWidth, height);
    
    const handleResize = () => {
      const newWidth = Math.min(
        window.innerWidth * 0.9,
        unplacedPieces.length * cellSize * 3 + 40
      );
      setContainerDimensions({ width: newWidth, height });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pieces, cellSize]);

  const arrangeUnplacedPieces = (
    unplacedPieces: PuzzlePieceType[],
    containerWidth: number,
    containerHeight: number
  ) => {
    // Simple arrangement: space pieces evenly across the container
    const spacing = unplacedPieces.length > 1 
      ? containerWidth / (unplacedPieces.length + 1)
      : containerWidth / 2;
    
    unplacedPieces.forEach((piece, index) => {
      const x = spacing * (index + 1);
      const y = containerHeight / 2;
      
      // We're only setting the initial positions here, not updating the state
      // The actual updates happen through the parent component
    });
  };

  // Filter to show only unplaced pieces
  const unplacedPieces = pieces.filter(p => !p.isPlaced);

  return (
    <motion.div
      className="relative mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mx-auto shadow-md overflow-visible border-2 border-pink-300"
      style={{
        width: `${containerDimensions.width}px`,
        height: `${containerDimensions.height}px`,
        minHeight: '150px',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 left-0 right-0 bg-pink-200 py-1 px-3 rounded-t-md text-center text-sm font-medium text-pink-800">
        Piece Container
      </div>
      {unplacedPieces.length > 0 ? (
        unplacedPieces.map((piece, index) => (
          <PuzzlePiece
            key={piece.id}
            piece={{
              ...piece,
              position: {
                x: containerDimensions.width / (unplacedPieces.length + 1) * (index + 1) - (piece.shape[0].length * cellSize) / 2,
                y: containerDimensions.height / 2 - (piece.shape.length * cellSize) / 2,
              },
            }}
            cellSize={cellSize}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onRotate={onRotate}
            onFlip={onFlip}
            isActive={activePieceId === piece.id}
          />
        ))
      ) : (
        <div className="flex h-full items-center justify-center text-pink-500 font-bold">
          All pieces placed! 🎉
        </div>
      )}
    </motion.div>
  );
};

export default PieceContainer; 
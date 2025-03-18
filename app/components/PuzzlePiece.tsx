'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PuzzlePiece as PuzzlePieceType } from '../types';

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  cellSize: number;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, position: { x: number; y: number }) => void;
  onRotate: (id: string) => void;
  onFlip: (id: string) => void;
  isActive: boolean;
}

// Transform shape based on rotation and flip
const transformPieceShape = (
  shape: boolean[][], 
  rotation: 0 | 90 | 180 | 270, 
  flipped: boolean
): boolean[][] => {
  // First create a copy of the shape to avoid modifying the original
  let result = JSON.parse(JSON.stringify(shape));
  
  // Apply flip first if needed
  if (flipped) {
    result = result.map((row: boolean[]) => [...row].reverse());
  }
  
  // Then apply rotation
  if (rotation === 0) {
    return result;
  }
  
  const rows = result.length;
  const cols = result[0].length;
  
  if (rotation === 90) {
    const rotated = Array(cols).fill(false).map(() => Array(rows).fill(false));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[x][rows - 1 - y] = result[y][x];
      }
    }
    return rotated;
  } else if (rotation === 180) {
    const rotated = Array(rows).fill(false).map(() => Array(cols).fill(false));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[rows - 1 - y][cols - 1 - x] = result[y][x];
      }
    }
    return rotated;
  } else { // rotation === 270
    const rotated = Array(cols).fill(false).map(() => Array(rows).fill(false));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[cols - 1 - x][y] = result[y][x];
      }
    }
    return rotated;
  }
};

const PuzzlePiece: React.FC<PuzzlePieceProps> = ({
  piece,
  cellSize,
  onDragStart,
  onDragEnd,
  onRotate,
  onFlip,
  isActive,
}) => {
  const pieceRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [transformedShape, setTransformedShape] = useState<boolean[][]>([]);

  useEffect(() => {
    // Calculate dimensions based on the transformed piece's shape and cell size
    const transformed = transformPieceShape(piece.shape, piece.rotation, piece.flipped);
    setTransformedShape(transformed);
    
    const width = transformed[0].length * cellSize;
    const height = transformed.length * cellSize;
    setDimensions({ width, height });
  }, [piece.shape, piece.rotation, piece.flipped, cellSize]);

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart(piece.id);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    onDragEnd(piece.id, { x: info.point.x, y: info.point.y });
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!piece.isPlaced) {
      onRotate(piece.id);
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!piece.isPlaced) {
      onFlip(piece.id);
    }
  };

  return (
    <motion.div
      ref={pieceRef}
      className={`absolute cursor-grab ${isDragging ? 'cursor-grabbing z-50' : 'z-10'} ${
        isActive ? 'ring-4 ring-blue-400' : ''
      } ${piece.isPlaced ? 'placed-piece' : ''}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
      drag={!piece.isPlaced}
      dragMomentum={false}
      dragElastic={0.1}
      dragTransition={{ 
        bounceStiffness: 600, 
        bounceDamping: 20,
        power: 0.2 // Reduced power makes drag more controllable
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: piece.position.x,
        y: piece.position.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 },
      }}
      whileHover={{ scale: piece.isPlaced ? 1 : 1.05 }}
      whileTap={{ scale: piece.isPlaced ? 1 : 1.1 }}
    >
      <div className="w-full h-full relative">
        {transformedShape.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <div
                key={`${piece.id}-cell-${x}-${y}`}
                className={`absolute rounded-sm ${piece.isPlaced ? 'placed-cell' : ''}`}
                style={{
                  width: `${cellSize - 2}px`,
                  height: `${cellSize - 2}px`,
                  left: `${x * cellSize}px`,
                  top: `${y * cellSize}px`,
                  backgroundColor: piece.color,
                  boxShadow: 'inset 0px 0px 8px rgba(255,255,255,0.5), 0px 0px 4px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.7)',
                }}
              >
                <div className="absolute inset-0 rounded-sm bg-white opacity-10"></div>
              </div>
            ) : null
          )
        )}
      </div>
      
      {!piece.isPlaced && (
        <div 
          className="absolute bottom-0 right-0 flex space-x-1 bg-white bg-opacity-80 rounded-tl-md p-1 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleRotate}
            className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors text-white"
            aria-label="Rotate piece"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 4v6h6"></path>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>
          <button
            onClick={handleFlip}
            className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors text-white"
            aria-label="Flip piece"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 2v11h10V2"></path>
              <path d="M19 2L5 22"></path>
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PuzzlePiece; 
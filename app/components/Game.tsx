'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PuzzleBoard from './PuzzleBoard';
import PieceContainer from './PieceContainer';
import GameControls from './GameControls';
import PuzzlePiece from './PuzzlePiece';
import { Level, PuzzlePiece as PuzzlePieceType, Position } from '../types';
import { loadLevel, generatePieces, checkPuzzleComplete } from '../utils/levelUtils';

interface GameProps {
  initialLevelId: string;
  availableLevels: string[];
}

const Game: React.FC<GameProps> = ({ initialLevelId, availableLevels }) => {
  const [currentLevelId, setCurrentLevelId] = useState(initialLevelId);
  const [level, setLevel] = useState<Level | null>(null);
  const [pieces, setPieces] = useState<PuzzlePieceType[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isBoardReady, setIsBoardReady] = useState(false);
  const [cellSize, setCellSize] = useState(60);
  const [activePieceId, setActivePieceId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardBounds, setBoardBounds] = useState({ top: 0, left: 0, right: 0, bottom: 0 });

  // Load the level and generate pieces
  useEffect(() => {
    const initializeLevel = async () => {
      try {
        setIsBoardReady(false);
        const loadedLevel = await loadLevel(currentLevelId);
        setLevel(loadedLevel);
        
        // Generate pieces from the level
        const generatedPieces = generatePieces(loadedLevel);
        setPieces(generatedPieces);
        
        setIsComplete(false);
        setIsBoardReady(true);

        // Reset active piece
        setActivePieceId(null);
      } catch (error) {
        console.error('Failed to initialize level:', error);
      }
    };
    
    initializeLevel();
  }, [currentLevelId]);

  // Update cell size on window resize
  useEffect(() => {
    const updateCellSize = () => {
      if (!level) return;
      
      // For larger boards, we need smaller cells
      const gridWidth = level.grid[0].length;
      const gridHeight = level.grid.length;
      
      // Scale based on board size
      let maxSize = 60; // Default max size
      if (gridWidth > 15 || gridHeight > 15) {
        maxSize = 40; // Smaller for very large boards
      } else if (gridWidth > 10 || gridHeight > 10) {
        maxSize = 50; // Medium for larger boards
      }
      
      const maxWidth = Math.min(window.innerWidth * 0.9, gridWidth * maxSize);
      const maxCellSize = Math.floor(maxWidth / gridWidth);
      
      // Ensure there's a minimum cell size for usability
      const finalCellSize = Math.max(Math.min(maxCellSize, maxSize), 20);
      setCellSize(finalCellSize);
    };
    
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    
    return () => window.removeEventListener('resize', updateCellSize);
  }, [level]);

  // Keep track of board bounds for drag and drop
  useEffect(() => {
    const updateBoardBounds = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardBounds({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom
        });
      }
    };
    
    updateBoardBounds();
    window.addEventListener('resize', updateBoardBounds);
    window.addEventListener('scroll', updateBoardBounds);
    
    return () => {
      window.removeEventListener('resize', updateBoardBounds);
      window.removeEventListener('scroll', updateBoardBounds);
    };
  }, [boardRef.current, isBoardReady, level]);

  // Check if puzzle is complete when pieces change
  useEffect(() => {
    if (level && pieces.length > 0) {
      const allPlaced = pieces.every(piece => piece.isPlaced);
      
      if (allPlaced && !isComplete) {
        console.log('All pieces are placed! Win detected.');
        setIsComplete(true);
        
        // Play a celebration effect
        setTimeout(() => {
          const celebrationElement = document.getElementById('celebration');
          if (celebrationElement) {
            celebrationElement.classList.remove('hidden');
            setTimeout(() => {
              if (celebrationElement) {
                celebrationElement.classList.add('hidden');
              }
            }, 3000);
          }
        }, 500);
      }
    }
  }, [pieces, level, isComplete]);

  const handleDragStart = (id: string) => {
    setActivePieceId(id);
  };

  const handleDragEnd = (id: string, position: { x: number; y: number }) => {
    const updatedPieces = [...pieces];
    const pieceIndex = updatedPieces.findIndex(p => p.id === id);
    
    if (pieceIndex === -1) return;
    
    const piece = updatedPieces[pieceIndex];
    
    // Get transformed shape for the piece
    const transformedShape = transformPieceShape(piece.shape, piece.rotation, piece.flipped);
    const pieceWidth = transformedShape[0].length * cellSize;
    const pieceHeight = transformedShape.length * cellSize;
    
    // Check if the piece is over the board
    // We're using the top-left corner of the piece for more precise positioning
    if (
      position.x >= boardBounds.left && 
      position.x + pieceWidth <= boardBounds.right &&
      position.y >= boardBounds.top && 
      position.y + pieceHeight <= boardBounds.bottom
    ) {
      // Convert to board coordinates (from the top-left of the piece)
      const boardX = position.x - boardBounds.left;
      const boardY = position.y - boardBounds.top;
      
      // Calculate the grid cell the top-left corner of the piece is closest to
      // Using floor to get the cell the piece is starting in
      const gridX = Math.floor(boardX / cellSize);
      const gridY = Math.floor(boardY / cellSize);
      
      // The percentage of how far into the current cell the piece is
      // This helps determine if we should snap to the current cell or the next one
      const xRemainder = (boardX % cellSize) / cellSize;
      const yRemainder = (boardY % cellSize) / cellSize;
      
      // Adjust the grid position based on how far into the cell we are
      // This creates a more natural "magnetic" snapping effect
      const adjustedGridX = xRemainder > 0.5 ? gridX + 1 : gridX;
      const adjustedGridY = yRemainder > 0.5 ? gridY + 1 : gridY;
      
      console.log(`Snapping attempt: piece at position (${position.x}, ${position.y})`);
      console.log(`Grid coords: (${adjustedGridX}, ${adjustedGridY})`);
      
      // Try positions in a spiral pattern around the drop point for better user experience
      const offsets = [
        {x: 0, y: 0},   // Start with exact position
        {x: -1, y: 0},  // Left
        {x: 1, y: 0},   // Right
        {x: 0, y: -1},  // Up
        {x: 0, y: 1},   // Down
        {x: -1, y: -1}, // Diagonal: Up-Left
        {x: 1, y: -1},  // Diagonal: Up-Right
        {x: -1, y: 1},  // Diagonal: Down-Left
        {x: 1, y: 1},   // Diagonal: Down-Right
        {x: -2, y: 0},  // Further Left
        {x: 2, y: 0},   // Further Right
        {x: 0, y: -2},  // Further Up
        {x: 0, y: 2},   // Further Down
      ];
      
      let placementFound = false;
      
      for (const offset of offsets) {
        // The position to try
        const testPosition = {
          x: adjustedGridX + offset.x,
          y: adjustedGridY + offset.y
        };
        
        // Check if the piece can be placed here
        if (level && canPlacePiece(piece, testPosition)) {
          // Set the piece as placed and update position with precise grid alignment
          updatedPieces[pieceIndex] = {
            ...piece,
            isPlaced: true,
            position: {
              x: boardBounds.left + testPosition.x * cellSize,
              y: boardBounds.top + testPosition.y * cellSize,
            },
          };
          
          console.log(`Piece snapped successfully to grid position (${testPosition.x}, ${testPosition.y})`);
          
          setPieces(updatedPieces);
          placementFound = true;
          
          // Check for win condition
          const allPlaced = updatedPieces.every(p => p.isPlaced);
          if (allPlaced) {
            console.log("All pieces placed! Marking level as complete.");
            setIsComplete(true);
          }
          
          break;
        }
      }
      
      if (!placementFound) {
        // If can't be placed on the board, return to container
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const pieceIndex = updatedPieces.findIndex(p => p.id === id);
          
          // Calculate a random position within the container
          const containerWidth = containerRect.width - pieceWidth;
          const containerHeight = containerRect.height - pieceHeight;
          const containerX = containerRect.left + Math.random() * containerWidth / 2;
          const containerY = containerRect.top + Math.random() * containerHeight / 2;
          
          updatedPieces[pieceIndex] = {
            ...piece,
            isPlaced: false,
            position: { x: containerX, y: containerY },
          };
          
          setPieces(updatedPieces);
        }
      }
    } else {
      // Not dropped on board, return to container
      if (piece.isPlaced) {
        // If it was already placed, remove the placement
        updatedPieces[pieceIndex] = {
          ...piece,
          isPlaced: false,
        };
      }
      
      // Position in container
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate a random position within the container
        const containerWidth = containerRect.width - pieceWidth;
        const containerHeight = containerRect.height - pieceHeight;
        const containerX = containerRect.left + Math.random() * containerWidth / 2;
        const containerY = containerRect.top + Math.random() * containerHeight / 2;
        
        updatedPieces[pieceIndex] = {
          ...piece,
          isPlaced: false,
          position: { x: containerX, y: containerY },
        };
      }
      
      setPieces(updatedPieces);
    }
  };

  const canPlacePiece = (piece: PuzzlePieceType, position: Position): boolean => {
    if (!level) return false;
    
    const grid = level.grid;
    const transformedShape = transformPieceShape(piece.shape, piece.rotation, piece.flipped);
    
    // Debug information
    const shapeWidth = transformedShape[0].length;
    const shapeHeight = transformedShape.length;
    
    // Check if the piece even fits within the grid boundaries at all
    if (
      position.x < 0 || 
      position.y < 0 || 
      position.x + shapeWidth > grid[0].length ||
      position.y + shapeHeight > grid.length
    ) {
      // console.log(`Piece won't fit at (${position.x}, ${position.y}) - outside grid bounds`);
      return false;
    }
    
    // Check if all cells of the piece can be placed on empty cells
    for (let y = 0; y < transformedShape.length; y++) {
      for (let x = 0; x < transformedShape[0].length; x++) {
        // Skip empty cells in the piece shape
        if (!transformedShape[y][x]) continue;
        
        const gridY = position.y + y;
        const gridX = position.x + x;
        
        // Extra safety check (should be redundant after the boundary check above)
        if (
          gridY < 0 || gridY >= grid.length ||
          gridX < 0 || gridX >= grid[0].length
        ) {
          // console.log(`Cell at relative (${x}, ${y}) is out of bounds at grid (${gridX}, ${gridY})`);
          return false;
        }
        
        // Check if the grid cell is empty ('0')
        if (grid[gridY][gridX] !== '0') {
          // console.log(`Cell at grid (${gridX}, ${gridY}) is not empty: ${grid[gridY][gridX]}`);
          return false;
        }
      }
    }
    
    // All cells can be placed - this is a valid position
    // console.log(`Piece can be placed at (${position.x}, ${position.y})`);
    return true;
  };

  // Helper function to transform piece shape based on rotation and flip
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

  const handleRotate = (id: string) => {
    const updatedPieces = [...pieces];
    const pieceIndex = updatedPieces.findIndex(p => p.id === id);
    
    if (pieceIndex === -1) return;
    
    // Rotate the piece 90 degrees clockwise
    const piece = updatedPieces[pieceIndex];
    const newRotation = ((piece.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    
    updatedPieces[pieceIndex] = {
      ...piece,
      rotation: newRotation,
    };
    
    setPieces(updatedPieces);
  };

  const handleFlip = (id: string) => {
    const updatedPieces = [...pieces];
    const pieceIndex = updatedPieces.findIndex(p => p.id === id);
    
    if (pieceIndex === -1) return;
    
    // Flip the piece horizontally
    const piece = updatedPieces[pieceIndex];
    
    updatedPieces[pieceIndex] = {
      ...piece,
      flipped: !piece.flipped,
    };
    
    setPieces(updatedPieces);
  };

  const handleReset = () => {
    // Reset all pieces to their unplaced state but keep the same shapes
    if (level && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const resetPieces = [...pieces].map(piece => {
        return {
          ...piece,
          isPlaced: false,
          // Keep the same rotation and flip for now
          rotation: piece.rotation,
          flipped: piece.flipped
        };
      });
      
      // Calculate the available width and height in the container
      const containerWidth = containerRect.width;
      const containerHeight = 150; // Fixed height for the container
      
      // Position pieces in a grid formation in the container
      const pieceMargin = 10;
      let rowX = pieceMargin;
      let rowY = pieceMargin;
      let maxHeightInRow = 0;
      
      resetPieces.forEach((piece, i) => {
        // Get the transformed shape to calculate correct dimensions
        const transformedShape = transformPieceShape(piece.shape, piece.rotation, piece.flipped);
        const pieceWidth = transformedShape[0].length * cellSize + pieceMargin;
        const pieceHeight = transformedShape.length * cellSize + pieceMargin;
        
        // Check if we need to move to the next row
        if (rowX + pieceWidth > containerWidth - pieceMargin) {
          rowX = pieceMargin;
          rowY += maxHeightInRow + pieceMargin;
          maxHeightInRow = 0;
        }
        
        // Set the piece position within the container
        piece.position = {
          x: containerRect.left + rowX,
          y: containerRect.top + 20 + rowY // Add padding for the container header
        };
        
        // Update row tracking
        rowX += pieceWidth;
        maxHeightInRow = Math.max(maxHeightInRow, pieceHeight);
      });
      
      setPieces(resetPieces);
      setIsComplete(false);
    }
  };

  const handleNextLevel = () => {
    if (isComplete) {
      const currentIndex = availableLevels.indexOf(currentLevelId);
      if (currentIndex < availableLevels.length - 1) {
        setCurrentLevelId(availableLevels[currentIndex + 1]);
      }
    }
  };

  const handlePrevLevel = () => {
    const currentIndex = availableLevels.indexOf(currentLevelId);
    if (currentIndex > 0) {
      setCurrentLevelId(availableLevels[currentIndex - 1]);
    }
  };

  if (!level || !isBoardReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-pink-500 text-lg animate-pulse">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-purple-600">{level.name}</h2>
        <p className="text-gray-600">{level.description}</p>
        <p className="text-sm text-gray-500 mt-1">Grid size: {level.grid[0].length}x{level.grid.length}</p>
      </div>
      
      <div 
        ref={boardRef} 
        className="relative mx-auto"
      >
        <PuzzleBoard level={level} />
        
        {/* Placed pieces go here, on top of the board */}
        {pieces
          .filter(piece => piece.isPlaced)
          .map(piece => (
            <PuzzlePiece
              key={piece.id}
              piece={piece}
              cellSize={cellSize}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onRotate={handleRotate}
              onFlip={handleFlip}
              isActive={activePieceId === piece.id}
            />
          ))
        }
      </div>
      
      <div ref={containerRef}>
        <PieceContainer
          pieces={pieces}
          cellSize={cellSize}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onRotate={handleRotate}
          onFlip={handleFlip}
          activePieceId={activePieceId}
        />
      </div>
      
      <GameControls
        onReset={handleReset}
        onNextLevel={handleNextLevel}
        onPrevLevel={handlePrevLevel}
        isComplete={isComplete}
        hasNextLevel={availableLevels.indexOf(currentLevelId) < availableLevels.length - 1}
        hasPrevLevel={availableLevels.indexOf(currentLevelId) > 0}
      />
      
      {/* Celebration effect - initially hidden */}
      <div 
        id="celebration" 
        className={`fixed inset-0 flex items-center justify-center pointer-events-none z-50 ${isComplete ? '' : 'hidden'}`}
      >
        <motion.div 
          className="bg-yellow-400 text-yellow-800 rounded-full px-8 py-4 text-2xl font-bold shadow-lg"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 10 
          }}
        >
          Level Complete! 🎉
        </motion.div>
        
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={`confetti-${i}`}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: [
                  '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', 
                  '#C7CEEA', '#F8C8DC', '#FDFD96', '#B4F8C8'
                ][i % 9],
                top: '-20px',
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['0vh', '100vh'],
                x: [0, Math.random() * 100 - 50],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                ease: 'easeOut',
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game; 
// Types for the puzzle game

// Cell types in the puzzle grid
export type CellType = 'X' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

// Represents a puzzle level
export interface Level {
  id: string;
  name: string;
  grid: CellType[][];
  description?: string;
}

// Represents a puzzle piece
export interface PuzzlePiece {
  id: string;
  type: string; // Numeric value as string (e.g., '1', '2', etc.)
  position: { x: number; y: number };
  shape: boolean[][]; // 2D array representing the shape (true = filled, false = empty)
  rotation: 0 | 90 | 180 | 270; // Rotation in degrees
  flipped: boolean;
  color: string; // CSS color
  isPlaced: boolean;
}

// Game state
export interface GameState {
  currentLevel: Level;
  pieces: PuzzlePiece[];
  isComplete: boolean;
  isBoardReady: boolean;
}

// Position type
export interface Position {
  x: number;
  y: number;
} 
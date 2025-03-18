import { Level, PuzzlePiece, CellType } from '../types';

// Function to load a level
export const loadLevel = async (levelId: string): Promise<Level> => {
  try {
    const level = await import(`../levels/${levelId}.json`);
    return level as Level;
  } catch (error) {
    console.error('Failed to load level:', error);
    throw new Error('Failed to load level');
  }
};

// Generate puzzle pieces from a level grid
export const generatePieces = (level: Level): PuzzlePiece[] => {
  const pieces: PuzzlePiece[] = [];
  const grid = level.grid;
  const pieceTypes = new Set<string>();
  
  // First, identify all piece types in the grid
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      if (cell !== 'X' && cell !== '0') {
        pieceTypes.add(cell);
      }
    }
  }
  
  // Then, for each piece type, create a shape representation
  pieceTypes.forEach((type) => {
    // Create a map to track which cells have been visited
    const visited: boolean[][] = Array(grid.length)
      .fill(false)
      .map(() => Array(grid[0].length).fill(false));
    
    // Find shapes for each piece type
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === type && !visited[y][x]) {
          // Found a new piece of this type
          const shape: { x: number; y: number }[] = [];
          const queue = [{ x, y }];
          
          // Use BFS to find connected cells of the same type
          while (queue.length > 0) {
            const cell = queue.shift()!;
            if (
              cell.y < 0 || cell.y >= grid.length ||
              cell.x < 0 || cell.x >= grid[cell.y].length ||
              visited[cell.y][cell.x] ||
              grid[cell.y][cell.x] !== type
            ) {
              continue;
            }
            
            visited[cell.y][cell.x] = true;
            shape.push({ x: cell.x, y: cell.y });
            
            // Add adjacent cells to the queue
            queue.push({ x: cell.x + 1, y: cell.y });
            queue.push({ x: cell.x - 1, y: cell.y });
            queue.push({ x: cell.x, y: cell.y + 1 });
            queue.push({ x: cell.x, y: cell.y - 1 });
          }
          
          if (shape.length > 0) {
            // Normalize the shape to start at 0,0
            const minX = Math.min(...shape.map(cell => cell.x));
            const minY = Math.min(...shape.map(cell => cell.y));
            
            // Create a 2D boolean array representation of the shape
            const maxX = Math.max(...shape.map(cell => cell.x)) - minX;
            const maxY = Math.max(...shape.map(cell => cell.y)) - minY;
            
            const shapeArray = Array(maxY + 1)
              .fill(false)
              .map(() => Array(maxX + 1).fill(false));
            
            shape.forEach(cell => {
              shapeArray[cell.y - minY][cell.x - minX] = true;
            });
            
            // Generate a vibrant color based on the piece type but different from board
            const colors = [
              '#FF9AA2', // Light pink
              '#FFB7B2', // Light salmon
              '#FFDAC1', // Light peach
              '#E2F0CB', // Light lime
              '#B5EAD7', // Light mint
              '#C7CEEA', // Light blue
              '#F8C8DC', // Pastel pink
              '#FDFD96', // Pastel yellow
              '#B4F8C8', // Pastel green
              '#BCD4E6', // Pastel blue
              '#C3B1E1', // Lavender
              '#CCCCFF', // Periwinkle
              '#FFD1DC', // Pink
              '#FFC8A2', // Peach
              '#D4F0F0', // Light Teal
              '#FFFFD8', // Light Yellow
              '#FFE4E1', // Misty Rose
              '#E6E6FA'  // Lavender
            ];
            
            // Generate a deterministic but seemingly random index based on the type
            // This ensures the same piece type always gets the same color
            const hash = type.split('').reduce((acc, char) => {
              return acc + char.charCodeAt(0);
            }, 0);
            const colorIndex = hash % colors.length;
            
            // Random rotation and flip for initial state
            const initialRotations = [0, 90, 180, 270] as const;
            const randomRotationIndex = Math.floor(Math.random() * 4);
            const shouldFlip = Math.random() > 0.5;
            
            // Create the piece with random rotation and flip
            pieces.push({
              id: `piece-${type}-${pieces.length}`,
              type,
              position: { x: 0, y: 0 }, // Initial position, will be set when displayed
              shape: shapeArray,
              rotation: initialRotations[randomRotationIndex],
              flipped: shouldFlip,
              color: colors[colorIndex],
              isPlaced: false
            });
          }
        }
      }
    }
  });
  
  return pieces;
};

// Check if the puzzle is complete
export const checkPuzzleComplete = (level: Level, pieces: PuzzlePiece[]): boolean => {
  // If all pieces are placed, the puzzle is complete
  return pieces.every(piece => piece.isPlaced);
};

// Generate an empty board of specified dimensions
export const generateEmptyBoard = (width: number, height: number): CellType[][] => {
  return Array(height).fill(null).map(() => 
    Array(width).fill('0') as CellType[]
  );
};

// Generate a random level with specified dimensions
export const generateRandomLevel = (id: string, name: string, width: number, height: number): Level => {
  // Create an empty board
  const grid = generateEmptyBoard(width, height);
  
  // Add some blockers (X) - about 10-15% of the board
  const blockerCount = Math.floor((width * height) * 0.12);
  for (let i = 0; i < blockerCount; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    grid[y][x] = 'X';
  }
  
  // Add some pieces (1-9) - try to make connected shapes
  const maxPieceTypes = Math.min(9, Math.floor((width * height) * 0.3 / 4)); // Each piece is ~4 cells
  
  for (let pieceType = 1; pieceType <= maxPieceTypes; pieceType++) {
    const typeChar = pieceType.toString() as CellType;
    const pieceSize = Math.floor(Math.random() * 3) + 2; // 2-4 cells per piece
    
    // Find a random empty starting point
    let startX, startY;
    let tries = 0;
    do {
      startX = Math.floor(Math.random() * width);
      startY = Math.floor(Math.random() * height);
      tries++;
    } while (grid[startY][startX] !== '0' && tries < 100);
    
    if (tries < 100) {
      // Place the first cell
      grid[startY][startX] = typeChar;
      
      // Grow the piece
      let currentPieceSize = 1;
      while (currentPieceSize < pieceSize) {
        // Find all possible growth points (adjacent to existing piece cells)
        const growthPoints = [];
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (grid[y][x] === typeChar) {
              // Check neighbors
              if (y > 0 && grid[y-1][x] === '0') growthPoints.push({x, y: y-1});
              if (y < height-1 && grid[y+1][x] === '0') growthPoints.push({x, y: y+1});
              if (x > 0 && grid[y][x-1] === '0') growthPoints.push({x: x-1, y});
              if (x < width-1 && grid[y][x+1] === '0') growthPoints.push({x: x+1, y});
            }
          }
        }
        
        if (growthPoints.length === 0) break; // Can't grow anymore
        
        // Pick a random growth point
        const growthPoint = growthPoints[Math.floor(Math.random() * growthPoints.length)];
        grid[growthPoint.y][growthPoint.x] = typeChar;
        currentPieceSize++;
      }
    }
  }
  
  // Add some empty spaces to make it a proper puzzle
  const emptySpaces = Math.floor((width * height) * 0.2);
  let emptyCellCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] !== '0' && grid[y][x] !== 'X') {
        grid[y][x] = '0';
        emptyCellCount++;
        if (emptyCellCount >= emptySpaces) break;
      }
    }
    if (emptyCellCount >= emptySpaces) break;
  }
  
  return {
    id,
    name,
    description: `A ${width}x${height} puzzle board with various candy pieces.`,
    grid
  };
};

// Get the color for a cell type
export const getCellColor = (type: CellType): string => {
  const colors = {
    'X': '#333333', // Dark gray for blockers
    '0': 'transparent', // Transparent for empty spaces
    '1': '#FF9AA2', // Light pink
    '2': '#FFB7B2', // Light salmon
    '3': '#FFDAC1', // Light peach
    '4': '#E2F0CB', // Light lime
    '5': '#B5EAD7', // Light mint
    '6': '#C7CEEA', // Light blue
    '7': '#F8C8DC', // Pastel pink
    '8': '#FDFD96', // Pastel yellow
    '9': '#B4F8C8', // Pastel green
  };
  
  return colors[type] || '#FFFFFF';
}; 
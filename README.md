# Puzzle2D - Candy Themed Puzzle Game

A Next.js and TypeScript-based 2D puzzle game with a soft, cartoonish style inspired by candy and desserts. The interface features vibrant colors, smooth animations, and a playful design.

## Features

- 🧩 Drag and drop puzzle pieces onto the board
- 🔄 Rotate and flip pieces to fit them properly
- 📱 Responsive design for both desktop and mobile
- 🎮 Multiple levels with different challenges
- 🍬 Sweet candy-themed visuals and animations

## Game Mechanics

- Each level is defined as a 2D array, where:
  - 'X' represents an immovable blocker
  - '0' represents an empty space
  - Numbers (1, 2, 3, etc.) represent different puzzle pieces

- Players can drag, rotate, and flip puzzle pieces
- Pieces snap into place when positioned correctly
- A level is won when all pieces are placed on the board

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/puzzle2d.git
cd puzzle2d
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play the game.

## Adding New Levels

To add a new level, create a JSON file in the `app/levels` directory following this format:

```json
{
  "id": "levelX",
  "name": "Level Name",
  "description": "Level description",
  "grid": [
    ["X", "X", "X", "1", "X"],
    ["X", "1", "1", "1", "1"],
    ["X", "2", "0", "1", "X"],
    ["2", "2", "2", "2", "X"],
    ["X", "2", "X", "X", "X"]
  ]
}
```

Then add the level ID to the `availableLevels` array in `app/page.tsx`.

## Technologies Used

- Next.js
- TypeScript
- React
- Framer Motion for animations
- Tailwind CSS for styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by classic puzzle games
- Built with a candy/dessert theme for a friendly, playful experience

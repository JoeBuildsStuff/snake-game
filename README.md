# Snake 2048 Game

A full-screen browser game built with Next.js, TypeScript, and HTML5 Canvas that combines classic snake gameplay with 2048-style number merging mechanics. Players control a snake that grows by eating numbered circles and merging matching values.

## 🎮 Game Overview

**Snake 2048** is an innovative hybrid game where you control a snake that moves around a large world eating numbered circles. The game features 2048-style merging mechanics where matching values combine to create higher numbers, making the snake grow longer and more powerful.

### Game Features
- **Full-screen canvas** that adapts to browser window size
- **Large scrolling world** (3000x2000 pixels) with boundary constraints
- **Mouse-controlled movement** - snake follows your cursor smoothly
- **2048-style merging** - matching values automatically combine
- **Dynamic snake growth** - segments follow the head with smooth movement
- **Real-time score tracking** and segment counter
- **Visual value display** on all game elements
- **Floating UI** with game information and statistics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd snake-game

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play the game.

## 🎯 How to Play

### Controls
- **Mouse Movement** - Move your cursor to control the snake's direction
- The snake smoothly follows your mouse cursor with realistic movement

### Objective
- Move your snake around the world to eat numbered circles
- Circles have values: 2 (green), 4 (yellow), 8 (red)
- When you eat a circle, it becomes part of your snake
- Matching values automatically merge following 2048 rules
- Try to reach the highest possible value and eat all 50 circles!

### 2048 Merging Mechanics
- **Direct Player Merge**: If you eat a circle with the same value as your head, your head doubles in value
- **Segment Creation**: If you eat a different value, it becomes a new snake segment
- **Automatic Merging**: Adjacent segments with matching values automatically merge
- **Value Hierarchy**: The snake head always has the highest value, with segments sorted in descending order
- **Cascading Merges**: Multiple merges can occur in sequence when segments combine

## 🏗️ Code Structure

### Main Component: `src/app/page.tsx`

The game is implemented as a single React component with the following key sections:

#### State Management
```typescript
interface Circle {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  value: number;
}

interface Player {
  x: number;
  y: number;
  size: number;
  color: string;
  value: number;
}

interface SnakeSegment {
  x: number;
  y: number;
  size: number;
  value: number;
}
```

#### Core State Variables
- `player` - Snake head position, size, color, and current value
- `circles` - Array of food circles with values (2, 4, 8)
- `snakeSegments` - Array of snake body segments with their values
- `score` - Current game score (sum of all eaten circle values)
- `mousePos` - Current mouse position in world coordinates
- `eatenCircles` - Set of circle IDs that have been consumed
- `cameraX/cameraY` - Camera position for scrolling
- `canvasWidth/canvasHeight` - Dynamic canvas dimensions

#### Key Functions

**1. Game Loop (`useEffect`)**
- Runs at ~60 FPS using `setInterval`
- Updates player position based on mouse cursor
- Handles smooth snake segment following movement
- Performs collision detection between player and circles
- Processes 2048-style merging when circles are eaten
- Updates camera to follow player smoothly

**2. Mouse Movement (`useEffect`)**
- Converts screen coordinates to world coordinates
- Updates mouse position for snake targeting
- Accounts for camera offset for accurate positioning

**3. Circle Generation (`useEffect`)**
- Creates 50 random circles with values 2, 4, or 8
- Distributes circles across the 3000x2000 world
- Assigns colors based on value (green=2, yellow=4, red=8)

**4. Merging Logic (`mergeSegments`)**
- Handles complex 2048-style merging rules
- Processes direct player merges when values match
- Manages segment creation and sorting
- Implements cascading merges for adjacent segments
- Maintains value hierarchy (head always highest)
- Returns updated segments and new player value

**5. Rendering (`useEffect`)**
- Clears and redraws the canvas every frame
- Uses camera translation for scrolling effect
- Draws grid pattern for visual reference
- Renders all circles with their values
- Draws snake segments with borders and values
- Displays player head with current value
- Shows mouse cursor indicator

### Canvas Rendering System

The game uses HTML5 Canvas with the following rendering approach:

1. **Camera System**: Uses `ctx.translate(-cameraX, -cameraY)` to create scrolling effect
2. **World Boundaries**: Camera stops at world edges to prevent scrolling beyond limits
3. **Grid Background**: Visual aid showing 100px grid lines across the world
4. **Value Display**: All game elements show their numerical values
5. **Color Coding**: Different values have distinct colors for easy identification

### Snake Movement System

**Head Movement**:
- Snake head smoothly follows mouse cursor
- Movement speed is capped to prevent erratic behavior
- World boundaries prevent the snake from leaving the play area

**Segment Following**:
- Each segment follows the one in front of it
- Fixed spacing (35px) between segments
- Smooth movement with speed limiting
- Segments maintain formation during turns

### 2048 Merging Algorithm

The merging system follows these rules:

1. **Value Matching**: When eating a circle with the same value as the head, the head doubles
2. **Segment Addition**: Different values become new segments
3. **Adjacent Merging**: Segments with matching values automatically combine
4. **Value Sorting**: Segments are always sorted in descending order
5. **Head Promotion**: If a segment becomes larger than the head, they swap values
6. **Cascading**: Multiple merges can occur in sequence

### UI Layout

The interface uses a layered approach:
- **Full-screen canvas** as the base layer
- **Floating header** with game info (score, segments, player value, highest value, food remaining)
- **Floating footer** with game instructions
- **Semi-transparent overlays** with backdrop blur for modern look

## 🛠️ Development

### Adding New Features

#### To add new game objects:
1. Define interface in the component
2. Add to state management
3. Include in rendering loop
4. Add collision detection if needed

#### To modify merging mechanics:
1. Update the `mergeSegments` function
2. Adjust collision detection logic
3. Update UI display as needed

### Performance Considerations

- **60 FPS target**: Game loop runs every 16ms
- **Efficient rendering**: Only redraws when state changes
- **Memory management**: Proper cleanup of event listeners
- **Canvas optimization**: Uses `save()` and `restore()` for transformations
- **Smooth movement**: Interpolated movement prevents jittering

### Browser Compatibility

- Modern browsers with HTML5 Canvas support
- Responsive design works on various screen sizes
- Mouse input works across different browsers

## 📦 Dependencies

- **Next.js 15.4.6** - React framework
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## 🚀 Deployment

The game can be deployed using standard Next.js deployment methods:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Vercel Deployment
This project is optimized for Vercel deployment with zero configuration required.

## 🤝 Contributing

When contributing to this project:

1. **Follow the existing code structure** - Single component architecture
2. **Maintain performance** - Keep 60 FPS target
3. **Test responsiveness** - Ensure it works on different screen sizes
4. **Update documentation** - Keep this README current

### Code Style
- Use TypeScript interfaces for all data structures
- Follow React hooks best practices
- Use descriptive variable names
- Add comments for complex game logic

## 🎯 Future Enhancements

Potential features to consider:
- Touch controls for mobile devices
- Power-ups and special abilities
- Obstacles and enemies
- Multiplayer support
- Sound effects and music
- Particle effects for merging
- High score persistence
- Multiple levels or worlds
- Different game modes (time attack, survival)

## 📄 License

[Add your license information here]

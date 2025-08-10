'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player>({
    x: 400,
    y: 300,
    size: 20,
    color: '#22c55e', // Green color for value 2
    value: 2
  });
  const [circles, setCircles] = useState<Circle[]>([]);
  const [score, setScore] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 400, y: 300 });
  const [eatenCircles, setEatenCircles] = useState<Set<number>>(new Set());
  const [snakeSegments, setSnakeSegments] = useState<SnakeSegment[]>([]);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);

  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const worldWidth = 3000;
  const worldHeight = 2000;

  // Handle window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Generate random circles with different values
  useEffect(() => {
    const newCircles: Circle[] = [];
    const possibleValues = [2, 4, 8];
    
    for (let i = 0; i < 50; i++) {
      const value = possibleValues[Math.floor(Math.random() * possibleValues.length)];
      newCircles.push({
        id: i,
        x: Math.random() * (worldWidth - 40) + 20,
        y: Math.random() * (worldHeight - 40) + 20,
        radius: 15,
        color: value === 2 ? '#10b981' : value === 4 ? '#f59e0b' : '#ef4444',
        value: value
      });
    }
    setCircles(newCircles);
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert mouse position to world coordinates
      const worldX = e.clientX + cameraX;
      const worldY = e.clientY + cameraY;
      setMousePos({ x: worldX, y: worldY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cameraX, cameraY]);

  // Function to get color based on value
  const getColorForValue = (value: number) => {
    const colors: { [key: number]: string } = {
      2: '#22c55e',
      4: '#f59e0b',
      8: '#ef4444',
      16: '#8b5cf6',
      32: '#06b6d4',
      64: '#f97316',
      128: '#ec4899',
      256: '#10b981',
      512: '#6366f1',
      1024: '#84cc16',
      2048: '#fbbf24'
    };
    return colors[value] || '#6b7280';
  };

  // Function to merge segments with 2048 rules (with cascading merges)
  // Now returns both the segments and the new player value
  const mergeSegments = (segments: SnakeSegment[], newValue: number, currentPlayerValue: number) => {
    // Start by checking if the new value matches the player's current value
    let finalPlayerValue = currentPlayerValue;
    let segmentsToProcess = [...segments];
    
    if (newValue === currentPlayerValue) {
      // Merge with player head directly
      finalPlayerValue = currentPlayerValue * 2;
    } else if (newValue > currentPlayerValue) {
      // If the new value is larger than the player, it becomes the new player value
      // and the old player value becomes the first segment
      segmentsToProcess = [
        {
          x: player.x,
          y: player.y,
          size: Math.min(30, 18 + Math.log2(currentPlayerValue) * 1.5),
          value: currentPlayerValue
        },
        ...segments
      ];
      finalPlayerValue = newValue;
    } else {
      // Add new segment and it will be sorted later
      segmentsToProcess = [
        {
          x: player.x,
          y: player.y,
          size: Math.min(30, 18 + Math.log2(newValue) * 1.5),
          value: newValue
        },
        ...segments
      ];
    }

    // Keep merging segments until no more merges are possible
    let mergeOccurred = true;
    while (mergeOccurred && segmentsToProcess.length > 0) {
      mergeOccurred = false;
      
      // First, merge any adjacent segments with the same value
      for (let i = 0; i < segmentsToProcess.length - 1; i++) {
        if (segmentsToProcess[i].value === segmentsToProcess[i + 1].value) {
          // Merge these two segments
          const mergedValue = segmentsToProcess[i].value * 2;
          const mergedSegment = {
            x: segmentsToProcess[i].x,
            y: segmentsToProcess[i].y,
            size: Math.min(30, 18 + Math.log2(mergedValue) * 1.5),
            value: mergedValue
          };
          
          // Replace the two segments with the merged one
          segmentsToProcess.splice(i, 2, mergedSegment);
          mergeOccurred = true;
          break; // Start over after a merge
        }
      }
    }

    // After merging, sort segments in descending order
    segmentsToProcess.sort((a, b) => b.value - a.value);

    // Check if any segment is now larger than the player value
    while (segmentsToProcess.length > 0 && segmentsToProcess[0].value > finalPlayerValue) {
      // Swap the player with the largest segment
      const oldPlayerValue = finalPlayerValue;
      finalPlayerValue = segmentsToProcess[0].value;
      segmentsToProcess[0].value = oldPlayerValue;
      segmentsToProcess[0].size = Math.min(30, 18 + Math.log2(oldPlayerValue) * 1.5);
      
      // Resort after the swap
      segmentsToProcess.sort((a, b) => b.value - a.value);
    }

    // After sorting, check if the first segment can merge with the player
    if (segmentsToProcess.length > 0 && segmentsToProcess[0].value === finalPlayerValue) {
      // The first segment matches the player value, merge them!
      finalPlayerValue = finalPlayerValue * 2;
      segmentsToProcess = segmentsToProcess.slice(1); // Remove the first segment
    }

    return {
      segments: segmentsToProcess,
      newPlayerValue: finalPlayerValue
    };
  };

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      setPlayer(prevPlayer => {
        // Calculate direction to mouse
        const dx = mousePos.x - prevPlayer.x;
        const dy = mousePos.y - prevPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let newX = prevPlayer.x;
        let newY = prevPlayer.y;
        
        // Only move if mouse is far enough away (to prevent jittering)
        if (distance > 5) {
          const speed = 5;
          // Normalize direction and apply speed
          const dirX = (dx / distance) * speed;
          const dirY = (dy / distance) * speed;
          
          newX = Math.max(prevPlayer.size, Math.min(worldWidth - prevPlayer.size, prevPlayer.x + dirX));
          newY = Math.max(prevPlayer.size, Math.min(worldHeight - prevPlayer.size, prevPlayer.y + dirY));
        }

        // Update snake segments to follow with smooth movement
        setSnakeSegments(prevSegments => {
          if (prevSegments.length === 0) return prevSegments;
          
          const newSegments = [...prevSegments];
          const segmentSpacing = 35; // Fixed spacing between segments
          
          // Update each segment to follow the one in front of it
          for (let i = 0; i < newSegments.length; i++) {
            const target = i === 0 ? { x: newX, y: newY } : newSegments[i - 1];
            const segment = newSegments[i];
            
            // Calculate distance to target
            const dx = target.x - segment.x;
            const dy = target.y - segment.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only move if we're too far from the target
            if (distance > segmentSpacing) {
              // Calculate normalized direction
              const dirX = dx / distance;
              const dirY = dy / distance;
              
              // Move towards target, maintaining proper spacing
              const moveDistance = distance - segmentSpacing;
              segment.x += dirX * Math.min(moveDistance, 8); // Limit movement speed
              segment.y += dirY * Math.min(moveDistance, 8);
            }
          }
          
          return newSegments;
        });

        return { ...prevPlayer, x: newX, y: newY };
      });

      // Update camera to follow player
      setCameraX(prevCameraX => {
        const targetCameraX = player.x - canvasWidth / 2;
        const minCameraX = 0;
        const maxCameraX = Math.max(0, worldWidth - canvasWidth);
        return Math.max(minCameraX, Math.min(maxCameraX, targetCameraX));
      });

      setCameraY(prevCameraY => {
        const targetCameraY = player.y - canvasHeight / 2;
        const minCameraY = 0;
        const maxCameraY = Math.max(0, worldHeight - canvasHeight);
        return Math.max(minCameraY, Math.min(maxCameraY, targetCameraY));
      });

      // Check for collisions with circles
      setCircles(prevCircles => {
        return prevCircles.filter(circle => {
          const distance = Math.sqrt(
            Math.pow(player.x - circle.x, 2) + Math.pow(player.y - circle.y, 2)
          );
          
          if (distance < player.size + circle.radius && !eatenCircles.has(circle.id)) {
            setEatenCircles(prev => new Set(prev).add(circle.id));
            setScore(prev => prev + circle.value);
            
            // Process merging with player value
            const result = mergeSegments(snakeSegments, circle.value, player.value);
            
            // Update segments
            setSnakeSegments(result.segments);
            
            // Update player value if it changed
            setPlayer(prevPlayer => ({
              ...prevPlayer,
              value: result.newPlayerValue,
              color: getColorForValue(result.newPlayerValue),
              size: Math.min(25, 20 + Math.log2(result.newPlayerValue) * 1)
            }));
            
            return false; // Remove the circle
          }
          return true;
        });
      });
    };

    const interval = setInterval(gameLoop, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, [mousePos, player, canvasWidth, canvasHeight, worldWidth, worldHeight, eatenCircles, snakeSegments]);

  // Draw everything on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Save context for camera transformation
    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Draw world background grid (optional visual aid)
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    const gridSize = 100;
    for (let x = 0; x <= worldWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= worldHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(worldWidth, y);
      ctx.stroke();
    }

    // Draw circles with their values
    circles.forEach(circle => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
      ctx.fillStyle = circle.color;
      ctx.fill();
      ctx.closePath();
      
      // Draw value on circle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(circle.value.toString(), circle.x, circle.y);
    });

    // Draw snake segments (body) with their values
    snakeSegments.forEach((segment, index) => {
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, segment.size, 0, 2 * Math.PI);
      ctx.fillStyle = getColorForValue(segment.value);
      ctx.fill();
      ctx.closePath();
      
      // Draw segment border
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, segment.size, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
      
      // Draw value on segment
      ctx.fillStyle = '#ffffff';
      const fontSize = Math.max(10, Math.min(16, segment.size * 0.8));
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(segment.value.toString(), segment.x, segment.y);
    });

    // Draw player (head) with its current value
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Draw player border
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    // Draw current value on player head
    ctx.fillStyle = '#ffffff';
    const playerFontSize = Math.max(12, Math.min(18, player.size * 0.8));
    ctx.font = `bold ${playerFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.value.toString(), player.x, player.y);

    // Draw mouse cursor indicator
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    ctx.globalAlpha = 1;

    // Restore context
    ctx.restore();

  }, [player, circles, snakeSegments, cameraX, cameraY, score, canvasWidth, canvasHeight, mousePos]);

  // Calculate total segments and highest value
  const totalSegments = snakeSegments.length;
  const highestValue = snakeSegments.length > 0 ? Math.max(...snakeSegments.map(s => s.value)) : 0;

  return (
    <div className="h-screen w-screen bg-gray-900 relative overflow-hidden">
      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-sm p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Snake 2048</h1>
          <p className="text-gray-300 text-sm mb-2">Move your mouse to control the snake! Same values merge automatically!</p>
          <div className="flex justify-center items-center gap-6 text-sm">
            <div className="text-blue-400 font-semibold">Score: {score}</div>
            <div className="text-green-400">Segments: {totalSegments}</div>
            <div className="text-yellow-400">Player Value: {player.value}</div>
            <div className="text-purple-400">Highest: {Math.max(highestValue, player.value)}</div>
            <div className="text-gray-400">Food remaining: {circles.length}</div>
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Player pos: {Math.round(player.x)}, {Math.round(player.y)} | 
            Camera: {Math.round(cameraX)}, {Math.round(cameraY)}
          </div>
        </div>
      </div>
      
      {/* Full-screen Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="absolute top-0 left-0 w-full h-full"
      />
      
      {/* Floating Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-sm p-3">
        <div className="text-center text-gray-400 text-sm">
          <p>Player head shows its value and grows when merging! Snake segments merge when matching values!</p>
          <p className="text-xs mt-1">When player eats matching value, player upgrades directly! Green=2, Yellow=4, Red=8, Purple=16...</p>
        </div>
      </div>
    </div>
  );
}
// src/app/_components/metro/engine/config.ts

/**
 * Configuration for the grid layout engine
 */
export const GRID_CONFIG = {
  // Basic cell dimensions
  cellWidth: 80,           // Width of each grid cell
  cellHeight: 80,          // Height of each grid cell
  
  // Grid settings
  initialGridSize: 20,     // Initial grid size (will expand as needed)
  centerX: 0,              // Center X coordinate (will be adjusted)
  centerY: 0,              // Center Y coordinate (will be adjusted)
  
  // Padding around the grid edges
  xPadding: 40,
  yPadding: 40,
  
  // Path distribution
  minPathAngleVariation: 30,  // Minimum angle between paths to avoid clustering
  centerWeight: 0.6,          // How strongly to pull nodes toward the center (0-1)
  
  // Spacing and jitter
  nodeSpacing: 1.2,           // Spacing multiplier between nodes
  jitterFactor: 0.1,          // Random jitter to prevent perfect overlaps
  
  // Movement constraints
  allowedDirections: [
    { x: 1, y: 0 },    // Right
    { x: -1, y: 0 },   // Left
    { x: 0, y: 1 },    // Down
    { x: 0, y: -1 },   // Up
    { x: 1, y: 1 },    // Down-Right
    { x: -1, y: 1 },   // Down-Left
    { x: 1, y: -1 },   // Up-Right
    { x: -1, y: -1 },  // Up-Left
  ]
};

/**
 * Common utility functions
 */
export const normalizeVector = (x: number, y: number): { x: number, y: number } => {
  const length = Math.sqrt(x * x + y * y);
  return length === 0 ? { x: 0, y: 0 } : { x: x / length, y: y / length };
};

/**
 * Utility to get a random direction vector with some spread
 * Returns a normalized vector in a random direction
 */
export const getRandomDirection = (spreadDegrees = 30): { x: number, y: number } => {
  // Random angle in radians
  const angle = (Math.random() * 2 * Math.PI);
  
  // Convert to vector
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  
  return normalizeVector(x, y);
};

/**
 * Utility to calculate a direction vector from center to a point on the edge
 * based on an angle in degrees
 */
export const getDirectionFromAngle = (angleDegrees: number): { x: number, y: number } => {
  // Convert degrees to radians
  const angleRadians = (angleDegrees * Math.PI) / 180;
  
  // Calculate direction vector
  const x = Math.cos(angleRadians);
  const y = Math.sin(angleRadians);
  
  return { x, y };
};
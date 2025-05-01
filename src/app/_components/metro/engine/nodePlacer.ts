// src/app/_components/metro/engine/nodePlacer.ts

import type { CareerPath, PositionDetail, Position, LayoutNode, PolarPoint, MetroConfig } from './types';
import { DEFAULT_CONFIG } from './config';

/**
 * Distributes career paths around a circle at different angles
 * Uses eccentricity to control asymmetry, ensures paths are separated
 */
export function assignPathAngles(
  paths: CareerPath[],
  config: MetroConfig = DEFAULT_CONFIG
): Map<string, number> {
  const pathAngles = new Map<string, number>();
  const numPaths = paths.length;
  
  if (numPaths === 0) return pathAngles;
  
  // Sort paths for consistent ordering
  const sortedPaths = [...paths].sort((a, b) => a.id.localeCompare(b.id));
  
  // Define primary directions based on numDirections
  const angleStep = 360 / config.numDirections;
  
  // Calculate available angles (0, 45, 90, 135, etc based on config)
  const availableAngles: number[] = [];
  for (let i = 0; i < config.numDirections; i++) {
    availableAngles.push((i * angleStep + config.angleOffset) % 360);
  }

  // Assign each path to a primary direction
  sortedPaths.forEach((path, index) => {
    // If we have more paths than directions, we'll reuse directions
    const angleIndex = index % availableAngles.length;
    
    // Apply slight variation to avoid exact overlap when reusing angles
    const variationFactor = Math.floor(index / availableAngles.length) * 5;
    const finalAngle = (availableAngles[angleIndex] + variationFactor) % 360;
    
    pathAngles.set(path.id, finalAngle);
  });

  return pathAngles;
}

/**
 * Calculate level information for scaling
 */
export function getLevelInfo(details: PositionDetail[]): { 
  minLevel: number; 
  maxLevel: number; 
  midLevel: number;
} {
  if (details.length === 0) {
    return { minLevel: 1, maxLevel: 1, midLevel: 1 };
  }
  
  const levels = details.map(d => d.level);
  const minLevel = Math.min(...levels);
  const maxLevel = Math.max(...levels);
  const midLevel = (minLevel + maxLevel) / 2;
  
  return { minLevel, maxLevel, midLevel };
}

/**
 * Convert angle in degrees to x,y offset for grid positioning
 * Returns normalized direction vector for grid placement
 */
function getGridDirection(angle: number): { dx: number, dy: number } {
  // Convert to radians
  const radians = (angle * Math.PI) / 180;
  
  // Calculate basic direction
  const dx = Math.cos(radians);
  const dy = Math.sin(radians);
  
  // Snap to nearest grid direction (0, 45, 90, etc.)
  // First determine the octant (0-7) the angle falls in
  const octant = Math.round(8 * radians / (2 * Math.PI) + 8) % 8;
  
  // Map octant to normalized grid directions
  const gridDirections = [
    { dx: 1, dy: 0 },    // 0° - right
    { dx: 1, dy: 1 },    // 45° - bottom-right
    { dx: 0, dy: 1 },    // 90° - down
    { dx: -1, dy: 1 },   // 135° - bottom-left
    { dx: -1, dy: 0 },   // 180° - left
    { dx: -1, dy: -1 },  // 225° - top-left
    { dx: 0, dy: -1 },   // 270° - up
    { dx: 1, dy: -1 }    // 315° - top-right
  ];

  return gridDirections[octant];
}

/**
 * Calculate node positions with metro-style constraints
 */
export function calculateNodePositions(
  details: PositionDetail[],
  positions: Position[],
  pathAngles: Map<string, number>,
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  // Create position lookup map
  const posMap = new Map(positions.map(p => [p.id, p]));
  
  // Get level range information
  const levelInfo = getLevelInfo(details);
  
  // Group details by career path
  const pathDetails = new Map<string, PositionDetail[]>();
  details.forEach(detail => {
    if (!pathDetails.has(detail.career_path_id)) {
      pathDetails.set(detail.career_path_id, []);
    }
    pathDetails.get(detail.career_path_id)!.push(detail);
  });
  
  // Pre-sort each path's details by level for consistent processing
  pathDetails.forEach((details, pathId) => {
    details.sort((a, b) => {
      // First sort by level
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      
      // Then by sequence if available
      if (a.sequence_in_path != null && b.sequence_in_path != null) {
        return a.sequence_in_path - b.sequence_in_path;
      }
      
      return 0;
    });
  });
  
  // Final nodes array to return
  const nodes: LayoutNode[] = [];
  
  // Process each path to place its nodes
  pathDetails.forEach((pathNodes, pathId) => {
    // Get this path's angle
    const pathAngle = pathAngles.get(pathId) || 0;
    
    // Get grid-aligned direction for this path
    const gridDir = getGridDirection(pathAngle);
    
    // Place nodes along the path with metro-style spacing
    pathNodes.forEach((detail, index) => {
      const position = posMap.get(detail.position_id);
      if (!position) {
        throw new Error(`Position ${detail.position_id} not found`);
      }
      
      // Center mid-level positions, spread out others based on level difference
      const levelDiff = detail.level - levelInfo.midLevel;
      
      // Calculate base radius using level difference
      const baseRadius = config.midLevelRadius + (levelDiff * config.radiusStep);
      const radius = Math.max(config.minRadius, baseRadius);
      
      // Calculate offset from center line for visual interest
      // Earlier nodes in path get less offset, creating a more structured look
      const pathProgress = index / Math.max(1, pathNodes.length - 1);
      const offsetFactor = 0.15 * (detail.level !== levelInfo.midLevel ? 1 : 0.5);
      const perpOffset = radius * offsetFactor * Math.sin(pathProgress * Math.PI);
      
      // Apply calculated positions in grid-aligned directions
      // For mid-level nodes, pull them more towards the center
      let x, y;
      
      // Midlevel nodes should be closer to center
      if (Math.abs(detail.level - levelInfo.midLevel) < 0.5) {
        // Pure radial positioning for midlevel
        const angleRad = (pathAngle * Math.PI) / 180;
        x = radius * 0.7 * Math.cos(angleRad);
        y = radius * 0.7 * Math.sin(angleRad);
      } else {
        // Grid-aligned positioning for other nodes
        // Main direction component
        x = radius * gridDir.dx;
        y = radius * gridDir.dy;
        
        // Add perpendicular offset for visual separation
        // Calculate perpendicular direction by rotating 90°
        const perpDir = { dx: -gridDir.dy, dy: gridDir.dx };
        x += perpOffset * perpDir.dx;
        y += perpOffset * perpDir.dy;
      }
      
      // Create node with calculated position
      nodes.push({
        id: detail.id,
        positionId: detail.position_id,
        careerPathId: detail.career_path_id,
        level: detail.level,
        name: position.name,
        x,
        y,
        color: "#cccccc", // Default color, will be updated later
        sequence_in_path: detail.sequence_in_path
      });
    });
  });
  
  return nodes;
}
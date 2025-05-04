// src/app/_components/metro/engine/nodePlacer.ts

import type { CareerPath, PositionDetail, Position, LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

/**
 * Distributes career paths around a circle at different angles
 * Ensures paths are evenly separated in angular space
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
  
  // For optimal distribution, use fixed angle steps based on config
  // This ensures we get angles at 0°, 45°, 90°, etc.
  const angleStep = 360 / config.numDirections;
  
  // Calculate distribution with small random variations to avoid perfect symmetry
  sortedPaths.forEach((path, index) => {
    // Determine which angle to use from the available angles
    const angleIndex = index % config.numDirections;
    
    // Calculate base angle to ensure grid alignment
    const baseAngle = angleIndex * angleStep;
    
    // Apply small variation only within the same general direction
    // to maintain the grid alignment
    const variation = (Math.random() - 0.5) * 5 * config.eccentricity;
    const finalAngle = (baseAngle + variation + config.angleOffset) % 360;
    
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
 * Snap angle to the nearest 45° increment
 */
function snapAngleToGrid(angle: number): number {
  // Define the grid angles (0, 45, 90, 135, 180, 225, 270, 315)
  const gridAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  
  // Find the closest grid angle
  let closestAngle = gridAngles[0];
  let minDifference = Math.abs(angle - closestAngle);
  
  for (let i = 1; i < gridAngles.length; i++) {
    const difference = Math.abs(angle - gridAngles[i]);
    if (difference < minDifference) {
      minDifference = difference;
      closestAngle = gridAngles[i];
    }
  }
  
  return closestAngle;
}

/**
 * Convert angle in degrees to x,y vector
 */
function getPolarVector(angle: number): { dx: number, dy: number } {
  // Convert to radians
  const radians = (angle * Math.PI) / 180;
  
  // Return normalized vector
  return {
    dx: Math.cos(radians),
    dy: Math.sin(radians)
  };
}

/**
 * Calculate node positions with bidirectional extension from center
 */
export function calculateInitialNodePositions(
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
  
  // Sort each path's details by level and sequence
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
    
    // Ensure angle is snapped to grid (0, 45, 90, etc.)
    const snappedAngle = snapAngleToGrid(pathAngle);
    
    // Get vector for this path's direction
    const pathVector = getPolarVector(snappedAngle);
    
    // Calculate opposite angle for senior positions (180° rotation)
    const oppositeAngle = (snappedAngle + 180) % 360;
    const oppositeVector = getPolarVector(oppositeAngle);
    
    // Place nodes along the path with bidirectional extension
    pathNodes.forEach((detail) => {
      const position = posMap.get(detail.position_id);
      if (!position) {
        throw new Error(`Position ${detail.position_id} not found`);
      }
      
      // Calculate normalized position in the level range (0 to 1)
      const levelRange = levelInfo.maxLevel - levelInfo.minLevel;
      const normalizedLevel = levelRange > 0 
        ? (detail.level - levelInfo.minLevel) / levelRange 
        : 0.5;
      
      // Determine which vector to use based on level
      // Junior positions: use pathVector
      // Senior positions: use oppositeVector
      const useOppositeDirection = detail.level > levelInfo.midLevel;
      const directionVector = useOppositeDirection ? oppositeVector : pathVector;
      
      // Calculate distance from center based on how far from midLevel
      // The further from midLevel, the greater the distance
      const midLevelDiff = Math.abs(detail.level - levelInfo.midLevel);
      const maxDiff = Math.max(
        levelInfo.midLevel - levelInfo.minLevel,
        levelInfo.maxLevel - levelInfo.midLevel
      );
      
      // Normalize the difference to get a 0-1 scale
      const normalizedDiff = maxDiff > 0 ? midLevelDiff / maxDiff : 0;
      
      // Calculate radius - positions at midLevel are closest to center
      // Positions furthest from midLevel (junior or senior) are furthest from center
      const radius = config.midLevelRadius + 
        (normalizedDiff * config.radiusStep * 2); // Amplify the effect
      
      // Calculate position using the appropriate direction vector
      const x = directionVector.dx * radius;
      const y = directionVector.dy * radius;
      
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
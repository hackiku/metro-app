// nodePlacer.ts
import type { CareerPath, PositionDetail, Position, LayoutNode, PolarPoint, MetroConfig } from './types';
import { DEFAULT_CONFIG } from './config';

/**
 * Distributes career paths around a circle at different angles
 * Uses eccentricity to control asymmetry
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
  
  // Calculate base angle step
  const angleStep = 360 / config.numDirections;
  
  // Distribute paths around the circle
  sortedPaths.forEach((path, index) => {
    // Use eccentricity to create asymmetric distribution
    // With eccentricity=0, paths are evenly spaced
    // With eccentricity=1, paths tend to cluster on one side
    
    // Map index to position around the circle (0 to 1)
    const normalizedIndex = index / Math.max(1, numPaths - 1);
    
    // Apply eccentricity transform (simple power curve)
    const biasedPosition = Math.pow(normalizedIndex, 1 + config.eccentricity);
    
    // Convert to angle (0-360)
    const baseAngle = biasedPosition * 360;
    
    // Snap to nearest allowed direction
    const snapIndex = Math.round(baseAngle / angleStep);
    const finalAngle = (snapIndex * angleStep + config.angleOffset) % 360;
    
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
 * Calculates node positions based on level and path angle
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
  
  return details.map(detail => {
    // Get position name
    const position = posMap.get(detail.position_id);
    if (!position) {
      throw new Error(`Position ${detail.position_id} not found`);
    }
    
    // Get path angle (or use 0 as fallback)
    const pathAngle = pathAngles.get(detail.career_path_id) || 0;
    
    // Calculate radius based on level
    // Nodes radiate outward from midLevelRadius
    const levelDiff = detail.level - levelInfo.midLevel;
    const radius = config.midLevelRadius + (levelDiff * config.radiusStep);
    
    // Ensure minimum radius
    const finalRadius = Math.max(config.minRadius, radius);
    
    // Convert polar (radius, angle) to Cartesian (x, y)
    const angleRad = (pathAngle * Math.PI) / 180;
    const x = finalRadius * Math.cos(angleRad);
    const y = finalRadius * Math.sin(angleRad);

    // Create node with calculated position
    return {
      id: detail.id,
      positionId: detail.position_id,
      careerPathId: detail.career_path_id,
      level: detail.level,
      name: position.name,
      x,
      y,
      color: "#cccccc", // Default color, will be updated later
      sequence_in_path: detail.sequence_in_path
    };
  });
}
// src/app/_components/metro/engine/nodePlacer.ts

import type { CareerPath, PositionDetail, Position, LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

/**
 * Distributes career paths at grid angles with controlled variation
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
  
  // Define potential angles (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
  const gridAngles = [];
  for (let i = 0; i < config.numDirections; i++) {
    gridAngles.push((i * (360 / config.numDirections)) % 360);
  }
  
  // Assign angles with intentional variation
  sortedPaths.forEach((path, index) => {
    // For first few paths, use grid angles directly
    if (index < gridAngles.length) {
      pathAngles.set(path.id, gridAngles[index]);
    } else {
      // For additional paths, use grid angles with small variations
      const baseAngleIndex = index % gridAngles.length;
      const baseAngle = gridAngles[baseAngleIndex];
      
      // Add slight variation based on path index and eccentricity
      // Variation is small enough to keep the general grid-aligned feel
      const variation = ((index * 7) % 10 - 5) * config.eccentricity;
      const finalAngle = (baseAngle + variation + config.angleOffset) % 360;
      
      pathAngles.set(path.id, finalAngle);
    }
  });

  return pathAngles;
}

/**
 * Calculate per-path level information
 */
export function getPathLevelInfo(details: PositionDetail[]): { 
  globalMinLevel: number;
  globalMaxLevel: number;
  globalMidLevel: number;
  pathLevels: Map<string, {min: number, max: number, mid: number, count: number}>;
} {
  if (details.length === 0) {
    return { 
      globalMinLevel: 1, 
      globalMaxLevel: 1, 
      globalMidLevel: 1,
      pathLevels: new Map()
    };
  }
  
  // Get global level range
  const levels = details.map(d => d.level);
  const globalMinLevel = Math.min(...levels);
  const globalMaxLevel = Math.max(...levels);
  const globalMidLevel = (globalMinLevel + globalMaxLevel) / 4;
  
  // Group details by career path
  const detailsByPath = new Map<string, PositionDetail[]>();
  details.forEach(detail => {
    if (!detailsByPath.has(detail.career_path_id)) {
      detailsByPath.set(detail.career_path_id, []);
    }
    detailsByPath.get(detail.career_path_id)!.push(detail);
  });
  
  // Calculate per-path level information
  const pathLevels = new Map<string, {min: number, max: number, mid: number, count: number}>();
  detailsByPath.forEach((pathDetails, pathId) => {
    const pathLevelList = pathDetails.map(d => d.level);
    const min = Math.min(...pathLevelList);
    const max = Math.max(...pathLevelList);
    const mid = (min + max) / 2;
    
    pathLevels.set(pathId, {
      min,
      max,
      mid,
      count: pathDetails.length
    });
  });
  
  return {
    globalMinLevel,
    globalMaxLevel,
    globalMidLevel,
    pathLevels
  };
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
 * Calculate node positions with flexible placement and grid angles
 */
export function calculateInitialNodePositions(
  details: PositionDetail[],
  positions: Position[],
  pathAngles: Map<string, number>,
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  // Create position lookup map
  const posMap = new Map(positions.map(p => [p.id, p]));
  
  // Get level information including per-path data
  const levelInfo = getPathLevelInfo(details);
  
  // Group and sort details by career path
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
    if (pathNodes.length === 0) return;
    
    // Get this path's angle
    const pathAngle = pathAngles.get(pathId) || 0;
    
    // Get the path's specific level info
    const pathLevelInfo = levelInfo.pathLevels.get(pathId);
    if (!pathLevelInfo) return;
    
    // Calculate vectors for this path
    const mainVector = getPolarVector(pathAngle);
    
    // Calculate opposite angle - varies based on number of positions
    // For paths with just 2 positions, don't use a perfect 180° opposite
    // This adds visual interest and prevents long straight lines
    let oppositeAngle;
    if (pathLevelInfo.count <= 2) {
      // For short paths, use a 135° offset instead of 180°
      oppositeAngle = (pathAngle + 135) % 360;
    } else {
      // For longer paths, use the standard opposite direction
      oppositeAngle = (pathAngle + 180) % 360;
    }
    
    const oppositeVector = getPolarVector(oppositeAngle);
    
    // Place nodes along the path
    pathNodes.forEach((detail, index) => {
      const position = posMap.get(detail.position_id);
      if (!position) {
        throw new Error(`Position ${detail.position_id} not found`);
      }
      
      // Calculate normalized position within this path's level range
      // Using the path's own min/max/mid, not the global values
      const relativePosition = (detail.level - pathLevelInfo.min) / 
        Math.max(1, pathLevelInfo.max - pathLevelInfo.min); // Avoid division by zero
      
      // Determine which vector to use based on level relative to path midpoint
      const useOppositeDirection = detail.level > pathLevelInfo.mid;
      
      // For paths with only one position, place it at the mid radius
      let directionVector = mainVector;
      if (pathLevelInfo.count > 1) {
        directionVector = useOppositeDirection ? oppositeVector : mainVector;
      }
      
      // Calculate scaled distance from mid level
      const levelDiff = Math.abs(detail.level - pathLevelInfo.mid);
      const maxDiff = Math.max(
        pathLevelInfo.mid - pathLevelInfo.min,
        pathLevelInfo.max - pathLevelInfo.mid
      );
      
      // For paths with only 2 positions, use special placement
      let radius;
      if (pathLevelInfo.count === 2) {
        // Place both positions on opposite sides but not too far out
        radius = config.midLevelRadius * 1.5;
        
        // Add some variation to avoid all 2-position paths looking identical
        const pathVariation = (parseInt(pathId, 36) % 10) / 10; // Deterministic variation
        radius *= (1 + pathVariation * 0.5); // 0-50% variation
      } else {
        // Normal radius calculation for paths with 3+ positions
        const normalizedDiff = maxDiff > 0 ? levelDiff / maxDiff : 0;
        
        // Core calculation - positions at mid-level are closer to center
        radius = config.midLevelRadius;
        
        // Add distance proportional to deviation from mid-level
        if (levelDiff > 0) {
          radius += normalizedDiff * config.radiusStep * 3; // Amplified effect
        }
        
        // Special case for single-position paths
        if (pathLevelInfo.count === 1) {
          // Place single positions at varying distances based on path ID
          const pathVariation = (parseInt(pathId, 36) % 20) / 10; // Deterministic variation
          radius = config.midLevelRadius * (1 + pathVariation);
        }
      }
      
      // Apply a small randomization factor based on position within sequence
      // This makes nodes that would otherwise be in a perfect line have some variation
      const sequenceOffset = 0.05 * (index % 3) * config.radiusStep;
      
      // Calculate final position
      const x = directionVector.dx * (radius + sequenceOffset);
      const y = directionVector.dy * (radius + sequenceOffset);
      
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
// src/app/_components/metro/engine/nodePlacer.ts

import type { CareerPath, PositionDetail, Position, LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

/**
 * Distributes initial path angles evenly based on the number of paths.
 * Does NOT snap to the config.numDirections grid here.
 */
export function assignPathAngles(
  paths: CareerPath[],
  config: MetroConfig = DEFAULT_CONFIG // config needed for angleOffset
): Map<string, number> {
  const pathAngles = new Map<string, number>();
  const numPaths = paths.length;

  if (numPaths === 0) return pathAngles;

  // Sort paths for consistent ordering
  const sortedPaths = [...paths].sort((a, b) => a.id.localeCompare(b.id));

  // Calculate the angle step based purely on the number of paths available
  const angleStep = 360 / numPaths;

  sortedPaths.forEach((path, index) => {
    // Assign evenly distributed angles
    const baseAngle = (index * angleStep);

    // Apply the global visual offset from config if needed
    // This offset rotates the initial placement, not the final snapping grid
    const finalAngle = (baseAngle + config.angleOffset) % 360;

    pathAngles.set(path.id, finalAngle);
  });

  console.log(`Assigned initial angles based on ${numPaths} paths. Step: ${angleStep.toFixed(1)}deg`);
  return pathAngles;
}

/**
 * Calculate per-path level information (Unchanged)
 */
export function getPathLevelInfo(details: PositionDetail[]): {
  globalMinLevel: number;
  globalMaxLevel: number;
  globalMidLevel: number;
  pathLevels: Map<string, {min: number, max: number, mid: number, count: number}>;
} {
    if (details.length === 0) {
    return {
      globalMinLevel: 1, globalMaxLevel: 1, globalMidLevel: 1, pathLevels: new Map()
    };
  }
  const levels = details.map(d => d.level);
  const globalMinLevel = Math.min(...levels);
  const globalMaxLevel = Math.max(...levels);
  const globalMidLevel = (globalMinLevel + globalMaxLevel) / 2;

  const detailsByPath = new Map<string, PositionDetail[]>();
  details.forEach(detail => {
    if (!detailsByPath.has(detail.career_path_id)) {
      detailsByPath.set(detail.career_path_id, []);
    }
    detailsByPath.get(detail.career_path_id)!.push(detail);
  });

  const pathLevels = new Map<string, {min: number, max: number, mid: number, count: number}>();
  detailsByPath.forEach((pathDetails, pathId) => {
    const pathLevelList = pathDetails.map(d => d.level);
    const min = Math.min(...pathLevelList);
    const max = Math.max(...pathLevelList);
    const mid = (min + max) / 2;
    pathLevels.set(pathId, { min, max, mid, count: pathDetails.length });
  });

  return { globalMinLevel, globalMaxLevel, globalMidLevel, pathLevels };
}

/**
 * Convert angle in degrees to a normalized x,y vector (Unchanged)
 */
function getPolarVector(angle: number): { dx: number, dy: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    dx: Math.cos(radians),
    dy: Math.sin(radians)
  };
}

/**
 * Calculate initial node positions based on level and path angle.
 * Applies globalScale. Junior nodes are placed at varying radii based on level.
 * Uses 180-degree opposite placement for bi-directional paths.
 */
export function calculateInitialNodePositions(
  details: PositionDetail[],
  positions: Position[],
  pathAngles: Map<string, number>, // These are the evenly distributed initial angles
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  const posMap = new Map(positions.map(p => [p.id, p]));
  const levelInfo = getPathLevelInfo(details);

  // Apply global scale to core radius parameters
  const scaledMidRadius = config.midLevelRadius * config.globalScale;
  const scaledRadiusStep = config.radiusStep * config.globalScale;
  const scaledMinRadius = config.minRadius * config.globalScale;

  console.log(`Scaled Radii: Mid=${scaledMidRadius.toFixed(1)}, Step=${scaledRadiusStep.toFixed(1)}, Min=${scaledMinRadius.toFixed(1)}`);

  const pathDetails = new Map<string, PositionDetail[]>();
  details.forEach(detail => {
    if (!pathDetails.has(detail.career_path_id)) {
      pathDetails.set(detail.career_path_id, []);
    }
    pathDetails.get(detail.career_path_id)!.push(detail);
  });

  pathDetails.forEach((pathNodes) => {
    pathNodes.sort((a, b) => { // Sort by level, then sequence
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      if (a.sequence_in_path != null && b.sequence_in_path != null) {
        return a.sequence_in_path - b.sequence_in_path;
      }
      return 0;
    });
  });

  const nodes: LayoutNode[] = [];

  pathDetails.forEach((pathNodes, pathId) => {
    if (pathNodes.length === 0) return;

    const initialPathAngle = pathAngles.get(pathId) ?? 0; // Use the distributed angle
    const pathLevelInfo = levelInfo.pathLevels.get(pathId);
    if (!pathLevelInfo) return;

    const mainVector = getPolarVector(initialPathAngle);
    // Use 180 degree opposite angle generally for bi-directional layout
    const oppositeAngle = (initialPathAngle + 180) % 360;
    const oppositeVector = getPolarVector(oppositeAngle);

    pathNodes.forEach((detail) => {
      const position = posMap.get(detail.position_id);
      if (!position) return;

      const isSeniorNode = detail.level > pathLevelInfo.mid;
      // Determine direction based on seniority relative to path's midpoint
      const directionVector = isSeniorNode ? oppositeVector : mainVector;

      // --- Radius Calculation (incorporating scale) ---
      let radius = scaledMidRadius; // Start at the scaled mid radius

      const levelDiff = Math.abs(detail.level - pathLevelInfo.mid);
      const pathMaxDeviation = Math.max(
        pathLevelInfo.mid - pathLevelInfo.min,
        pathLevelInfo.max - pathLevelInfo.mid,
        0.5 // Avoid division by zero if path has only one level
      );

      if (pathMaxDeviation > 0 && levelDiff > 0) {
        // Calculate normalized position within this path's level deviation range
        const normalizedDiff = levelDiff / pathMaxDeviation;
        // Adjust radius based on deviation, step, and scale
        // Use a simple linear relationship for predictability
        radius += normalizedDiff * scaledRadiusStep;
      }
      // If levelDiff is 0 or pathMaxDeviation is 0, node stays at scaledMidRadius

      // Ensure minimum radius constraint AFTER all calculations
      radius = Math.max(radius, scaledMinRadius);
      // --- End Radius Calculation ---

      // Calculate final position
      const x = directionVector.dx * radius;
      const y = directionVector.dy * radius;

      nodes.push({
        id: detail.id,
        positionId: detail.position_id,
        careerPathId: detail.career_path_id,
        level: detail.level,
        name: position.name,
        x, y,
        color: "#cccccc",
        sequence_in_path: detail.sequence_in_path,
        isInterchange: false
      });
    });
  });

  return nodes;
}
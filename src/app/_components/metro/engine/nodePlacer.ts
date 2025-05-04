// src/app/_components/metro/engine/nodePlacer.ts

import type { CareerPath, PositionDetail, Position, LayoutNode, MetroConfig } from '~/types/engine';
import { DEFAULT_CONFIG } from './config';

function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash % 100);
}

export function assignPathAngles(
  paths: CareerPath[],
  config: MetroConfig = DEFAULT_CONFIG
): Map<string, number> {
  const pathAngles = new Map<string, number>();
  const numPaths = paths.length;
  if (numPaths === 0) return pathAngles;
  const sortedPaths = [...paths].sort((a, b) => a.id.localeCompare(b.id));
  const angleStep = 360 / numPaths;
  sortedPaths.forEach((path, index) => {
    const baseAngle = (index * angleStep);
    const finalAngle = (baseAngle + config.angleOffset) % 360;
    pathAngles.set(path.id, finalAngle);
  });
  // console.log(`Assigned initial angles based on ${numPaths} paths. Step: ${angleStep.toFixed(1)}deg`);
  return pathAngles;
}

export function getPathLevelInfo(details: PositionDetail[]): {
  globalMinLevel: number;
  globalMaxLevel: number;
  globalMidLevel: number;
  pathLevels: Map<string, {min: number, max: number, mid: number, count: number}>;
} {
    if (details.length === 0) return { globalMinLevel: 1, globalMaxLevel: 1, globalMidLevel: 1, pathLevels: new Map() };
    const levels = details.map(d => d.level);
    const globalMinLevel = Math.min(...levels); const globalMaxLevel = Math.max(...levels);
    const globalMidLevel = (globalMinLevel + globalMaxLevel) / 2;
    const detailsByPath = new Map<string, PositionDetail[]>();
    details.forEach(detail => { if (!detailsByPath.has(detail.career_path_id)) detailsByPath.set(detail.career_path_id, []); detailsByPath.get(detail.career_path_id)!.push(detail); });
    const pathLevels = new Map<string, {min: number, max: number, mid: number, count: number}>();
    detailsByPath.forEach((pathDetails, pathId) => { const pathLevelList = pathDetails.map(d => d.level); const min = Math.min(...pathLevelList); const max = Math.max(...pathLevelList); const mid = (min + max) / 2; pathLevels.set(pathId, { min, max, mid, count: pathDetails.length }); });
    return { globalMinLevel, globalMaxLevel, globalMidLevel, pathLevels };
}

function getPolarVector(angle: number): { dx: number, dy: number } {
  const radians = (angle * Math.PI) / 180;
  return { dx: Math.cos(radians), dy: Math.sin(radians) };
}

export function calculateInitialNodePositions(
  details: PositionDetail[],
  positions: Position[],
  pathAngles: Map<string, number>,
  config: MetroConfig = DEFAULT_CONFIG
): LayoutNode[] {
  const posMap = new Map(positions.map(p => [p.id, p]));
  const levelInfo = getPathLevelInfo(details);

  const scale = config.globalScale;
  const scaledMidRadius = config.midLevelRadius * scale;
  const scaledRadiusStep = config.radiusStep * scale;
  const scaledMinRadius = config.minRadius * scale;
  // console.log(`Scaled Radii: Mid=${scaledMidRadius.toFixed(1)}, Step=${scaledRadiusStep.toFixed(1)}, Min=${scaledMinRadius.toFixed(1)}`);

  const pathDetails = new Map<string, PositionDetail[]>();
  details.forEach(detail => { if (!pathDetails.has(detail.career_path_id)) pathDetails.set(detail.career_path_id, []); pathDetails.get(detail.career_path_id)!.push(detail); });

  pathDetails.forEach((pathNodes) => {
    pathNodes.sort((a, b) => {
      const levelDiff = a.level - b.level;
      if (levelDiff !== 0) return levelDiff;
      if (a.sequence_in_path != null && b.sequence_in_path != null) {
        return a.sequence_in_path - b.sequence_in_path;
      }
      return 0;
    });
  });

  const nodes: LayoutNode[] = [];
  const nodeVariationFactor = 0.20; // Increased variation slightly

  pathDetails.forEach((pathNodes, pathId) => {
    if (pathNodes.length === 0) return;
    const initialPathAngle = pathAngles.get(pathId) ?? 0;
    const pathLevelInfo = levelInfo.pathLevels.get(pathId);
    if (!pathLevelInfo) return;

    const mainVector = getPolarVector(initialPathAngle);
    const oppositeVector = getPolarVector((initialPathAngle + 180) % 360);

    pathNodes.forEach((detail) => {
      const position = posMap.get(detail.position_id);
      if (!position) return;

      const isSeniorNode = detail.level > pathLevelInfo.mid;
      const directionVector = isSeniorNode ? oppositeVector : mainVector;

      let radius = scaledMidRadius;
      const levelDiff = Math.abs(detail.level - pathLevelInfo.mid);
      const pathMaxDeviation = Math.max(pathLevelInfo.mid - pathLevelInfo.min, pathLevelInfo.max - pathLevelInfo.mid, 0.5);

      if (pathMaxDeviation > 0 && levelDiff > 0) {
        const normalizedDiff = levelDiff / pathMaxDeviation;
        radius += normalizedDiff * scaledRadiusStep;
      }

      const variationHash = simpleHash(detail.id);
      const radiusVariation = (variationHash / 50 - 1) * scaledRadiusStep * nodeVariationFactor;
      radius += radiusVariation;

      radius = Math.max(radius, scaledMinRadius);

      const x = directionVector.dx * radius;
      const y = directionVector.dy * radius;

      nodes.push({
        id: detail.id, positionId: detail.position_id, careerPathId: detail.career_path_id,
        level: detail.level, name: position.name, x, y,
        color: "#cccccc", sequence_in_path: detail.sequence_in_path, isInterchange: false,
      });
    });
  });
  // console.log(`Added ${ (nodeVariationFactor * 100).toFixed(0) }% radius variation to initial placement.`);
  return nodes;
}
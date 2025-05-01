// src/app/_components/metro/engine/calculations.ts
import type { PositionDetail } from '~/types/compass';

/**
 * Shared utility functions for layout calculations
 */

/**
 * Calculates centrality scores for each position based on how many paths it appears in.
 * Positions that appear in multiple paths act as interchange stations.
 * 
 * @param positionDetails Array of position details
 * @returns Map of position IDs to centrality scores
 */
export function calculateCentrality(positionDetails: PositionDetail[]): Map<string, number> {
  const centralityScores = new Map<string, number>();
  const uniquePositionPathPairs = new Set<string>();

  // Count unique career paths for each position
  positionDetails.forEach(detail => {
    const pairKey = `${detail.position_id}-${detail.career_path_id}`;
    if (!uniquePositionPathPairs.has(pairKey)) {
      const currentScore = centralityScores.get(detail.position_id) || 0;
      centralityScores.set(detail.position_id, currentScore + 1);
      uniquePositionPathPairs.add(pairKey);
    }
  });

  return centralityScores;
}

/**
 * Group position details by career path
 * 
 * @param positionDetails Array of position details
 * @returns Map of career path IDs to arrays of position details
 */
export function groupDetailsByPath(positionDetails: PositionDetail[]): Map<string, PositionDetail[]> {
  const detailsByPath = new Map<string, PositionDetail[]>();
  
  positionDetails.forEach(detail => {
    if (!detailsByPath.has(detail.career_path_id)) {
      detailsByPath.set(detail.career_path_id, []);
    }
    detailsByPath.get(detail.career_path_id)?.push(detail);
  });
  
  return detailsByPath;
}

/**
 * Find level ranges in the career framework
 * 
 * @param positionDetails Array of position details
 * @returns Object containing min, max, and mid level values
 */
export function calculateLevelRanges(positionDetails: PositionDetail[]): { 
  min: number, 
  max: number, 
  mid: number 
} {
  let minLevel = Infinity;
  let maxLevel = -Infinity;
  
  positionDetails.forEach(detail => {
    minLevel = Math.min(minLevel, detail.level);
    maxLevel = Math.max(maxLevel, detail.level);
  });
  
  // Fallback to 1 if no details exist
  if (minLevel === Infinity) minLevel = 1;
  if (maxLevel === -Infinity) maxLevel = 1;
  
  return {
    min: minLevel,
    max: maxLevel,
    mid: (minLevel + maxLevel) / 2
  };
}

/**
 * Map positions to all career paths they appear in
 * 
 * @param positionDetails Array of position details 
 * @returns Map of position IDs to arrays of career path IDs
 */
export function mapPositionsToPaths(positionDetails: PositionDetail[]): Map<string, string[]> {
  const pathsByPosition = new Map<string, string[]>();
  
  positionDetails.forEach(detail => {
    if (!pathsByPosition.has(detail.position_id)) {
      pathsByPosition.set(detail.position_id, []);
    }
    pathsByPosition.get(detail.position_id)?.push(detail.career_path_id);
  });
  
  return pathsByPosition;
}

/**
 * Calculates the optimal node sort order for a path 
 * 
 * @param nodes Array of nodes to sort 
 * @returns Sorted array of nodes
 */
export function sortPathNodes<T extends { level: number, sequence_in_path?: number | null }>(nodes: T[]): T[] {
  return [...nodes].sort((a, b) => {
    // First sort by level
    const levelDiff = a.level - b.level;
    if (levelDiff !== 0) return levelDiff;

    // If levels are the same, try to sort by sequence_in_path if available
    const aSeq = a.sequence_in_path ?? null;
    const bSeq = b.sequence_in_path ?? null;

    if (aSeq !== null && bSeq !== null) {
      return aSeq - bSeq;
    }

    // Default to original order if sequence not available
    return 0;
  });
}
// src/app/_components/metro/engine/layoutUtils.ts

import type { LayoutNode, LayoutBounds, PositionDetail } from './types';

/**
 * Calculates the bounding box encompassing all provided nodes.
 * Adds padding around the calculated min/max values.
 */
export function calculateBounds(nodes: LayoutNode[], padding: number = 40): LayoutBounds {
    if (nodes.length === 0) {
        return { minX: -padding, maxX: padding, minY: -padding, maxY: padding };
    }

    // Find the extent of all nodes
    let minX = nodes[0].x;
    let maxX = nodes[0].x;
    let minY = nodes[0].y;
    let maxY = nodes[0].y;

    // Process all nodes to find extremes
    for (let i = 1; i < nodes.length; i++) {
        minX = Math.min(minX, nodes[i].x);
        maxX = Math.max(maxX, nodes[i].x);
        minY = Math.min(minY, nodes[i].y);
        maxY = Math.max(maxY, nodes[i].y);
    }

    // Add padding to ensure nodes aren't at the very edge
    return {
        minX: minX - padding,
        maxX: maxX + padding,
        minY: minY - padding,
        maxY: maxY + padding,
    };
}

/**
 * Finds the minimum, maximum, and middle level from position details.
 * Handles edge cases gracefully.
 */
export function getLevelInfo(positionDetails: PositionDetail[]): 
    { minLevel: number; maxLevel: number; midLevel: number } {
    
    if (positionDetails.length === 0) {
        return { minLevel: 1, maxLevel: 1, midLevel: 1 };
    }

    let minLevel = Infinity;
    let maxLevel = -Infinity;
    
    // Find min and max levels
    positionDetails.forEach(detail => {
        minLevel = Math.min(minLevel, detail.level);
        maxLevel = Math.max(maxLevel, detail.level);
    });

    // Handle edge cases where min/max might still be Infinity
    if (minLevel === Infinity) minLevel = 1;
    if (maxLevel === -Infinity) maxLevel = minLevel;

    // Calculate middle level
    const midLevel = (minLevel + maxLevel) / 2;
    
    return { minLevel, maxLevel, midLevel };
}

/**
 * Maps positions to the paths they appear in.
 * Essential for identifying interchange nodes.
 */
export function mapPathsToPositions(positionDetails: PositionDetail[]): Map<string, string[]> {
    const pathsByPosition = new Map<string, string[]>();
    
    positionDetails.forEach(detail => {
        // Initialize if position hasn't been seen yet
        if (!pathsByPosition.has(detail.position_id)) {
            pathsByPosition.set(detail.position_id, []);
        }
        
        // Get current paths for this position
        const paths = pathsByPosition.get(detail.position_id)!;
        
        // Add path ID if not already in the list
        if (!paths.includes(detail.career_path_id)) {
            paths.push(detail.career_path_id);
        }
    });
    
    return pathsByPosition;
}

/**
 * Creates a distribution map of position levels to help with layout decisions
 */
export function analyzeLevelDistribution(positionDetails: PositionDetail[]): 
    { [level: number]: number } {
    
    const levelCounts: { [level: number]: number } = {};
    
    // Count positions at each level
    positionDetails.forEach(detail => {
        if (!levelCounts[detail.level]) {
            levelCounts[detail.level] = 0;
        }
        levelCounts[detail.level]++;
    });
    
    return levelCounts;
}

/**
 * Calculates path complexity metrics to help with layout decisions
 * @returns Object with metrics about path complexity
 */
export function analyzePathComplexity(
    positionDetails: PositionDetail[],
    pathsByPosition: Map<string, string[]>
): {
    maxPathLength: number;
    avgPathLength: number;
    interchangeRatio: number;
    pathLengths: { [pathId: string]: number };
} {
    // Group details by path
    const detailsByPath = new Map<string, PositionDetail[]>();
    
    positionDetails.forEach(detail => {
        if (!detailsByPath.has(detail.career_path_id)) {
            detailsByPath.set(detail.career_path_id, []);
        }
        detailsByPath.get(detail.career_path_id)!.push(detail);
    });
    
    // Calculate path lengths
    const pathLengths: { [pathId: string]: number } = {};
    let totalLength = 0;
    let maxLength = 0;
    
    detailsByPath.forEach((details, pathId) => {
        pathLengths[pathId] = details.length;
        totalLength += details.length;
        maxLength = Math.max(maxLength, details.length);
    });
    
    // Calculate average path length
    const avgPathLength = totalLength / Math.max(1, detailsByPath.size);
    
    // Calculate interchange ratio
    const totalPositions = new Set(positionDetails.map(d => d.position_id)).size;
    const interchangePositions = Array.from(pathsByPosition.values())
        .filter(paths => paths.length > 1).length;
    
    const interchangeRatio = totalPositions > 0 ? 
        interchangePositions / totalPositions : 0;
    
    return {
        maxPathLength: maxLength,
        avgPathLength,
        interchangeRatio,
        pathLengths
    };
}
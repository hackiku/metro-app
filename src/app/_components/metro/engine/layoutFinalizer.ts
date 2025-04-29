// src/app/_components/metro/engine/layoutFinalizer.ts

import type { LayoutNode, LayoutPath, PositionDetail, PolarGridConfig, PolarPoint } from './types';
import { polarToCartesian } from './polarGridConfig';
import { calculateIdealPolarPosition, snapToPolarGrid } from './nodePlacement';

/**
 * Calculates the average polar position for interchange nodes.
 */
function calculateInterchangeAveragePosition(
    detail: PositionDetail,
    relatedPathIds: string[],
    pathAngles: Map<string, number>,
    levelInfo: { minLevel: number; maxLevel: number; midLevel: number },
    config: PolarGridConfig
): PolarPoint {
    let totalRadius = 0;
    let avgAngleX = 0; // Use vector averaging for angles
    let avgAngleY = 0;

    relatedPathIds.forEach(pathId => {
        const tempDetail = { ...detail, career_path_id: pathId }; // Simulate detail on other path
        const idealPos = calculateIdealPolarPosition(tempDetail, pathAngles, levelInfo, config);
        totalRadius += idealPos.radius;

        const angleRad = idealPos.angleDegrees * (Math.PI / 180);
        avgAngleX += Math.cos(angleRad);
        avgAngleY += Math.sin(angleRad);
    });

    const avgRadius = totalRadius / relatedPathIds.length;
    const avgAngleRad = Math.atan2(avgAngleY, avgAngleX);
    const avgAngleDegrees = (avgAngleRad * (180 / Math.PI) + 360) % 360; // Normalize

    return { radius: avgRadius, angleDegrees: avgAngleDegrees };
}


/**
 * Creates final LayoutNode objects, adjusting for interchanges and snapping to grid.
 */
export function finalizeNodePositions(
    positionDetails: PositionDetail[],
    positionMap: Map<string, { name: string }>, // Map positionId to Position info
    pathAngles: Map<string, number>,
    pathsByPosition: Map<string, string[]>, // Map positionId to array of pathIds
    levelInfo: { minLevel: number; maxLevel: number; midLevel: number },
    config: PolarGridConfig,
    careerPathMap: Map<string, { color?: string | null }> // Map pathId to path info
): LayoutNode[] {

    const nodes: LayoutNode[] = [];
    const nodesById: Record<string, LayoutNode> = {}; // Temp lookup during creation

    positionDetails.forEach(detail => {
        const position = positionMap.get(detail.position_id);
        const pathInfo = careerPathMap.get(detail.career_path_id);
        if (!position || !pathInfo) return; // Skip if data missing

        const relatedPathIds = pathsByPosition.get(detail.position_id) || [detail.career_path_id];
        const isInterchange = relatedPathIds.length > 1;

        // 1. Calculate ideal position based on its primary path
        let targetPosition = calculateIdealPolarPosition(detail, pathAngles, levelInfo, config);

        // 2. Adjust for interchanges (pull towards average)
        if (isInterchange && config.pullInterchanges && config.pullInterchanges > 0) {
            const avgPosition = calculateInterchangeAveragePosition(detail, relatedPathIds, pathAngles, levelInfo, config);

            // Interpolate between ideal and average based on pull factor
            // Interpolate radius linearly
            targetPosition.radius = targetPosition.radius * (1 - config.pullInterchanges) + avgPosition.radius * config.pullInterchanges;

            // Interpolate angle carefully (shortest path)
            let angleDiff = avgPosition.angleDegrees - targetPosition.angleDegrees;
            angleDiff = (angleDiff + 180) % 360 - 180; // Handle wrap-around
            targetPosition.angleDegrees = (targetPosition.angleDegrees + angleDiff * config.pullInterchanges + 360) % 360;
        }

        // 3. Snap the final target position to the polar grid (primarily angle snapping for now)
        const finalPolarPosition = snapToPolarGrid(targetPosition, config);

        // 4. Convert final polar coordinates to Cartesian
        const { x, y } = polarToCartesian(finalPolarPosition.radius, finalPolarPosition.angleDegrees);

        // 5. Create LayoutNode
        const node: LayoutNode = {
            id: detail.id,
            positionId: detail.position_id,
            careerPathId: detail.career_path_id,
            level: detail.level,
            name: position.name,
            x,
            y,
            color: pathInfo.color || '#cccccc',
            isInterchange,
            relatedPaths: isInterchange ? relatedPathIds : undefined,
            sequence_in_path: detail.sequence_in_path
        };

        nodes.push(node);
        nodesById[node.id] = node; // Add to temporary lookup
    });

    // Optional Step: Add collision avoidance or overlap reduction here if needed later
    // ...

    return nodes;
}

/**
 * Builds the final LayoutPath objects with correctly ordered node IDs.
 */
export function buildLayoutPaths(
    careerPaths: CareerPath[],
    allNodes: LayoutNode[],
    config: PolarGridConfig
): LayoutPath[] {
    const paths: LayoutPath[] = [];

    careerPaths.forEach(path => {
        // Filter nodes belonging to this path
        const pathNodes = allNodes.filter(n => n.careerPathId === path.id);

        // Sort nodes based on the configured key (level or sequence)
        pathNodes.sort((a, b) => {
            if (config.nodeSortKey === 'sequence_in_path') {
                 // Ensure null/undefined sequence numbers don't break sorting
                const seqA = a.sequence_in_path ?? Infinity;
                const seqB = b.sequence_in_path ?? Infinity;
                if (seqA !== Infinity || seqB !== Infinity) { // Check if at least one has a sequence
                    if (seqA !== seqB) return seqA - seqB;
                    // Fallback to level if sequences are equal or one is missing
                 }
            }
             // Sort by level if key is 'level' or as fallback
            return a.level - b.level;
        });

        // Create the LayoutPath object
        paths.push({
            id: path.id,
            name: path.name,
            color: path.color || '#cccccc',
            nodes: pathNodes.map(n => n.id), // Store only the ordered node IDs
        });
    });

    return paths;
}
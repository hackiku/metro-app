// src/app/_components/metro/engine/layoutFinalizer.ts

import type { LayoutNode, LayoutPath, PositionDetail, PolarGridConfig, PolarPoint } from './types';
import { polarToCartesian } from './polarGridConfig';
import { calculateIdealPolarPosition, snapToPolarGrid } from './nodePlacement';

/**
 * Enhanced logic for calculating interchange node positions
 * Creates more visually balanced positioning for nodes that appear in multiple paths
 */
function calculateEnhancedInterchangePosition(
    detail: PositionDetail,
    relatedPathIds: string[],
    pathAngles: Map<string, number>,
    levelInfo: { minLevel: number; maxLevel: number; midLevel: number },
    config: PolarGridConfig
): PolarPoint {
    // Starting with a weighted vector approach for angle calculation
    let totalRadius = 0;
    let avgAngleX = 0; // Using vector averaging for angles
    let avgAngleY = 0;
    
    // Process each related path
    relatedPathIds.forEach(pathId => {
        // Create a temporary detail to simulate this node's position if it were only on this path
        const tempDetail = { ...detail, career_path_id: pathId };
        
        // Calculate ideal position for this path
        const idealPos = calculateIdealPolarPosition(tempDetail, pathAngles, levelInfo, config);
        
        // Add to total radius (will be averaged later)
        totalRadius += idealPos.radius;

        // Convert angle to vector components for proper averaging
        const angleRad = idealPos.angleDegrees * (Math.PI / 180);
        avgAngleX += Math.cos(angleRad);
        avgAngleY += Math.sin(angleRad);
    });

    // Calculate average radius
    const avgRadius = totalRadius / relatedPathIds.length;
    
    // Calculate average angle using vector components (handles wraparound correctly)
    const avgAngleRad = Math.atan2(avgAngleY, avgAngleX);
    const avgAngleDegrees = (avgAngleRad * (180 / Math.PI) + 360) % 360; // Normalize to 0-360

    return { radius: avgRadius, angleDegrees: avgAngleDegrees };
}

/**
 * Creates final LayoutNode objects with enhanced interchange positioning
 */
export function finalizeNodePositions(
    positionDetails: PositionDetail[],
    positionMap: Map<string, { name: string }>,
    pathAngles: Map<string, number>,
    pathsByPosition: Map<string, string[]>,
    levelInfo: { minLevel: number; maxLevel: number; midLevel: number },
    config: PolarGridConfig,
    careerPathMap: Map<string, { color?: string | null }>
): LayoutNode[] {
    const nodes: LayoutNode[] = [];
    
    // Process each position detail to create a node
    positionDetails.forEach(detail => {
        const position = positionMap.get(detail.position_id);
        const pathInfo = careerPathMap.get(detail.career_path_id);
        
        // Skip if required data is missing
        if (!position || !pathInfo) return;

        // Get all paths this position appears in
        const relatedPathIds = pathsByPosition.get(detail.position_id) || [detail.career_path_id];
        const isInterchange = relatedPathIds.length > 1;

        // 1. Calculate ideal position based on primary path
        let targetPosition = calculateIdealPolarPosition(detail, pathAngles, levelInfo, config);

        // 2. For interchange nodes, adjust position based on all paths it belongs to
        if (isInterchange && config.pullInterchanges && config.pullInterchanges > 0) {
            const avgPosition = calculateEnhancedInterchangePosition(
                detail, 
                relatedPathIds, 
                pathAngles, 
                levelInfo, 
                config
            );

            // Interpolate between ideal position and average position based on pull factor
            // For radius: linear interpolation
            targetPosition.radius = targetPosition.radius * (1 - config.pullInterchanges) + 
                                  avgPosition.radius * config.pullInterchanges;

            // For angle: need to handle the circular nature properly
            let angleDiff = avgPosition.angleDegrees - targetPosition.angleDegrees;
            // Handle wraparound (e.g., 350° and 10° should have a diff of 20°, not 340°)
            angleDiff = ((angleDiff + 180) % 360) - 180;
            targetPosition.angleDegrees = (targetPosition.angleDegrees + 
                                        angleDiff * config.pullInterchanges + 360) % 360;
        }

        // 3. Snap the position to grid if configured
        const finalPolarPosition = snapToPolarGrid(targetPosition, config);

        // 4. Convert polar coordinates to Cartesian (x,y)
        const { x, y } = polarToCartesian(
            finalPolarPosition.radius, 
            finalPolarPosition.angleDegrees
        );

        // 5. Create the LayoutNode
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
    });

    return nodes;
}

/**
 * Builds final LayoutPath objects with properly ordered nodes
 */
export function buildLayoutPaths(
    careerPaths: CareerPath[],
    allNodes: LayoutNode[],
    config: PolarGridConfig
): LayoutPath[] {
    const paths: LayoutPath[] = [];

    careerPaths.forEach(path => {
        // Get all nodes for this path
        const pathNodes = allNodes.filter(node => node.careerPathId === path.id);
        
        // Skip empty paths
        if (pathNodes.length === 0) return;

        // Sort nodes based on config setting (level or sequence)
        pathNodes.sort((a, b) => {
            // If sort key is sequence_in_path and both nodes have sequence values
            if (config.nodeSortKey === 'sequence_in_path') {
                // Handle null/undefined sequence values safely
                const seqA = a.sequence_in_path ?? Infinity;
                const seqB = b.sequence_in_path ?? Infinity;
                
                // If at least one has a valid sequence
                if (seqA !== Infinity || seqB !== Infinity) {
                    // Sort by sequence if they differ
                    if (seqA !== seqB) return seqA - seqB;
                    // Otherwise fall through to level sorting
                }
            }
            
            // Sort by level (default or fallback)
            const levelDiff = a.level - b.level;
            if (levelDiff !== 0) return levelDiff;
            
            // If levels are equal, sort by distance from center
            const distA = Math.sqrt(a.x * a.x + a.y * a.y);
            const distB = Math.sqrt(b.x * b.x + b.y * b.y);
            return distA - distB;
        });

        // Create the LayoutPath with ordered nodes
        paths.push({
            id: path.id,
            name: path.name,
            color: path.color || '#cccccc',
            nodes: pathNodes.map(node => node.id),
        });
    });

    return paths;
}
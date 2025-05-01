// src/app/_components/metro/engine/nodePlacement.ts

import type { CareerPath, PositionDetail, PolarGridConfig, PolarPoint } from './types';
import { getLevelInfo } from './layoutUtils';
import { getAngleStep, snapToNearestAngle, calculateEnhancedRadius } from './polarGridConfig';

/**
 * Assigns angles to career paths with improved distribution
 * Ensures paths are not evenly distributed if pathSpacingFactor > 1
 */
export function assignPathAngles(
    careerPaths: CareerPath[],
    config: PolarGridConfig
): Map<string, number> {
    const pathAngles = new Map<string, number>();
    const numPaths = careerPaths.length;
    
    if (numPaths === 0) return pathAngles;
    
    // Sort paths for consistent angle assignment (e.g., by name or ID)
    const sortedPaths = [...careerPaths].sort((a, b) => a.id.localeCompare(b.id));
    
    // If only one path, place it at the base angle
    if (numPaths === 1) {
        pathAngles.set(sortedPaths[0].id, config.angleOffsetDegrees || 0);
        return pathAngles;
    }
    
    // For multiple paths, distribute them around the circle
    const angleStep = getAngleStep(config);
    const spacingFactor = config.pathSpacingFactor || 1.0;
    
    // Create uneven distribution for more natural appearance
    sortedPaths.forEach((path, index) => {
        // Apply spacing factor to create non-uniform distribution
        // This creates clusters of paths rather than perfect distribution
        const adjustedIndex = index * spacingFactor;
        const normalizedIndex = adjustedIndex % numPaths;
        
        // Calculate angle with base offset
        const baseAngle = (config.angleOffsetDegrees || 0) + (normalizedIndex / numPaths) * 360;
        
        // Snap angle to grid if required
        const finalAngle = config.snapPathsToGrid ? 
            snapToNearestAngle(baseAngle, config) : baseAngle;
            
        pathAngles.set(path.id, finalAngle);
    });

    return pathAngles;
}

/**
 * Calculates the target radius for a node based on its level, with improved scaling
 */
export function calculateNodeRadius(
    level: number,
    levelInfo: { minLevel: number; maxLevel: number; midLevel: number },
    config: PolarGridConfig
): number {
    // Use enhanced radius calculation for better distribution
    return calculateEnhancedRadius(level, levelInfo, config);
}

/**
 * Adds slight jitter to positions to prevent perfect alignment
 */
export function addPositionJitter(
    position: PolarPoint,
    config: PolarGridConfig,
    nodeId: string // Use node ID as seed for consistent jitter
): PolarPoint {
    if (!config.useJitter) return position;
    
    // Create a deterministic but seemingly random value based on nodeId
    const seed = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitterSeed = Math.sin(seed) * 10000;
    
    // Apply small jitter to both radius and angle (1-3% variation)
    const jitterAmount = config.jitterAmount || 0.02; // Default to 2%
    const radiusJitter = 1 + (jitterSeed % 1) * jitterAmount - (jitterAmount / 2);
    const angleJitter = ((jitterSeed * 7) % 1) * jitterAmount * 10 - (jitterAmount * 5);
    
    return {
        radius: position.radius * radiusJitter,
        angleDegrees: position.angleDegrees + angleJitter
    };
}

/**
 * Calculates the 'ideal' polar coordinates (radius, angle) for a single node detail.
 */
export function calculateIdealPolarPosition(
    detail: PositionDetail,
    pathAngles: Map<string, number>,
    levelInfo: { minLevel: number; maxLevel: number; midLevel: number },
    config: PolarGridConfig
): PolarPoint {
    const radius = calculateNodeRadius(detail.level, levelInfo, config);
    const angleDegrees = pathAngles.get(detail.career_path_id) || 0; // Default to 0 if path not found

    // Apply jitter for more natural appearance
    return addPositionJitter({
        radius, 
        angleDegrees
    }, config, detail.id);
}

/**
 * Snaps an ideal polar position to the discrete grid points (radius rings, angle steps).
 */
export function snapToPolarGrid(
    idealPosition: PolarPoint,
    config: PolarGridConfig
): PolarPoint {
    const snappedAngle = snapToNearestAngle(idealPosition.angleDegrees, config);

    // Option to snap radius to discrete rings if needed
    let snappedRadius = idealPosition.radius;
    if (config.snapRadiusToGrid) {
        const ringStep = config.radiusRingStep || config.radiusStep;
        snappedRadius = Math.round(idealPosition.radius / ringStep) * ringStep;
        snappedRadius = Math.max(snappedRadius, config.minRadius || 0);
    }

    return { radius: snappedRadius, angleDegrees: snappedAngle };
}
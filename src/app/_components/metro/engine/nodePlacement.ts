// src/app/_components/metro/engine/nodePlacement.ts

import type { CareerPath, PositionDetail, PolarGridConfig, PolarPoint } from './types';
import { getLevelInfo } from './layoutUtils';
import { getAngleStep, snapToNearestAngle } from './polarGridConfig';

/**
 * Assigns a base angle to each career path.
 */
export function assignPathAngles(
    careerPaths: CareerPath[],
    config: PolarGridConfig
): Map<string, number> {
    const pathAngles = new Map<string, number>();
    const numPaths = careerPaths.length;
    const angleStep = getAngleStep(config);

    // Sort paths for consistent angle assignment (e.g., by name or ID)
    const sortedPaths = [...careerPaths].sort((a, b) => a.id.localeCompare(b.id));

    sortedPaths.forEach((path, index) => {
        const baseAngle = (config.angleOffsetDegrees || 0) + index * angleStep;
        pathAngles.set(path.id, baseAngle);
    });

    return pathAngles;
}

/**
 * Calculates the target radius for a node based on its level and config.
 * Implements the "midpoint focus" logic.
 */
export function calculateNodeRadius(
    level: number,
    levelInfo: { minLevel: number; maxLevel: number; midLevel: number },
    config: PolarGridConfig
): number {
    const { midLevel } = levelInfo;
    const { midLevelRadius, radiusStep, minRadius = 0 } = config;

    // Calculate how many steps away the level is from the mid-level
    const levelDifference = level - midLevel;

    // Calculate radius based on difference from middle
    // Nodes at midLevel are at midLevelRadius
    // Nodes further away (positive or negative difference) increase radius
    const radius = midLevelRadius + Math.abs(levelDifference) * radiusStep;

    // Ensure radius doesn't go below the minimum configured radius
    return Math.max(radius, minRadius);
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

    return { radius, angleDegrees };
}

/**
 * Snaps an ideal polar position to the discrete grid points (radius rings, angle steps).
 * Currently only snaps angle, radius is kept continuous based on level.
 * Future enhancement could snap radius to discrete rings too.
 */
export function snapToPolarGrid(
    idealPosition: PolarPoint,
    config: PolarGridConfig
): PolarPoint {
    const snappedAngle = snapToNearestAngle(idealPosition.angleDegrees, config);

    // For now, keep radius continuous. Snapping radius would require mapping
    // calculated radius to the nearest discrete ring radius based on config.
    const snappedRadius = idealPosition.radius;

    return { radius: snappedRadius, angleDegrees: snappedAngle };
}
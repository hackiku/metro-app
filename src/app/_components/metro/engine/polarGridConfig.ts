// src/app/_components/metro/engine/polarGridConfig.ts

import type { PolarGridConfig } from './types';

export const DEFAULT_POLAR_GRID_CONFIG: PolarGridConfig = {
	layoutType: 'polarGrid',

	// Radius - Significantly increased for better spacing
	midLevelRadius: 300,       // Increase the middle level radius for more space
	radiusStep: 150,           // Larger steps between levels
	minRadius: 100,            // Increased minimum radius to prevent center crowding

	// Angles
	numAngleSteps: 8,          // 8 directions (0, 45, 90, 135, 180, etc.)
	angleOffsetDegrees: 22.5,  // Offset by half a step to avoid perfect horizontal/vertical

	// Placement
	levelGrouping: 'nearest',  // Group levels to the closest radius ring
	pullInterchanges: 0.3,     // Reduced pull to maintain path clarity

	// General
	padding: 80,               // Increased padding
	nodeSortKey: 'level',      // Sort nodes primarily by level for path drawing

	// Path Distribution
	pathSpacingFactor: 1.5,    // Added: Control angular spacing between adjacent paths
	levelSpreadFactor: 1.0     // Added: Control how much levels spread outward
};

/**
 * Calculates the discrete angle step in degrees.
 * @param config - The PolarGridConfig object
 * @returns Angle step in degrees
 */
export function getAngleStep(config: PolarGridConfig): number {
	// Ensure numAngleSteps is at least 1 to avoid division by zero
	return 360 / Math.max(1, config.numAngleSteps);
}

/**
 * Converts polar coordinates (radius, angle in degrees) to Cartesian (x, y).
 * @param radius - The distance from the origin.
 * @param angleDegrees - The angle in degrees (0 degrees is along the positive X-axis).
 * @returns An object containing x and y coordinates.
 */
export function polarToCartesian(radius: number, angleDegrees: number): { x: number; y: number } {
	const angleRadians = angleDegrees * (Math.PI / 180);
	const x = radius * Math.cos(angleRadians);
	const y = radius * Math.sin(angleRadians);
	return { x, y };
}

/**
 * Finds the nearest discrete angle allowed by the config.
 * @param angleDegrees - The target angle.
 * @param config - The PolarGridConfig object.
 * @returns The closest discrete angle in degrees.
 */
export function snapToNearestAngle(angleDegrees: number, config: PolarGridConfig): number {
	const angleStep = getAngleStep(config);
	// Handle potential division by zero if angleStep is 0
	if (angleStep === 0) return config.angleOffsetDegrees || 0;

	const offsetAngle = angleDegrees - (config.angleOffsetDegrees || 0);
	// More robust rounding:
	const stepIndex = Math.floor(offsetAngle / angleStep + 0.5);

	const snappedAngle = stepIndex * angleStep + (config.angleOffsetDegrees || 0);
	// Normalize angle to be within [0, 360)
	return ((snappedAngle % 360) + 360) % 360;
}

/**
 * Calculates a radius based on level using a non-linear scaling function
 * to create better distribution of levels
 */
export function calculateEnhancedRadius(
	level: number,
	levelInfo: { minLevel: number; maxLevel: number; midLevel: number },
	config: PolarGridConfig
): number {
	const { minLevel, maxLevel, midLevel } = levelInfo;
	const { midLevelRadius, radiusStep, minRadius = 0, levelSpreadFactor = 1.0 } = config;

	// Calculate normalized position in level range (0 to 1)
	const levelRange = maxLevel - minLevel;
	if (levelRange === 0) return midLevelRadius; // Handle edge case

	const normalizedLevel = (level - minLevel) / levelRange;

	// Apply non-linear scaling - this creates more space between levels as they move outward
	// Square root function gives more space to higher levels, multiplier controls intensity
	const scalingFactor = Math.pow(normalizedLevel, 0.5) * levelSpreadFactor;

	// Calculate radius based on normalized position
	const radius = minRadius + (midLevelRadius - minRadius) + (scalingFactor * radiusStep * levelRange);

	return Math.max(radius, minRadius);
}
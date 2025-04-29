// src/app/_components/metro/engine/polarGridConfig.ts

import type { PolarGridConfig } from './types';

export const DEFAULT_POLAR_GRID_CONFIG: PolarGridConfig = {
	layoutType: 'polarGrid',
	// Radius
	midLevelRadius: 100,        // Middle levels will be around this radius
	radiusStep: 60,           // Each level step away from middle adds/subtracts this radius
	minRadius: 40,            // Ensure innermost ring isn't too small
	// Angles
	numAngleSteps: 8,           // 8 directions (0, 45, 90, 135, 180, etc.)
	angleOffsetDegrees: 0,      // Start angles at 0 degrees (right)
	// Placement
	levelGrouping: 'nearest',   // Group levels to the closest radius ring
	pullInterchanges: 0.5,      // Moderately pull interchanges towards their average location
	// General
	padding: 50,                // Padding for bounds calculation
	nodeSortKey: 'level',       // Sort nodes primarily by level for path drawing
};

/**
 * Calculates the discrete angle step in degrees.
 * @param config - The PolarGridConfig object
 * @returns Angle step in degrees
 */
export function getAngleStep(config: PolarGridConfig): number {
	return 360 / config.numAngleSteps;
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
	const offsetAngle = angleDegrees - (config.angleOffsetDegrees || 0);
	const stepIndex = Math.round(offsetAngle / angleStep);
	const snappedAngle = stepIndex * angleStep + (config.angleOffsetDegrees || 0);
	// Normalize angle to be within [0, 360) or similar range if needed
	return ((snappedAngle % 360) + 360) % 360;
}
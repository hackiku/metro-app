// src/app/_components/metro/services/layoutService.ts

import { CareerPath, Role } from "../types";

export interface LayoutConfig {
	// Base padding from edges
	padding: number;

	// Spacing between levels (horizontally)
	levelSpacing: number;

	// Spacing between lines (vertically)
	pathSpacing: number;

	// Node sizing
	nodeRadius: number;
}

// Default configuration
const DEFAULT_CONFIG: LayoutConfig = {
	padding: 50,
	levelSpacing: 150,
	pathSpacing: 100,
	nodeRadius: 12
};

/**
 * Calculates positions for roles in a metro-map layout
 */
export function calculateLayout(
	careerPaths: CareerPath[],
	config: Partial<LayoutConfig> = {}
): CareerPath[] {
	// Merge provided config with defaults
	const layoutConfig: LayoutConfig = {
		...DEFAULT_CONFIG,
		...config
	};

	// Create a deep copy to avoid modifying the original data
	const processedPaths = JSON.parse(JSON.stringify(careerPaths)) as CareerPath[];

	// Position each career path and its roles
	processedPaths.forEach((path, pathIndex) => {
		// Calculate the base y-position for this path
		const baseY = layoutConfig.padding + (pathIndex * layoutConfig.pathSpacing);

		// Position each role on this path
		path.roles.forEach(role => {
			// Base position is determined by the role's level
			role.x = layoutConfig.padding + (role.level * layoutConfig.levelSpacing);
			role.y = baseY;
		});
	});

	// Handle role transitions/interchanges
	adjustInterchangePositions(processedPaths, layoutConfig);

	return processedPaths;
}

/**
 * Adjusts positions for roles that appear in multiple career paths
 */
function adjustInterchangePositions(
	careerPaths: CareerPath[],
	config: LayoutConfig
): void {
	// Build a map of role IDs to their occurrences across paths
	const roleOccurrences = new Map<string, { role: Role, pathIndices: number[] }>();

	// First, identify roles that appear in multiple paths
	careerPaths.forEach((path, pathIndex) => {
		path.roles.forEach(role => {
			if (!roleOccurrences.has(role.id)) {
				roleOccurrences.set(role.id, {
					role,
					pathIndices: [pathIndex]
				});
			} else {
				roleOccurrences.get(role.id)?.pathIndices.push(pathIndex);
			}
		});
	});

	// Adjust positions for roles that appear in multiple paths
	roleOccurrences.forEach(occurrence => {
		if (occurrence.pathIndices.length > 1) {
			// Calculate the average y-position
			const avgPathIndex = occurrence.pathIndices.reduce((sum, idx) => sum + idx, 0) /
				occurrence.pathIndices.length;
			const targetY = config.padding + (avgPathIndex * config.pathSpacing);

			// Update the role's y-position in all paths
			occurrence.pathIndices.forEach(pathIndex => {
				const path = careerPaths[pathIndex];
				const role = path.roles.find(r => r.id === occurrence.role.id);
				if (role) {
					role.y = targetY;
				}
			});
		}
	});
}

/**
 * Generates a path string for an SVG line connecting roles in a career path
 */
export function generatePathLine(roles: Role[]): string {
	if (!roles || roles.length < 2) return '';

	// Start from the first point
	let pathData = `M ${roles[0].x},${roles[0].y}`;

	// Add line segments to each subsequent point
	for (let i = 1; i < roles.length; i++) {
		pathData += ` L ${roles[i].x},${roles[i].y}`;
	}

	return pathData;
}

/**
 * Generates an SVG path for a curved connection between two roles
 */
export function generateTransitionPath(fromRole: Role, toRole: Role): string {
	if (!fromRole || !toRole) return '';

	// Simple case: straight line for adjacent levels
	if (Math.abs(fromRole.level - toRole.level) <= 1 &&
		Math.abs(fromRole.y - toRole.y) < config.pathSpacing / 2) {
		return `M ${fromRole.x},${fromRole.y} L ${toRole.x},${toRole.y}`;
	}

	// More complex case: curved path for non-adjacent levels or different paths
	const midX = (fromRole.x + toRole.x) / 2;

	return `
    M ${fromRole.x},${fromRole.y} 
    C ${midX},${fromRole.y} ${midX},${toRole.y} ${toRole.x},${toRole.y}
  `;
}
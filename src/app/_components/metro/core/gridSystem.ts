// src/app/_components/metro/core/gridSystem.ts
import { CareerPath, Role } from '../types';

export interface GridConfig {
	// Base padding from edges
	padding: number;

	// Spacing between levels (horizontally)
	levelSpacing: number;

	// Spacing between paths (vertically)
	pathSpacing: number;

	// Node sizing
	nodeRadius: number;

	// Adjust interchange nodes (nodes that appear in multiple paths)
	adjustInterchanges: boolean;
}

// Default configuration
export const DEFAULT_GRID_CONFIG: GridConfig = {
	padding: 50,
	levelSpacing: 150,
	pathSpacing: 100,
	nodeRadius: 12,
	adjustInterchanges: true
};

/**
 * Calculate initial positions for all roles on a grid
 */
export function calculateGridPositions(
	careerPaths: CareerPath[],
	config: Partial<GridConfig> = {}
): CareerPath[] {
	// Merge defaults with provided config
	const fullConfig: GridConfig = { ...DEFAULT_GRID_CONFIG, ...config };

	// Create a deep copy to avoid modifying the original data
	const processedPaths = JSON.parse(JSON.stringify(careerPaths)) as CareerPath[];

	// First pass: position each role based on its level and path index
	processedPaths.forEach((path, pathIndex) => {
		const baseY = fullConfig.padding + (pathIndex * fullConfig.pathSpacing);

		path.roles.forEach(role => {
			// Position based on level (x) and path (y)
			role.x = fullConfig.padding + (role.level * fullConfig.levelSpacing);
			role.y = baseY;
		});
	});

	// Second pass: adjust positions for roles that appear in multiple paths
	if (fullConfig.adjustInterchanges) {
		// Map to track roles that appear in multiple paths
		const roleOccurrences = new Map<string, { role: Role, pathIndices: number[] }>();

		// First collect all roles and their occurrences
		processedPaths.forEach((path, pathIndex) => {
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

		// Adjust positions for roles in multiple paths
		roleOccurrences.forEach(occurrence => {
			if (occurrence.pathIndices.length > 1) {
				// Calculate average Y position between all paths
				const avgPathIndex = occurrence.pathIndices.reduce((sum, idx) => sum + idx, 0) /
					occurrence.pathIndices.length;

				const targetY = fullConfig.padding + (avgPathIndex * fullConfig.pathSpacing);

				// Update all instances of this role
				occurrence.pathIndices.forEach(pathIndex => {
					const path = processedPaths[pathIndex];
					const role = path.roles.find(r => r.id === occurrence.role.id);
					if (role) {
						role.y = targetY;
					}
				});
			}
		});
	}

	return processedPaths;
}

/**
 * Calculate viewport bounds based on node positions
 */
export function calculateViewBounds(roles: Role[], padding = 50) {
	if (!roles || roles.length === 0) {
		return { minX: 0, minY: 0, maxX: 1000, maxY: 600 };
	}

	const minX = Math.min(...roles.map(role => role.x || 0)) - padding;
	const minY = Math.min(...roles.map(role => role.y || 0)) - padding;
	const maxX = Math.max(...roles.map(role => role.x || 0)) + padding;
	const maxY = Math.max(...roles.map(role => role.y || 0)) + padding;

	return { minX, minY, maxX, maxY };
}
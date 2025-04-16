// src/app/_components/metro/core/gridSystem.ts
import type { CareerPath, Role } from '~/types/career';
import type { MetroMapConfig } from '~/types/map';

/**
 * Calculate initial positions for all roles on a grid
 */
export function calculateGridPositions(
	careerPaths: CareerPath[],
	config: Partial<MetroMapConfig> = {}
): CareerPath[] {
	// Merge defaults with provided config
	const fullConfig: MetroMapConfig = {
		padding: 50,
		levelSpacing: 150,
		pathSpacing: 100,
		nodeRadius: 12,
		adjustInterchanges: true,
		alignLevels: true,
		jitterAmount: 0,
		metroStylePaths: false,
		...config
	};

	// Create a deep copy to avoid modifying the original data
	const processedPaths = JSON.parse(JSON.stringify(careerPaths)) as CareerPath[];

	// First pass: position each role based on its level and path index
	processedPaths.forEach((path, pathIndex) => {
		const baseY = fullConfig.padding + (pathIndex * fullConfig.pathSpacing);

		path.roles.forEach(role => {
			// Add small jitter if configured
			const jitter = fullConfig.jitterAmount > 0
				? (Math.random() * fullConfig.jitterAmount - fullConfig.jitterAmount / 2)
				: 0;

			// Position based on level (x) and path (y)
			role.x = fullConfig.padding + (role.level * fullConfig.levelSpacing) + jitter;
			role.y = baseY;
		});
	});

	// If level alignment is enabled, ensure roles at the same level align horizontally
	if (fullConfig.alignLevels) {
		// Group roles by level
		const rolesByLevel = new Map<number, Role[]>();

		processedPaths.forEach(path => {
			path.roles.forEach(role => {
				if (!rolesByLevel.has(role.level)) {
					rolesByLevel.set(role.level, []);
				}
				rolesByLevel.get(role.level)?.push(role);
			});
		});

		// Ensure all roles at the same level have the same x position
		rolesByLevel.forEach(roles => {
			// Calculate average x position
			const avgX = roles.reduce((sum, role) => sum + (role.x || 0), 0) / roles.length;

			// Assign the same x position to all roles at this level
			roles.forEach(role => {
				role.x = avgX;
			});
		});
	}

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
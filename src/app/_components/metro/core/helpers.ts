// src/app/_components/metro/core/helpers.ts

import type { CareerPath, Role } from '~/types/career';

/**
 * Find a role by ID across all career paths
 */
export function findRoleById(
	roleId: string,
	careerPaths: CareerPath[]
): { role: Role; path: CareerPath } | undefined {
	for (const path of careerPaths) {
		const role = path.roles.find(r => r.id === roleId);
		if (role) {
			return { role, path };
		}
	}
	return undefined;
}

/**
 * Check if a role is an interchange (appears in multiple paths)
 */
export function isInterchangeRole(
	roleId: string,
	careerPaths: CareerPath[]
): boolean {
	const pathIndices: number[] = [];

	careerPaths.forEach((path, index) => {
		if (path.roles.some(r => r.id === roleId)) {
			pathIndices.push(index);
		}
	});

	return pathIndices.length > 1;
}

/**
 * Generate a path string for connecting two points with a curved line
 */
export function generateCurvedPath(
	fromX: number,
	fromY: number,
	toX: number,
	toY: number
): string {
	const midX = (fromX + toX) / 2;

	return `
    M ${fromX},${fromY} 
    C ${midX},${fromY} ${midX},${toY} ${toX},${toY}
  `;
}

/**
 * Generate a unique ID for transitions between roles
 */
export function generateTransitionId(fromRoleId: string, toRoleId: string): string {
	return `transition-${fromRoleId}-${toRoleId}`;
}
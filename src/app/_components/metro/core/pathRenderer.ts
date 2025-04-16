// src/app/_components/metro/core/pathRenderer.ts
import type { Role } from '~/types/career';
import { generateCurvedPath } from './helpers';

/**
 * Generate SVG path data for a career path connecting all roles
 */
export function generatePathLine(roles: Role[]): string {
	if (!roles || roles.length < 2) return '';

	// Sort roles by level to ensure proper ordering
	const sortedRoles = [...roles].sort((a, b) => a.level - b.level);

	// Start path at the first point
	let pathData = `M ${sortedRoles[0].x},${sortedRoles[0].y}`;

	// Add line segments to each subsequent point
	for (let i = 1; i < sortedRoles.length; i++) {
		pathData += ` L ${sortedRoles[i].x},${sortedRoles[i].y}`;
	}

	return pathData;
}

/**
 * Generate a curved connection path between two roles
 */
export function generateTransitionPath(fromRole: Role, toRole: Role): string {
	if (!fromRole?.x || !fromRole?.y || !toRole?.x || !toRole?.y) {
		return '';
	}

	return generateCurvedPath(fromRole.x, fromRole.y, toRole.x, toRole.y);
}
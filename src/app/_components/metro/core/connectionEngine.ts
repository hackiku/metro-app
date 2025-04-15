// src/app/_components/metro/core/connectionEngine.ts
import { CareerPath, Role, Transition } from '../types';
import { findRoleById } from './helpers';

export interface Connection {
	fromRoleId: string;
	toRoleId: string;
	isRecommended: boolean;
	fromRole?: Role;
	toRole?: Role;
	pathColor?: string;
}

/**
 * Process transitions to add role and path information
 */
export function processTransitions(
	transitions: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[],
	careerPaths: CareerPath[]
): Connection[] {
	return transitions
		.map(transition => {
			const fromRoleInfo = findRoleById(transition.fromRoleId, careerPaths);
			const toRoleInfo = findRoleById(transition.toRoleId, careerPaths);

			if (!fromRoleInfo || !toRoleInfo) {
				return null;
			}

			return {
				fromRoleId: transition.fromRoleId,
				toRoleId: transition.toRoleId,
				isRecommended: transition.isRecommended,
				fromRole: fromRoleInfo.role,
				toRole: toRoleInfo.role,
				// Use the color from the "from" path
				pathColor: fromRoleInfo.path.color
			};
		})
		.filter((connection): connection is Connection => connection !== null);
}

/**
 * Find transitions related to a specific role
 */
export function findTransitionsForRole(
	roleId: string,
	transitions: Transition[]
): Transition[] {
	return transitions.filter(
		t => t.fromRoleId === roleId || t.toRoleId === roleId
	);
}

/**
 * Group transitions by career path
 */
export function groupTransitionsByPath(
	transitions: Connection[],
	careerPaths: CareerPath[]
): Record<string, Connection[]> {
	const result: Record<string, Connection[]> = {};

	careerPaths.forEach(path => {
		result[path.id] = transitions.filter(
			t => findRoleById(t.fromRoleId, [path]) || findRoleById(t.toRoleId, [path])
		);
	});

	return result;
}
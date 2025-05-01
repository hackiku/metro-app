// src/app/_components/metro/engine/calculations.ts
import type { CareerPath, Position, PositionDetail } from '~/types/compass';
import type { LayoutPath, LayoutBounds } from './types';

/**
 * Calculates centrality scores for each position based on how many paths it appears in.
 * Positions that appear in multiple paths act as interchange stations.
 */
export function calculateCentrality(positionDetails: PositionDetail[]): Map<string, number> {
	const centralityScores = new Map<string, number>();
	const uniquePositionPathPairs = new Set<string>();

	// Count unique career paths for each position
	positionDetails.forEach(detail => {
		const pairKey = `${detail.position_id}-${detail.career_path_id}`;
		if (!uniquePositionPathPairs.has(pairKey)) {
			const currentScore = centralityScores.get(detail.position_id) || 0;
			centralityScores.set(detail.position_id, currentScore + 1);
			uniquePositionPathPairs.add(pairKey);
		}
	});

	return centralityScores;
}

/**
 * Calculates relationships between career paths based on shared positions.
 * Paths with more shared positions will be considered more closely related.
 */
export function calculatePathRelationships(
	careerPaths: CareerPath[],
	positionDetails: PositionDetail[]
): Map<string, Map<string, number>> {
	const relationships = new Map<string, Map<string, number>>();
	const positionsByPath = new Map<string, Set<string>>();

	// Initialize maps
	careerPaths.forEach(path => {
		relationships.set(path.id, new Map<string, number>());
		positionsByPath.set(path.id, new Set<string>());
	});

	// Collect positions for each path
	positionDetails.forEach(detail => {
		const pathPositions = positionsByPath.get(detail.career_path_id);
		if (pathPositions) {
			pathPositions.add(detail.position_id);
		}
	});

	// Calculate relationship scores (shared positions)
	careerPaths.forEach((path1, i) => {
		careerPaths.forEach((path2, j) => {
			if (i >= j) return; // Skip duplicate comparisons

			const positions1 = positionsByPath.get(path1.id);
			const positions2 = positionsByPath.get(path2.id);

			if (positions1 && positions2) {
				// Count shared positions
				let sharedCount = 0;
				positions1.forEach(posId => {
					if (positions2.has(posId)) sharedCount++;
				});

				// Store relationship score both ways
				relationships.get(path1.id)?.set(path2.id, sharedCount);
				relationships.get(path2.id)?.set(path1.id, sharedCount);
			}
		});
	});

	return relationships;
}

/**
 * Assigns angular positions to paths based on their relationships.
 * Paths with stronger relationships will be positioned closer together.
 */
export function assignPathAngles(
	relationships: Map<string, Map<string, number>>,
	careerPaths: CareerPath[],
	startAngle: number,
	angleSpread: number
): Map<string, number> {
	const pathAngles = new Map<string, number>();
	const startRad = startAngle * Math.PI / 180;
	const totalAngle = angleSpread * Math.PI / 180;

	// Start with equally spaced angles
	careerPaths.forEach((path, index) => {
		const angle = startRad + (index / careerPaths.length) * totalAngle;
		pathAngles.set(path.id, angle);
	});

	// Force-directed adjustment
	const iterations = 20; // Number of iterations for relaxation
	const repulsionFactor = 0.2; // How strongly paths repel each other
	const attractionFactor = 0.3; // How strongly related paths attract

	for (let iter = 0; iter < iterations; iter++) {
		// For each path, calculate forces from all other paths
		const forces = new Map<string, number>();

		careerPaths.forEach(path => {
			forces.set(path.id, 0); // Initialize force to zero

			// Calculate force from each other path
			careerPaths.forEach(otherPath => {
				if (path.id === otherPath.id) return;

				const currentAngle = pathAngles.get(path.id) || 0;
				const otherAngle = pathAngles.get(otherPath.id) || 0;

				// Calculate angular distance (accounting for circular wrapping)
				let angleDiff = otherAngle - currentAngle;
				if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
				if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

				// Base repulsive force - paths naturally want to be apart
				let force = -repulsionFactor * (1 / Math.max(0.1, Math.abs(angleDiff)));

				// Attractive force based on relationship strength
				const relationship = relationships.get(path.id)?.get(otherPath.id) || 0;
				if (relationship > 0) {
					force += attractionFactor * relationship * -Math.sign(angleDiff);
				}

				forces.set(path.id, (forces.get(path.id) || 0) + force);
			});
		});

		// Apply forces to update angles
		careerPaths.forEach(path => {
			const currentAngle = pathAngles.get(path.id) || 0;
			const force = forces.get(path.id) || 0;

			// Dampen the effect in later iterations for stability
			const damping = 1 - (iter / iterations);
			const newAngle = currentAngle + force * damping * 0.1;

			// Normalize angle to [0, 2π)
			let normalizedAngle = newAngle % (2 * Math.PI);
			if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

			pathAngles.set(path.id, normalizedAngle);
		});
	}

	return pathAngles;
}

/**
 * Creates path metadata objects for all career paths.
 */
export function createPathObjects(
	careerPaths: CareerPath[],
	positionDetails: PositionDetail[],
	pathAngles: Map<string, number>
): LayoutPath[] {
	// Group nodes by career path
	const nodesByPath = new Map<string, string[]>();

	positionDetails.forEach(detail => {
		if (!nodesByPath.has(detail.career_path_id)) {
			nodesByPath.set(detail.career_path_id, []);
		}
		nodesByPath.get(detail.career_path_id)?.push(detail.id);
	});

	// Create path objects
	return careerPaths.map(path => {
		const nodes = nodesByPath.get(path.id) || [];

		return {
			id: path.id,
			name: path.name,
			color: path.color || '#cccccc',
			nodes: nodes,
			angle: pathAngles.get(path.id) || 0
		};
	});
}

/**
 * Calculate the bounding box for all nodes.
 */
export function calculateBounds(
	nodes: { x: number; y: number }[],
	padding: number
): LayoutBounds {
	if (nodes.length === 0) {
		return { minX: -100, maxX: 100, minY: -100, maxY: 100 };
	}

	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

	// Find min/max coordinates
	nodes.forEach(node => {
		minX = Math.min(minX, node.x);
		maxX = Math.max(maxX, node.x);
		minY = Math.min(minY, node.y);
		maxY = Math.max(maxY, node.y);
	});

	// Add padding
	return {
		minX: minX - padding,
		maxX: maxX + padding,
		minY: minY - padding,
		maxY: maxY + padding
	};
}
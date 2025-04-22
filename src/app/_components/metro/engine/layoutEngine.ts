// src/app/_components/metro/engine/layoutEngine.ts

import type { CareerPath, PositionDetail } from '~/types/compass';

// --- Basic Types for Simple Layout ---
export interface BasicNode {
	id: string; // Corresponds to PositionDetail ID
	positionId: string;
	careerPathId: string;
	level: number;
	name: string; // We'll need to derive this, placeholder for now
	x: number;
	y: number;
	color: string; // From career path
}

export interface BasicLayoutData {
	nodes: BasicNode[]; // Simple list of nodes with coordinates
	bounds: {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	};
	// Not including lines or connections in this basic version
}

export interface BasicLayoutConfig {
	radiusStep: number; // Distance between levels
	startAngle?: number; // Starting angle (degrees)
	angleSpread?: number; // Angle spread (degrees)
	padding?: number; // Padding around the bounds
}

const DEFAULT_BASIC_CONFIG: Required<BasicLayoutConfig> = {
	radiusStep: 80, // Smaller step for basic view
	startAngle: 0,
	angleSpread: 360,
	padding: 50,
};

/**
 * Generates a very simple polar coordinate layout.
 * - Each path gets an equal angle slice.
 * - Positions are placed on their path's angle line.
 * - Radius increases based on level.
 * - Ignores position names, overlaps, connections for simplicity.
 */
export function generateBasicPolarLayout(
	careerPaths: CareerPath[],
	positionDetails: PositionDetail[],
	config: Partial<BasicLayoutConfig> = {}
): BasicLayoutData {

	const layoutConfig: Required<BasicLayoutConfig> = { ...DEFAULT_BASIC_CONFIG, ...config };
	const nodes: BasicNode[] = [];
	let minX = 0, maxX = 0, minY = 0, maxY = 0;

	if (careerPaths.length === 0 || positionDetails.length === 0) {
		return { nodes: [], bounds: { minX: -100, maxX: 100, minY: -100, maxY: 100 } };
	}

	// Calculate angle per path
	const angleStep = (layoutConfig.angleSpread * Math.PI / 180) / careerPaths.length;
	const startRad = layoutConfig.startAngle * Math.PI / 180;

	const pathAngles = new Map<string, { angle: number; color: string }>();
	careerPaths.forEach((path, index) => {
		pathAngles.set(path.id, {
			angle: startRad + index * angleStep,
			color: path.color || '#cccccc', // Default color
		});
	});

	// Place nodes based on position details
	positionDetails.forEach(detail => {
		const pathInfo = pathAngles.get(detail.career_path_id);
		if (!pathInfo) return; // Skip if detail references a non-existent path

		// Basic radius calculation: Level 1 is closest (but not 0), higher levels move out
		// Add a small base radius so level 1 isn't at the exact center
		const baseRadius = 50;
		const radius = baseRadius + (detail.level * layoutConfig.radiusStep);
		const angle = pathInfo.angle;

		// Calculate Cartesian coordinates
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);

		// Update bounds tracking
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);

		nodes.push({
			id: detail.id, // Use PositionDetail ID as the unique node ID
			positionId: detail.position_id,
			careerPathId: detail.career_path_id,
			level: detail.level,
			name: `L${detail.level}`, // Simple name for now
			x: x,
			y: y,
			color: pathInfo.color,
		});
	});

	// Calculate final bounds with padding
	const padding = layoutConfig.padding;
	const bounds = {
		minX: minX - padding,
		maxX: maxX + padding,
		minY: minY - padding,
		maxY: maxY + padding,
	};

	// Ensure bounds have some size if only one node exists
	if (nodes.length === 1) {
		bounds.minX = nodes[0].x - padding;
		bounds.maxX = nodes[0].x + padding;
		bounds.minY = nodes[0].y - padding;
		bounds.maxY = nodes[0].y + padding;
	}
	if (bounds.maxX === bounds.minX) {
		bounds.minX -= padding;
		bounds.maxX += padding;
	}
	if (bounds.maxY === bounds.minY) {
		bounds.minY -= padding;
		bounds.maxY += padding;
	}


	console.log("Basic Layout Generated:", { nodeCount: nodes.length, bounds });
	return { nodes, bounds };
}
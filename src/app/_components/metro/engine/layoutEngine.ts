// src/app/_components/metro/engine/layoutEngine.ts
import type { CareerPath, Position, PositionDetail } from '~/types/compass';
import {
	LayoutNode, LayoutPath, LayoutData, LayoutConfig,
	DEFAULT_CONFIG
} from './types';
import {
	calculateCentrality,
	calculatePathRelationships,
	assignPathAngles,
	createPathObjects,
	calculateBounds
} from './calculations';

/**
 * Main layout generation function.
 * Creates a metro map layout based on career paths, positions, and position details.
 * 
 * @param careerPaths - Array of career paths
 * @param positionDetails - Array of position details
 * @param positions - Array of generic positions
 * @param config - Layout configuration options
 * @returns Complete layout data
 */
export function generateLayout(
	careerPaths: CareerPath[],
	positionDetails: PositionDetail[],
	positions: Position[],
	config: Partial<LayoutConfig> = {}
): LayoutData {
	// Merge user config with defaults
	const layoutConfig: Required<LayoutConfig> = { ...DEFAULT_CONFIG, ...config };

	// Initialize result structures
	const nodes: LayoutNode[] = [];
	const nodesById: Record<string, LayoutNode> = {};

	// Validate input data
	if (!Array.isArray(careerPaths) || !Array.isArray(positionDetails) || !Array.isArray(positions) ||
		careerPaths.length === 0 || positionDetails.length === 0 || positions.length === 0) {
		console.warn("Layout Generation: Missing or invalid core data.");
		return {
			nodes: [],
			nodesById: {},
			paths: [],
			pathsById: {},
			bounds: { minX: -100, maxX: 100, minY: -100, maxY: 100 },
			configUsed: layoutConfig
		};
	}

	// --- Pre-computation ---

	// Create position lookup map
	const positionMap = new Map(positions.map(p => [p.id, p]));

	// Calculate centrality for each position (how many paths it appears in)
	const centralityScores = calculateCentrality(positionDetails);

	// Calculate level range and mid-level
	const levels = positionDetails.map(d => d.level).filter(l => l > 0);
	const minLevel = levels.length > 0 ? Math.min(...levels) : 1;
	const maxLevel = levels.length > 0 ? Math.max(...levels) : minLevel;
	const midLevel = layoutConfig.midLevelOverride ?? ((minLevel + maxLevel) / 2);

	// Calculate path relationships
	const pathRelationships = calculatePathRelationships(careerPaths, positionDetails);

	// Assign angles to paths
	const pathAngles = assignPathAngles(
		pathRelationships,
		careerPaths,
		layoutConfig.startAngle,
		layoutConfig.angleSpread
	);

	// --- Node Placement ---
	positionDetails.forEach(detail => {
		const position = positionMap.get(detail.position_id);
		if (!position) return; // Skip if position doesn't exist

		const path = careerPaths.find(p => p.id === detail.career_path_id);
		if (!path) return; // Skip if path doesn't exist

		const centrality = centralityScores.get(detail.position_id) || 1;
		const isInterchange = centrality > 1;

		// Get path angle
		const pathAngle = pathAngles.get(detail.career_path_id) || 0;

		// Calculate level distance from mid-level (determines radius)
		const levelDistance = Math.abs(detail.level - midLevel);

		// Apply centrality effect (interchange nodes pull more toward center)
		const effectiveCentrality = isInterchange
			? Math.pow(centrality, layoutConfig.centralityFactor)
			: 1;

		// Calculate radius: smaller for mid-level positions and interchanges
		const radius = layoutConfig.centerRadius +
			(levelDistance * layoutConfig.radiusStep) / effectiveCentrality;

		// Apply slight angular offset based on level to create a curved path effect
		const levelOffsetDirection = detail.level < midLevel ? -1 : 1;
		const levelOffset = (detail.level - midLevel) * 0.1 * levelOffsetDirection;

		// Apply small jitter to prevent perfect overlaps
		const jitterAmount = layoutConfig.jitter;
		const jitterX = jitterAmount * (Math.random() - 0.5) * layoutConfig.radiusStep;
		const jitterY = jitterAmount * (Math.random() - 0.5) * layoutConfig.radiusStep;

		// Calculate final angle
		const adjustedAngle = pathAngle + levelOffset;

		// Calculate coordinates
		const x = radius * Math.cos(adjustedAngle) + jitterX;
		const y = radius * Math.sin(adjustedAngle) + jitterY;

		// Create node
		const newNode: LayoutNode = {
			id: detail.id,
			positionId: detail.position_id,
			careerPathId: detail.career_path_id,
			level: detail.level,
			name: position.name,
			x: x,
			y: y,
			color: path.color || '#cccccc',
			isInterchange: isInterchange,
		};

		// Add to result arrays
		nodes.push(newNode);
		nodesById[newNode.id] = newNode;
	});

	// --- Post-processing ---

	// Create path objects
	const paths = createPathObjects(careerPaths, positionDetails, pathAngles);

	// Create path lookup
	const pathsById: Record<string, LayoutPath> = {};
	paths.forEach(path => {
		pathsById[path.id] = path;
	});

	// Calculate bounds
	const bounds = calculateBounds(nodes, layoutConfig.padding);

	// Print debug info
	console.log("Layout Generated:", {
		nodeCount: nodes.length,
		pathCount: paths.length,
		bounds,
		midLevel,
		levelRange: [minLevel, maxLevel]
	});

	// Return complete layout data
	return {
		nodes,
		nodesById,
		paths,
		pathsById,
		bounds,
		configUsed: layoutConfig
	};
}
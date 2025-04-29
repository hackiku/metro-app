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

	// Assign angles to paths based on relationships
	const pathAngles = assignPathAngles(
		pathRelationships,
		careerPaths,
		layoutConfig.startAngle,
		layoutConfig.angleSpread
	);

	// Group details by path for sequence processing
	const detailsByPath = new Map<string, PositionDetail[]>();

	positionDetails.forEach(detail => {
		if (!detailsByPath.has(detail.career_path_id)) {
			detailsByPath.set(detail.career_path_id, []);
		}
		detailsByPath.get(detail.career_path_id)?.push(detail);
	});

	// Sort details within each path by sequence or level
	detailsByPath.forEach((details, pathId) => {
		// First attempt to sort by sequence_in_path if available
		const hasSequence = details.some(d => d.sequence_in_path !== null && d.sequence_in_path !== undefined);

		if (hasSequence) {
			details.sort((a, b) => {
				const aSeq = a.sequence_in_path ?? a.level;
				const bSeq = b.sequence_in_path ?? b.level;
				return (aSeq || 0) - (bSeq || 0);
			});
		} else {
			// Fall back to level-based sorting
			details.sort((a, b) => a.level - b.level);
		}
	});

	// --- Node Placement ---
	// Process paths one at a time to ensure cohesive path layout
	careerPaths.forEach(path => {
		const pathDetails = detailsByPath.get(path.id) || [];
		const pathAngle = pathAngles.get(path.id) || 0;

		// Skip empty paths
		if (pathDetails.length === 0) return;

		// Set up curve parameters for this path
		const totalNodes = pathDetails.length;
		const startRadius = layoutConfig.centerRadius < 0
			? Math.abs(layoutConfig.centerRadius) // Handle negative centerRadius specially
			: layoutConfig.centerRadius + layoutConfig.radiusStep * Math.abs(pathDetails[0].level - midLevel);

		// Calculate total angular spread for this path based on node count
		const pathCurve = Math.min(0.3, 0.1 * Math.log(totalNodes + 1));

		// Process details for this path
		pathDetails.forEach((detail, index) => {
			const position = positionMap.get(detail.position_id);
			if (!position) return; // Skip if position doesn't exist

			// Calculate node-specific properties
			const centrality = centralityScores.get(detail.position_id) || 1;
			const isInterchange = centrality > 1;

			// Calculate level distance from mid-level
			const levelDistance = Math.abs(detail.level - midLevel);

			// Apply centrality effect (interchange nodes pull more toward center)
			const effectiveCentrality = isInterchange
				? Math.pow(centrality, layoutConfig.centralityFactor)
				: 1;

			// Calculate sequence-based progression factor (0 to 1)
			const progressFactor = totalNodes > 1 ? index / (totalNodes - 1) : 0.5;

			// Determine radius based on multiple factors:
			// 1. Base radius determined by level distance from mid-level
			// 2. Sequence-based progressive distribution
			// 3. Centrality pulling interchanges inward

			// Starting with a base radius from the center
			let baseRadius = Math.abs(layoutConfig.centerRadius);

			// Add level-based radius component
			const levelRadiusComponent = levelDistance * layoutConfig.radiusStep;

			// Handle positive vs negative center radius
			if (layoutConfig.centerRadius >= 0) {
				// Normal mode: mid-level is central
				baseRadius += levelRadiusComponent;
			} else {
				// Inverse mode: expand outward from center for all levels
				baseRadius += layoutConfig.radiusStep * (detail.level - minLevel);
			}

			// Apply sequence-based distribution to spread nodes along the path
			// This ensures nodes at same level but different sequences get spaced apart
			const sequenceOffset = (detail.sequence_in_path !== null && detail.sequence_in_path !== undefined)
				? (detail.sequence_in_path - detail.level) * 0.3 * layoutConfig.radiusStep
				: 0;

			// Combine all radius factors
			const radius = (baseRadius + sequenceOffset) / effectiveCentrality;

			// Calculate angular offset based on position in sequence
			// Create a smooth arc effect for the path
			const midPosition = (totalNodes - 1) / 2;
			const angleOffset = pathCurve * (index - midPosition);

			// Apply additional level-based angular offset for more natural curves
			const levelOffsetDirection = detail.level < midLevel ? -1 : 1;
			const levelOffset = (detail.level - midLevel) * 0.05 * levelOffsetDirection;

			// Calculate final angle
			const adjustedAngle = pathAngle + angleOffset + levelOffset;

			// Apply minimal jitter for node separation
			const jitterAmount = layoutConfig.jitter;
			const jitterX = jitterAmount * (Math.random() - 0.5) * layoutConfig.radiusStep;
			const jitterY = jitterAmount * (Math.random() - 0.5) * layoutConfig.radiusStep;

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
				// Include sequence info if available
				...(detail.sequence_in_path !== undefined && { sequence_in_path: detail.sequence_in_path })
			};

			// Add to result arrays
			nodes.push(newNode);
			nodesById[newNode.id] = newNode;
		});
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

	// Ensure paths have all required properties before returning
	const validatedPaths = paths.map(path => {
		// Make sure each path has a list of node IDs
		if (!Array.isArray(path.nodes)) {
			path.nodes = nodes
				.filter(node => node.careerPathId === path.id)
				.map(node => node.id);
		}
		return path;
	});

	// Return complete layout data with validated paths
	return {
		nodes,
		nodesById,
		paths: validatedPaths,
		pathsById,
		bounds,
		configUsed: layoutConfig
	};
}
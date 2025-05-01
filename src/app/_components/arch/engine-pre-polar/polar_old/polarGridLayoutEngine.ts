// src/app/_components/metro/engine/polarGridLayoutEngine.ts

import type {
	CareerPath, Position, PositionDetail,
	LayoutData, LayoutNode, LayoutPath, PolarGridConfig
} from './types';
import { DEFAULT_POLAR_GRID_CONFIG } from './polarGridConfig';
import { calculateBounds, getLevelInfo, mapPathsToPositions } from './layoutUtils';
import { assignPathAngles } from './nodePlacement';
import { finalizeNodePositions, buildLayoutPaths } from './layoutFinalizer';

/**
 * Generates a layout using the Polar Grid strategy.
 * Nodes are placed on intersections of radius rings and angle steps.
 * Middle levels are targeted towards a specific radius.
 *
 * @param careerPaths - Array of CareerPath objects.
 * @param positionDetails - Array of PositionDetail objects.
 * @param positions - Array of Position objects.
 * @param userConfig - Optional configuration overrides.
 * @returns A LayoutData object.
 */
export function generatePolarGridLayout(
	careerPaths: CareerPath[],
	positionDetails: PositionDetail[],
	positions: Position[],
	userConfig: Partial<PolarGridConfig> = {}
): LayoutData {

	// --- 1. Configuration and Initial Setup ---
	const config = { ...DEFAULT_POLAR_GRID_CONFIG, ...userConfig };
	if (careerPaths.length === 0 || positionDetails.length === 0 || positions.length === 0) {
        console.warn("Polar Grid Layout: Input data is empty. Returning empty layout.");
        return { nodes: [], nodesById: {}, paths: [], pathsById: {}, bounds: { minX: -50, maxX: 50, minY: -50, maxY: 50 }, configUsed: config };
    }

	const positionMap = new Map(positions.map(p => [p.id, { name: p.name }]));
    const careerPathMap = new Map(careerPaths.map(p => [p.id, { color: p.color }]));

	// --- 2. Analyze Data Structure ---
	const levelInfo = getLevelInfo(positionDetails);
	const pathsByPosition = mapPathsToPositions(positionDetails); // Needed for interchange logic

    // Filter out inactive paths (paths with no positionDetails)
    const activePathIds = new Set(positionDetails.map(pd => pd.career_path_id));
    const activeCareerPaths = careerPaths.filter(cp => activePathIds.has(cp.id));
    if (activeCareerPaths.length === 0) {
         console.warn("Polar Grid Layout: No active career paths found after filtering. Returning empty layout.");
         return { nodes: [], nodesById: {}, paths: [], pathsById: {}, bounds: { minX: -50, maxX: 50, minY: -50, maxY: 50 }, configUsed: config };
    }


	// --- 3. Assign Base Angles ---
	const pathAngles = assignPathAngles(activeCareerPaths, config);

	// --- 4. Calculate and Finalize Node Positions ---
	const nodes: LayoutNode[] = finalizeNodePositions(
		positionDetails,
		positionMap,
		pathAngles,
		pathsByPosition,
		levelInfo,
		config,
        careerPathMap
	);

	// --- 5. Build Layout Paths with Ordered Nodes ---
	const paths: LayoutPath[] = buildLayoutPaths(activeCareerPaths, nodes, config);

	// --- 6. Create Lookups ---
	const nodesById: Record<string, LayoutNode> = {};
	nodes.forEach(node => { nodesById[node.id] = node; });

	const pathsById: Record<string, LayoutPath> = {};
	paths.forEach(path => { pathsById[path.id] = path; });

	// --- 7. Calculate Final Bounds ---
	const bounds = calculateBounds(nodes, config.padding);

	// --- 8. Return Layout Data ---
	return {
		nodes,
		nodesById,
		paths,
		pathsById,
		bounds,
		configUsed: config,
	};
}
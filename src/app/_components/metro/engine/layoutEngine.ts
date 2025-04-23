// src/app/_components/metro/engine/layoutEngine.ts
import type { CareerPath, Position, PositionDetail } from '~/types/compass';

// --- Updated Node Type - More descriptive name ---
export interface LayoutNode {
	id: string; // PositionDetail ID - unique identifier for this specific node instance
	positionId: string; // ID of the generic position
	careerPathId: string; // ID of the path this instance belongs to (for this calculation)
	level: number;
	name: string; // Actual position name
	x: number;
	y: number;
	color: string; // Color from the career path
	isInterchange: boolean; // Is the underlying position shared across paths?
	// We might add more fields later (e.g., list of ALL path IDs for interchanges)
}

// --- Updated Layout Data Structure ---
export interface LayoutData {
	nodes: LayoutNode[]; // Keep as an array for easier iteration in the map
	nodesById: Record<string, LayoutNode>; // Add map for quick lookup if needed
	bounds: {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	};
	configUsed: Required<LayoutConfig>; // Include config for reference
	// Not including lines or connections yet
}

// --- Updated Config Type ---
export interface LayoutConfig {
	radiusStep?: number;
	centerRadius?: number;
	startAngle?: number;
	angleSpread?: number;
	padding?: number;
	midLevelOverride?: number | null; // Optional: Force a specific mid-level for radius calc
	centralityFactor?: number; // How much centrality pulls things in (e.g., 1.0 = default, 1.5 = stronger pull)
}

const DEFAULT_CONFIG: Required<LayoutConfig> = {
	radiusStep: 85,      // Distance between levels outward
	centerRadius: 70,     // Base radius for "middle" or most central nodes
	startAngle: -90,      // Start angles at the top (North)
	angleSpread: 360,     // Use full circle
	padding: 60,          // Padding around content bounds
	midLevelOverride: null, // Auto-calculate mid-level by default
	centralityFactor: 1.2, // Make centrality pull nodes in a bit more strongly
};

// --- Helper: Calculate Centrality ---
// Counts how many paths each *generic position* appears on
function calculateCentrality(positionDetails: PositionDetail[]): Map<string, number> {
	const centralityScores = new Map<string, number>();
	const uniquePositionPathPairs = new Set<string>();

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
 * Generates an improved polar layout based on levels and centrality.
 */
export function generateLayout( // Renamed function for clarity
	careerPaths: CareerPath[],
	positionDetails: PositionDetail[],
	positions: Position[],
	config: Partial<LayoutConfig> = {}
): LayoutData {

	const layoutConfig: Required<LayoutConfig> = { ...DEFAULT_CONFIG, ...config };
	const nodes: LayoutNode[] = [];
	const nodesById: Record<string, LayoutNode> = {}; // Initialize map
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

	if (!Array.isArray(careerPaths) || !Array.isArray(positionDetails) || !Array.isArray(positions) ||
		careerPaths.length === 0 || positionDetails.length === 0 || positions.length === 0) {
		console.warn("Layout Generation: Missing or invalid core data.");
		return { nodes: [], nodesById: {}, bounds: { minX: -100, maxX: 100, minY: -100, maxY: 100 }, configUsed: layoutConfig };
	}

	// --- Pre-computation ---
	const centralityScores = calculateCentrality(positionDetails);
	const positionMap = new Map(positions.map(p => [p.id, p])); // Map ID to full Position object

	// Calculate overall level range and mid-level
	const levels = positionDetails.map(d => d.level).filter(l => l > 0);
	const minLevel = levels.length > 0 ? Math.min(...levels) : 1;
	const maxLevel = levels.length > 0 ? Math.max(...levels) : minLevel; // Avoid max < min if only one level
	const midLevel = layoutConfig.midLevelOverride ?? (minLevel + maxLevel) / 2;

	// Assign angles to paths (equal slices for now)
	const angleStep = (layoutConfig.angleSpread * Math.PI / 180) / Math.max(1, careerPaths.length);
	const startRad = layoutConfig.startAngle * Math.PI / 180;
	const pathInfoMap = new Map<string, { angle: number; color: string }>();
	careerPaths.forEach((path, index) => {
		pathInfoMap.set(path.id, {
			angle: startRad + index * angleStep,
			color: path.color || '#cccccc',
		});
	});
	// --- End Pre-computation ---

	// --- Place Nodes ---
	positionDetails.forEach(detail => {
		const pathInfo = pathInfoMap.get(detail.career_path_id);
		const position = positionMap.get(detail.position_id);
		if (!pathInfo || !position || detail.level <= 0) return; // Skip orphans or invalid data

		const centrality = centralityScores.get(detail.position_id) || 1;
		const isInterchange = centrality > 1;

		// --- Refined Radius Calculation ---
		const levelDistanceFromMid = Math.abs(detail.level - midLevel);
		// Centrality effect: stronger pull for more central nodes
		const effectiveCentrality = 1 + (centrality - 1) * layoutConfig.centralityFactor;
		// Calculate radius: start central, push outwards by level distance, pull inwards by centrality
		const radius = layoutConfig.centerRadius +
			(levelDistanceFromMid * layoutConfig.radiusStep) / effectiveCentrality;

		// --- Calculate Coordinates ---
		const angle = pathInfo.angle; // Simple angle for now
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);

		// Update bounds tracking (initialize if first node)
		if (nodes.length === 0) {
			minX = maxX = x;
			minY = maxY = y;
		} else {
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}

		// --- Create Node Object ---
		const newNode: LayoutNode = {
			id: detail.id,
			positionId: detail.position_id,
			careerPathId: detail.career_path_id,
			level: detail.level,
			name: position.name, // Use name from position map
			x: x,
			y: y,
			color: pathInfo.color,
			isInterchange: isInterchange,
		};
		nodes.push(newNode);
		nodesById[newNode.id] = newNode; // Populate the map

	}); // End positionDetails.forEach

	// --- Collision Avoidance (Simple Push Apart - Future Step) ---
	// This would iterate through `nodes`, identify nodes on the same angle,
	// sort them by radius, check distances, and adjust `x, y` (recalculating from adjusted radius).

	// --- Calculate Final Bounds ---
	const padding = layoutConfig.padding;
	let bounds = { minX, maxX, minY, maxY };
	if (nodes.length > 0) {
		bounds = {
			minX: minX - padding,
			maxX: maxX + padding,
			minY: minY - padding,
			maxY: maxY + padding,
		};
		if (bounds.maxX <= bounds.minX) { bounds.minX -= padding; bounds.maxX += padding; }
		if (bounds.maxY <= bounds.minY) { bounds.minY -= padding; bounds.maxY += padding; }
	} else {
		bounds = { minX: -100, maxX: 100, minY: -100, maxY: 100 };
	}

	console.log("Layout Generated (v3 - Centrality):", { nodeCount: nodes.length, bounds });
	return { nodes, nodesById, bounds, configUsed: layoutConfig };
}
// src/app/_components/metro/engine/layoutEngine.ts
import * as d3 from 'd3';

// Type definitions
export interface CareerPath {
	id: string;
	name: string;
	description?: string;
	color: string;
}

export interface Position {
	id: string;
	name: string;
	description?: string;
	level: number;
}

export interface PositionPath {
	position_id: string;
	path_id: string;
	sequence_in_path: number;
}

export interface PositionTransition {
	from_position_id: string;
	to_position_id: string;
	is_recommended: boolean;
}

export interface MetroNode {
	id: string;
	name: string;
	x: number;
	y: number;
	level: number;
	isInterchange: boolean;
	pathIds: string[];
}

export interface MetroLine {
	id: string;
	name: string;
	color: string;
	nodes: MetroNode[];
}

export interface MetroConnection {
	fromId: string;
	toId: string;
	isRecommended: boolean;
}

export interface MetroLayoutData {
	lines: MetroLine[];
	nodes: Record<string, MetroNode>;
	connections: MetroConnection[];
	bounds: {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	};
}

// Configuration options for layout algorithm
export interface LayoutConfig {
	centerRadius: number;
	radiusStep: number;
	maxRadius: number;
	startAngle: number;
	angleSpread: number;
	minNodeDistance: number;
}

// Default configuration
const DEFAULT_CONFIG: LayoutConfig = {
	centerRadius: 150,      // Radius where central nodes are placed
	radiusStep: 120,        // Distance between concentric circles
	maxRadius: 800,         // Maximum radius
	startAngle: 0,          // Starting angle in degrees
	angleSpread: 360,       // Angle spread in degrees
	minNodeDistance: 60     // Minimum distance between nodes on the same line
};

/**
 * Main function to process metro data and generate layout
 */
export function generateMetroLayout(
	careerPaths: CareerPath[],
	positions: Position[],
	positionPaths: PositionPath[],
	transitions: PositionTransition[],
	config: Partial<LayoutConfig> = {}
): MetroLayoutData {
	// Merge configuration with defaults
	const layoutConfig: LayoutConfig = { ...DEFAULT_CONFIG, ...config };

	// 1. Calculate centrality (how many paths each position belongs to)
	const centralityScores = calculateCentrality(positionPaths);

	// 2. Create position lookup map
	const positionMap = positions.reduce((map, position) => {
		map[position.id] = position;
		return map;
	}, {} as Record<string, Position>);

	// 3. Create path lookup map
	const pathMap = careerPaths.reduce((map, path) => {
		map[path.id] = path;
		return map;
	}, {} as Record<string, CareerPath>);

	// 4. Group positions by path
	const positionsByPath = positionPaths.reduce((map, pp) => {
		if (!map[pp.path_id]) {
			map[pp.path_id] = [];
		}
		const position = positionMap[pp.position_id];
		if (position) {
			map[pp.path_id].push({
				...position,
				sequence: pp.sequence_in_path
			});
		}
		return map;
	}, {} as Record<string, (Position & { sequence: number })[]>);

	// 5. Sort positions within each path by sequence
	Object.keys(positionsByPath).forEach(pathId => {
		positionsByPath[pathId].sort((a, b) => a.sequence - b.sequence);
	});

	// 6. Calculate path angles based on the most central positions they contain
	const pathAngles = calculatePathAngles(
		careerPaths,
		positionsByPath,
		centralityScores,
		layoutConfig
	);

	// 7. Calculate positions for all nodes
	const nodePositions = calculateNodePositions(
		careerPaths,
		positions,
		positionPaths,
		positionsByPath,
		centralityScores,
		pathAngles,
		layoutConfig
	);

	// 8. Create metro nodes and lines
	const { nodes, lines } = createMetroNodesAndLines(
		careerPaths,
		positions,
		positionPaths,
		nodePositions,
		centralityScores
	);

	// 9. Create metro connections
	const connections = transitions.map(transition => ({
		fromId: transition.from_position_id,
		toId: transition.to_position_id,
		isRecommended: transition.is_recommended
	}));

	// 10. Calculate layout bounds
	const bounds = calculateBounds(Object.values(nodes));

	// Return complete layout data
	return {
		lines,
		nodes,
		connections,
		bounds
	};
}

/**
 * Calculate centrality scores for positions based on how many paths they belong to
 */
function calculateCentrality(positionPaths: PositionPath[]): Map<string, number> {
	const centralityScores = new Map<string, number>();

	positionPaths.forEach(pp => {
		const currentScore = centralityScores.get(pp.position_id) || 0;
		centralityScores.set(pp.position_id, currentScore + 1);
	});

	return centralityScores;
}

/**
 * Calculate optimal angles for each path based on centrality of positions
 */
function calculatePathAngles(
	careerPaths: CareerPath[],
	positionsByPath: Record<string, (Position & { sequence: number })[]>,
	centralityScores: Map<string, number>,
	config: LayoutConfig
): Record<string, number> {
	// Get the most central positions (positions that appear in multiple paths)
	const centralPositionIds = [...centralityScores.entries()]
		.filter(([_, count]) => count > 1)
		.sort((a, b) => b[1] - a[1])
		.map(([id]) => id);

	// Calculate path scores based on the centrality of positions they contain
	const pathScores = careerPaths.map(path => {
		const positions = positionsByPath[path.id] || [];
		const centralPositionsCount = positions.filter(
			p => centralPositionIds.includes(p.id)
		).length;

		return {
			pathId: path.id,
			score: centralPositionsCount
		};
	}).sort((a, b) => b.score - a.score);

	// Assign angles to paths, with higher-scoring paths getting more evenly spaced angles
	const angleStep = config.angleSpread / Math.max(careerPaths.length, 1);
	const pathAngles: Record<string, number> = {};

	pathScores.forEach((pathScore, index) => {
		// Convert to radians for calculations
		const angle = ((config.startAngle + index * angleStep) % 360) * Math.PI / 180;
		pathAngles[pathScore.pathId] = angle;
	});

	return pathAngles;
}

/**
 * Calculate positions for all nodes using polar coordinates
 */
function calculateNodePositions(
	careerPaths: CareerPath[],
	positions: Position[],
	positionPaths: PositionPath[],
	positionsByPath: Record<string, (Position & { sequence: number })[]>,
	centralityScores: Map<string, number>,
	pathAngles: Record<string, number>,
	config: LayoutConfig
): Record<string, { x: number, y: number, pathAngles: number[] }> {
	const nodePositions: Record<string, { x: number, y: number, pathAngles: number[] }> = {};

	// First pass: Calculate position for each node in each path
	positionPaths.forEach(pp => {
		const pathId = pp.path_id;
		const positionId = pp.position_id;
		const pathAngle = pathAngles[pathId] || 0;

		// Get all positions in this path
		const pathPositions = positionsByPath[pathId] || [];
		const position = positions.find(p => p.id === positionId);

		if (!position) return;

		// Find sequence of this position in the path
		const sequenceInPath = pp.sequence_in_path;
		const totalPositionsInPath = pathPositions.length;

		// Centrality affects radius - more central positions are closer to center
		const centrality = centralityScores.get(positionId) || 1;

		// Level affects radius too - middle levels (3-4) are closer to center
		const levelFactor = Math.abs(position.level - 3);

		// Calculate radius based on centrality and level
		let radius = config.centerRadius + (levelFactor * config.radiusStep / centrality);

		// Cap radius at maximum
		radius = Math.min(radius, config.maxRadius);

		// Calculate position using polar coordinates
		const x = radius * Math.cos(pathAngle);
		const y = radius * Math.sin(pathAngle);

		// Store or update position
		if (!nodePositions[positionId]) {
			nodePositions[positionId] = {
				x, y,
				pathAngles: [pathAngle]
			};
		} else {
			// For positions in multiple paths, store all angles and calculate average position
			nodePositions[positionId].pathAngles.push(pathAngle);

			// If this is a central position (in multiple paths), recalculate as average
			if (centrality > 1) {
				const angles = nodePositions[positionId].pathAngles;
				// Use vector averaging to find the mean angle (simple average doesn't work for angles)
				const sumX = angles.reduce((sum, angle) => sum + Math.cos(angle), 0);
				const sumY = angles.reduce((sum, angle) => sum + Math.sin(angle), 0);
				const avgAngle = Math.atan2(sumY / angles.length, sumX / angles.length);

				// Update position using average angle
				nodePositions[positionId].x = radius * Math.cos(avgAngle);
				nodePositions[positionId].y = radius * Math.sin(avgAngle);
			}
		}
	});

	// Second pass: Adjust positions to avoid overlaps within the same path
	careerPaths.forEach(path => {
		const pathId = path.id;
		const pathPositions = positionsByPath[pathId] || [];
		const pathAngle = pathAngles[pathId] || 0;

		// Sort positions by radius (distance from center)
		const sortedPositions = pathPositions
			.map(position => {
				const posId = position.id;
				const pos = nodePositions[posId];
				if (!pos) return null;

				// Calculate radius from center
				const radius = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
				return { id: posId, radius, pos };
			})
			.filter(p => p !== null)
			.sort((a, b) => a!.radius - b!.radius) as { id: string, radius: number, pos: { x: number, y: number, pathAngles: number[] } }[];

		// Adjust positions to maintain minimum distance
		for (let i = 1; i < sortedPositions.length; i++) {
			const prev = sortedPositions[i - 1];
			const curr = sortedPositions[i];

			const dx = curr.pos.x - prev.pos.x;
			const dy = curr.pos.y - prev.pos.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < config.minNodeDistance) {
				// Calculate how much further the current position needs to be
				const radiusIncrease = (config.minNodeDistance - distance) * 1.1; // Adding 10% buffer

				// Calculate new radius
				const newRadius = curr.radius + radiusIncrease;

				// Update position
				curr.pos.x = newRadius * Math.cos(pathAngle);
				curr.pos.y = newRadius * Math.sin(pathAngle);
				nodePositions[curr.id].x = curr.pos.x;
				nodePositions[curr.id].y = curr.pos.y;
			}
		}
	});

	return nodePositions;
}

/**
 * Create metro nodes and lines from calculated positions
 */
function createMetroNodesAndLines(
	careerPaths: CareerPath[],
	positions: Position[],
	positionPaths: PositionPath[],
	nodePositions: Record<string, { x: number, y: number, pathAngles: number[] }>,
	centralityScores: Map<string, number>
): { nodes: Record<string, MetroNode>, lines: MetroLine[] } {
	// Create nodes
	const nodes: Record<string, MetroNode> = {};
	positions.forEach(position => {
		const pos = nodePositions[position.id];
		if (!pos) return; // Skip positions without calculated positions

		// Create node
		nodes[position.id] = {
			id: position.id,
			name: position.name,
			x: pos.x,
			y: pos.y,
			level: position.level,
			isInterchange: (centralityScores.get(position.id) || 0) > 1,
			pathIds: []
		};
	});

	// Collect path IDs for each node
	positionPaths.forEach(pp => {
		if (nodes[pp.position_id]) {
			nodes[pp.position_id].pathIds.push(pp.path_id);
		}
	});

	// Create lines
	const lines: MetroLine[] = careerPaths.map(path => {
		// Get all positions in this path
		const pathPositionIds = positionPaths
			.filter(pp => pp.path_id === path.id)
			.sort((a, b) => a.sequence_in_path - b.sequence_in_path)
			.map(pp => pp.position_id);

		// Create line nodes
		const lineNodes = pathPositionIds
			.map(id => nodes[id])
			.filter(node => !!node); // Filter out undefined nodes

		return {
			id: path.id,
			name: path.name,
			color: path.color,
			nodes: lineNodes
		};
	});

	return { nodes, lines };
}

/**
 * Calculate the bounds of the layout
 */
function calculateBounds(nodes: MetroNode[]): { minX: number, maxX: number, minY: number, maxY: number } {
	if (nodes.length === 0) {
		return { minX: -100, maxX: 100, minY: -100, maxY: 100 };
	}

	const bounds = {
		minX: Math.min(...nodes.map(n => n.x)),
		maxX: Math.max(...nodes.map(n => n.x)),
		minY: Math.min(...nodes.map(n => n.y)),
		maxY: Math.max(...nodes.map(n => n.y))
	};

	// Add padding (10% on each side)
	const xPadding = (bounds.maxX - bounds.minX) * 0.1;
	const yPadding = (bounds.maxY - bounds.minY) * 0.1;

	return {
		minX: bounds.minX - xPadding,
		maxX: bounds.maxX + xPadding,
		minY: bounds.minY - yPadding,
		maxY: bounds.maxY + yPadding
	};
}

/**
 * Generate a metro-style path with orthogonal segments
 */
export function generateMetroPath(nodes: MetroNode[]): string {
	if (nodes.length < 2) return '';

	// Sort nodes by x position for more predictable paths
	const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);

	// Use D3's line generator with step interpolation for orthogonal path
	const lineGenerator = d3.line<MetroNode>()
		.x(d => d.x)
		.y(d => d.y)
		.curve(d3.curveStep);

	return lineGenerator(sortedNodes) || '';
}

/**
 * Generate a connection path between two nodes
 */
export function generateConnectionPath(source: MetroNode, target: MetroNode): string {
	// Use a simple curved path
	const dx = target.x - source.x;
	const dy = target.y - source.y;
	const midX = source.x + dx * 0.5;
	const midY = source.y + dy * 0.5;

	// For short distances, use a straight line
	if (Math.abs(dx) < 50 && Math.abs(dy) < 50) {
		return `M ${source.x},${source.y} L ${target.x},${target.y}`;
	}

	// For longer distances, use a quadratic curve
	return `M ${source.x},${source.y} Q ${midX},${midY} ${target.x},${target.y}`;
}
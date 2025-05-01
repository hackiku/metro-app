// src/app/_components/metro/engine/types.ts

/**
 * Layout node representing a station on the map
 */
export interface LayoutNode {
	id: string;                // PositionDetail ID - unique identifier for this specific node instance
	positionId: string;        // ID of the generic position
	careerPathId: string;      // ID of the path this instance belongs to
	level: number;             // Seniority level
	name: string;              // Display name (from position)
	x: number;                 // X coordinate in layout
	y: number;                 // Y coordinate in layout
	color: string;             // Color from the career path
	isInterchange: boolean;    // Whether this position appears in multiple paths
	relatedPaths?: string[];   // IDs of all paths this position appears in
	sequence_in_path?: number; // Optional sequence number within the path
}

/**
 * Path metadata for a career path
 */
export interface LayoutPath {
	id: string;                // Career path ID
	name: string;              // Path name
	color: string;             // Path color
	nodes: string[];           // IDs of nodes in this path, ordered by level
	angle?: number;            // Kept for backward compatibility
}

/**
 * Layout viewport bounds
 */
export interface LayoutBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

/**
 * Complete layout data structure
 */
export interface LayoutData {
	nodes: LayoutNode[];                    // All nodes in the layout
	nodesById: Record<string, LayoutNode>;  // Quick lookup by ID
	paths: LayoutPath[];                    // All path metadata
	pathsById: Record<string, LayoutPath>;  // Quick lookup by ID
	bounds: LayoutBounds;                   // Viewport bounds
	configUsed: LayoutConfig | GridLayoutConfig; // Configuration used
}

/**
 * Configuration options for grid layout
 */
export interface GridLayoutConfig {
	cellWidth: number;         // Width of grid cells
	cellHeight: number;        // Height of grid cells
	xPadding: number;          // Padding around the edges (X)
	yPadding: number;          // Padding around the edges (Y)
	levelMultiplier: number;   // How much levels affect vertical position
	domainSpread: number;      // How far apart career paths are horizontally
	centerWeight: number;      // How strongly to pull interchange nodes to center
	routingMode?: 'direct' | 'manhattan' | 'smooth'; // How paths are drawn
}

/**
 * Configuration options for polar layout (legacy)
 */
export interface LayoutConfig {
	radiusStep?: number;          // Distance between level rings
	centerRadius?: number;        // Radius for central nodes
	startAngle?: number;          // Starting angle in degrees
	angleSpread?: number;         // Angular spread in degrees
	padding?: number;             // Padding around bounds
	midLevelOverride?: number;    // Force a specific mid-level point
	centralityFactor?: number;    // How strongly centrality affects placement
	pathSpacing?: number;         // Minimum angular distance between paths
	jitter?: number;              // Random offset to prevent perfect overlaps
}

/**
 * Default configuration for grid layout
 */
export const DEFAULT_GRID_CONFIG: GridLayoutConfig = {
	cellWidth: 100,
	cellHeight: 80,
	xPadding: 50,
	yPadding: 60,
	levelMultiplier: 1.2,     // Higher values = more vertical spread
	domainSpread: 1.8,        // Higher values = more horizontal spread
	centerWeight: 0.7,        // How much to pull common nodes toward center
	routingMode: 'manhattan'  // Default to manhattan routing
};

/**
 * Default configuration for polar layout (legacy)
 */
export const DEFAULT_CONFIG: LayoutConfig = {
	radiusStep: 80,
	centerRadius: 50,
	startAngle: 30,
	angleSpread: 300,
	padding: 50,
	centralityFactor: 0.5,
	pathSpacing: 0.8,
	jitter: 0.1
};
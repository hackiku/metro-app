// src/app/_components/metro/engine/types.ts

// --- Layout Output Structures ---

/**
 * Represents a single node (position instance) in the calculated layout.
 */

// src/app/_components/metro/engine/types.ts - PolarGridConfig Update

export interface PolarGridConfig {
	layoutType: 'polarGrid';          // Discriminator for the layout type

	// Radius definition
	midLevelRadius: number;           // Radius for the 'middle' level(s)
	radiusStep: number;               // Change in radius per level away from the middle
	minRadius?: number;               // Optional minimum radius (innermost ring)

	// Angle definition
	numAngleSteps: number;            // How many radial lines (e.g., 8 for 45-degree steps)
	angleOffsetDegrees?: number;      // Optional rotation offset for the entire grid

	// Placement options
	levelGrouping?: 'nearest' | 'floor' | 'ceiling'; // How to group levels onto radius rings
	pullInterchanges?: number;        // Factor (0-1) to pull interchange nodes towards average angle/radius

	// General
	padding: number;                  // Padding around the calculated bounds
	nodeSortKey?: 'level' | 'sequence_in_path'; // How to order nodes for line drawing

	// New options for improved layout
	pathSpacingFactor?: number;       // Controls angular spacing between adjacent paths (default: 1.0)
	levelSpreadFactor?: number;       // Controls how much levels spread outward (default: 1.0)
	snapPathsToGrid?: boolean;        // Whether to snap paths to grid angles
	snapRadiusToGrid?: boolean;       // Whether to snap radius to discrete steps
	radiusRingStep?: number;          // Step size for radius rings if snapping
	useJitter?: boolean;              // Whether to add slight random variation to positions
	jitterAmount?: number;            // Amount of jitter to apply (0-1, default: 0.02)
}
export interface LayoutNode {
	id: string;                // Unique ID (e.g., PositionDetail ID)
	positionId: string;        // ID of the generic Position
	careerPathId: string;      // ID of the CareerPath this node instance belongs to
	level: number;             // Seniority level
	name: string;              // Display name (from Position)
	x: number;                 // Calculated X coordinate
	y: number;                 // Calculated Y coordinate
	color: string;             // Inherited from CareerPath
	isInterchange?: boolean;   // Flag if position exists in multiple paths
	relatedPaths?: string[];   // IDs of paths this position is part of
	sequence_in_path?: number | null; // Optional ordering within a path/level
}

/**
 * Represents a career path line connecting ordered nodes.
 */
export interface LayoutPath {
	id: string;                // CareerPath ID
	name: string;              // CareerPath name
	color: string;             // CareerPath color
	nodes: string[];           // Ordered list of LayoutNode IDs belonging to this path
}

/**
 * Defines the bounding box of the entire layout.
 */
export interface LayoutBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

/**
 * Configuration options for the Polar Grid layout engine.
 */
export interface PolarGridConfig {
	layoutType: 'polarGrid';    // Discriminator for the layout type
	// Radius definition
	midLevelRadius: number;     // Radius for the 'middle' level(s)
	radiusStep: number;         // Change in radius per level away from the middle
	minRadius?: number;         // Optional minimum radius (innermost ring)
	// Angle definition
	numAngleSteps: number;      // How many radial lines (e.g., 8 for 45-degree steps)
	angleOffsetDegrees?: number;// Optional rotation offset for the entire grid
	// Placement options
	levelGrouping?: 'nearest' | 'floor' | 'ceiling'; // How to group levels onto radius rings
	pullInterchanges?: number;  // Factor (0-1) to pull interchange nodes towards average angle/radius
	// General
	padding: number;            // Padding around the calculated bounds
	nodeSortKey?: 'level' | 'sequence_in_path'; // How to order nodes for line drawing
}

/**
 * The complete layout data structure returned by the engine.
 */
export interface LayoutData {
	nodes: LayoutNode[];                    // Array of all nodes
	nodesById: Record<string, LayoutNode>;  // Nodes indexed by their ID
	paths: LayoutPath[];                    // Array of all paths
	pathsById: Record<string, LayoutPath>;  // Paths indexed by their ID
	bounds: LayoutBounds;                   // Calculated bounds
	configUsed: PolarGridConfig;            // The configuration used
}

// --- Input Data Structures (Mirroring your likely DB types) ---
// Assuming these might be imported from a central types file elsewhere
// For completeness if running standalone:
export interface Position {
	id: string;
	name: string;
	description?: string | null;
	organization_id: string;
	created_at: string;
	updated_at?: string | null;
	tenant_id?: string | null;
}

export interface CareerPath {
	id: string;
	name: string;
	description?: string | null;
	color?: string | null;
	organization_id: string;
	created_at: string;
	updated_at?: string | null;
	tenant_id?: string | null;
}

export interface PositionDetail {
	id: string; // Unique ID for this entry in the join table
	position_id: string;
	career_path_id: string;
	level: number;
	sequence_in_path?: number | null; // Optional ordering within a path at the same level
	created_at: string;
	updated_at?: string | null;
	tenant_id?: string | null;
	organization_id: string;
}


// --- Internal Helper Types used by engine files ---
export interface PolarPoint {
	radius: number;
	angleDegrees: number;
}

export interface Point {
	x: number;
	y: number;
}

// Can add other internal types like GridCell, Direction if needed by engines
// For example, if keeping the grid layout engine files:
export interface GridCell {
	x: number;
	y: number;
	occupied: boolean;
	pathId?: string; // Optional: track which path occupies the cell
}

export interface Direction {
	x: number;
	y: number;
}
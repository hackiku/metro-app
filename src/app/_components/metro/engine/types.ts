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
	id: string;        // Career path ID
	name: string;      // Path name
	color: string;     // Path color
	nodes: string[];   // IDs of nodes in this path, ordered by level
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
	configUsed: unknown;                    // Configuration used (type defined by specific layout)
}

/**
 * Raw data types for inputs from database
 */
export interface CareerPath {
	id: string;
	name: string;
	description?: string;
	color: string;
	organization_id?: string;
	created_at?: string;
}

export interface Position {
	id: string;
	name: string;
	base_description?: string;
	organization_id?: string;
	created_at?: string;
}

export interface PositionDetail {
	id: string;
	position_id: string;
	career_path_id: string;
	level: number;
	sequence_in_path?: number | null;
}

/**
 * Grid cell for layout calculations
 */
export interface GridCell {
	x: number;
	y: number;
	occupied: boolean;
	pathId?: string;
}

/**
 * Direction vectors for path routing
 */
export type Direction = {
	x: number;
	y: number;
}

/**
 * Simple point interface
 */
export interface Point {
	x: number;
	y: number;
}
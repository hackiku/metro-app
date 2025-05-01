// src/app/_components/metro/engine/types.ts
import type { CareerPath, Position, PositionDetail } from '~/types/compass';

/**
 * Node representing a position on the metro map
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
	angle: number;             // Central angle (in radians) of this path in the layout
	centralityScore?: number;  // Optional score indicating how central this path is
}

/**
 * Bounding box for the layout
 */
export interface LayoutBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

/**
 * Complete layout data returned by the layout engine
 */
export interface LayoutData {
	nodes: LayoutNode[];                    // All nodes in the layout
	nodesById: Record<string, LayoutNode>;  // Quick lookup by ID
	paths: LayoutPath[];                    // All path metadata
	pathsById: Record<string, LayoutPath>;  // Quick lookup by ID
	bounds: LayoutBounds;                   // Viewport bounds
	configUsed: Required<LayoutConfig>;     // Configuration used
}

/**
 * Configuration options for the layout engine
 */
export interface LayoutConfig {
	radiusStep?: number;          // Distance between levels
	centerRadius?: number;        // Base radius for central nodes (negative for inverse mode)
	startAngle?: number;          // Start angle in degrees (0 = right, 90 = bottom)
	angleSpread?: number;         // Total angle to spread paths over (in degrees)
	padding?: number;             // Padding around content bounds
	midLevelOverride?: number | null; // Force a specific mid-level (null = auto-calculate)
	centralityFactor?: number;    // How much centrality pulls things in
	jitter?: number;              // Small random offset to prevent perfect overlaps
}

// Default configuration
export const DEFAULT_CONFIG: Required<LayoutConfig> = {
	radiusStep: 120,         // Distance between levels (increased)
	centerRadius: -100,      // Negative for inverse mode: expand outward for all
	startAngle: 0,           // Start at 0 degrees (3 o'clock position)
	angleSpread: 360,        // Use full circle
	padding: 80,             // Increased padding
	midLevelOverride: null,  // Auto-calculate mid-level
	centralityFactor: 1.6,   // Strong centrality pull
	jitter: 0.01             // Minimal jitter for cleaner appearance
};
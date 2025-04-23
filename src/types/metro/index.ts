// src/types/metro/index.ts

import type { CareerPath, Position, PositionDetail, Skill } from '~/types/compass';

// Layout node representing a station on the map
export interface LayoutNode {
	id: string;                   // PositionDetail ID
	positionId: string;           // Position ID
	careerPathId: string;         // Career path this node belongs to
	level: number;                // Seniority level
	name: string;                 // Display name
	x: number;                    // X coordinate
	y: number;                    // Y coordinate
	color: string;                // Color from career path
	isInterchange: boolean;       // Whether position appears in multiple paths
	relatedPaths?: string[];      // IDs of all paths this position appears in
}

// Complete layout data structure
export interface LayoutData {
	nodes: LayoutNode[];                   // All nodes in the layout
	nodesById: Record<string, LayoutNode>; // Quick lookup by ID
	pathsById: Record<string, LayoutPath>; // Path data by path ID
	bounds: LayoutBounds;                  // Viewport bounds
	configUsed: LayoutConfig;              // Configuration used
}

// Path metadata for rendering
export interface LayoutPath {
	id: string;                   // Career path ID
	color: string;                // Path color
	name: string;                 // Path name
	nodes: string[];              // IDs of nodes in this path, ordered by level
	angle: number;                // Central angle of this path
}

// Layout viewport bounds
export interface LayoutBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

// Configuration options
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
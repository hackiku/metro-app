// src/app/_components/metro/d3-logic/types.ts
import type * as d3 from 'd3';
import type { MetroStation, MetroLine } from '../types/metro';

// --- Enhanced Types based on U-Bahn example ---

export type LabelPosition = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type StationVisualStyle = 'single' | 'interchange' | 'connector'; // connector for non-station points

// Represents a point along a line's path in the abstract grid
// Could be a station or just a shaping point
export interface PathNode {
	x: number;
	y: number;
	// Optional properties for path generation logic (like U-Bahn's 'dir')
	curveAfter?: 'N' | 'E' | 'S' | 'W'; // Hint for curve direction after this node
}

// Extends the base MetroStation with visual/layout properties
export interface EnhancedMetroStation extends MetroStation, PathNode {
	label?: string; // Optional override for display label (e.g., with line breaks)
	labelPos?: LabelPosition; // Relative position for the label
	labelAngle?: number; // Rotation angle for the label
	isLabelBold?: boolean; // Make label bold
	visualStyle: StationVisualStyle; // How to draw the station marker
	// Coordinate shift for drawing (if lines run parallel) - relative to lineWidth
	shiftX?: number;
	shiftY?: number;
	// Label position shift (if different from node shift) - relative to lineWidth
	labelShiftX?: number;
	labelShiftY?: number;
	// Optional S-Bahn style indicator if needed later
	sBahn?: boolean;
}

// Extends the base MetroLine
export interface EnhancedMetroLine extends Omit<MetroLine, 'stations'> {
	// Sequence of nodes defining the line's path
	pathNodes: PathNode[];
	// Stations present on this line (references to EnhancedMetroStation objects)
	stations: EnhancedMetroStation[];
	// Base shift for the entire line (for parallel drawing) - relative to lineWidth
	shiftX?: number;
	shiftY?: number;
	// Is the line drawn dashed?
	dashed?: boolean;
}

// Data structure expected by the D3 rendering logic
export interface EnhancedMetroMapData {
	lines: EnhancedMetroLine[];
	stations: { [id: string]: EnhancedMetroStation }; // Stations keyed by ID for easy lookup
}

// Type for scale functions
export interface MetroScales {
	xScale: d3.ScaleLinear<number, number>;
	yScale: d3.ScaleLinear<number, number>;
}

// Type for the path generator function signature
export type PathGenerator = (
	nodes: PathNode[],
	scales: MetroScales,
	lineWidth: number,
	shiftX?: number, // Line's base shift
	shiftY?: number
) => string;
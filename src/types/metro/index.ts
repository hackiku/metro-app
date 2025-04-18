// src/types/metro/index.ts

/**
 * Metro visualization types
 */

export interface Point {
	x: number;
	y: number;
}

// D3-Ready Metro Types
export interface MetroNode {
	id: string;
	name?: string;
	x: number;
	y: number;
	level: number;
	isInterchange?: boolean;
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
	pathId?: string;
}

export interface MetroData {
	lines: MetroLine[];
	connections: MetroConnection[];
}

// Configuration Types
export interface RendererConfig {
	margin: { top: number; right: number; bottom: number; left: number };
	lineWidth: number;
	nodeRadius: number;
	interchangeNodeRadius: number;
	padding: number;
	debugGrid: boolean;
}

export interface ViewportConfig {
	initialZoom: number;
	minZoom: number;
	maxZoom: number;
	zoomFactor: number;
}

// Map interaction and event types
export interface NodeEventData {
	nodeId: string;
	nodeInfo?: any;
}

export interface MapRenderOptions {
	highlightSelectedPath?: boolean;
	renderConnections?: boolean;
	metroStylePaths?: boolean;
	roundedCorners?: boolean;
}

// Layout configuration
export interface LayoutConfig {
	levelSpacing: number;
	pathSpacing: number;
	interchangeRadius: number;
	junctionOffset: number;
	padding: number;
}
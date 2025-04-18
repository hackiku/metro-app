// src/app/_components/metro/geometry/types.ts
export interface Point {
	x: number;
	y: number;
}

export interface MetroNode {
	id: string;
	level: number;
	pathIds: string[];
	position: Point;
	isInterchange: boolean;
}

export interface MetroPath {
	id: string;
	color: string;
	nodes: MetroNode[];
}

export interface MetroConnection {
	fromId: string;
	toId: string;
	isRecommended: boolean;
	pathId: string;
}

export interface LayoutConfig {
	levelSpacing: number;
	pathSpacing: number;
	interchangeRadius: number;
	junctionOffset: number;
	padding: number;
}
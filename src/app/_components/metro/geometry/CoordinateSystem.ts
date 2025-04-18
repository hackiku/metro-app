
// src/app/_components/metro/geometry/coordinateSystem.ts
import type { Point, LayoutConfig } from './types';

export class CoordinateSystem {
	private boundaries: { minX: number; minY: number; maxX: number; maxY: number };
	private config: LayoutConfig;

	constructor(config: LayoutConfig) {
		this.config = config;
		this.boundaries = { minX: 0, minY: 0, maxX: 1000, maxY: 600 };
	}

	// Calculate viewport dimensions based on nodes
	calculateBoundaries(nodes: { position: Point }[]): void {
		const padding = this.config.padding;

		if (!nodes || nodes.length === 0) {
			this.boundaries = { minX: 0, minY: 0, maxX: 1000, maxY: 600 };
			return;
		}

		const minX = Math.min(...nodes.map(n => n.position.x)) - padding;
		const minY = Math.min(...nodes.map(n => n.position.y)) - padding;
		const maxX = Math.max(...nodes.map(n => n.position.x)) + padding;
		const maxY = Math.max(...nodes.map(n => n.position.y)) + padding;

		this.boundaries = { minX, minY, maxX, maxY };
	}

	// Get current viewport as SVG viewBox string
	getViewBox(): string {
		const { minX, minY, maxX, maxY } = this.boundaries;
		return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
	}

	// Transform point from data space to pixel space
	transformPoint(point: Point, zoom: number, pan: Point): Point {
		return {
			x: point.x * zoom + pan.x,
			y: point.y * zoom + pan.y
		};
	}

	// Calculate position based on level and path index
	calculatePosition(level: number, pathIndex: number): Point {
		return {
			x: this.config.padding + level * this.config.levelSpacing,
			y: this.config.padding + pathIndex * this.config.pathSpacing
		};
	}
}


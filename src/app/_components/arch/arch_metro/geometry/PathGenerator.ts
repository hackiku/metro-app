// src/app/_components/metro/geometry/PathGenerator.ts
import type { Point, MetroNode, MetroPath } from './types';

export class PathGenerator {
	// Generate simple SVG path between two points
	static linePath(from: Point, to: Point): string {
		return `M ${from.x},${from.y} L ${to.x},${to.y}`;
	}

	// Generate straight path connecting all nodes in a path
	static straightPath(nodes: MetroNode[]): string {
		if (!nodes || nodes.length < 2) return '';

		// Sort nodes by level to ensure proper ordering
		const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);
		const points = sortedNodes.map(node => node.position);

		// Build the path string
		let pathData = `M ${points[0].x},${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			pathData += ` L ${points[i].x},${points[i].y}`;
		}

		return pathData;
	}

	// Generate an orthogonal path with right angles (metro-style)
	static metroPath(nodes: MetroNode[]): string {
		if (!nodes || nodes.length < 2) return '';

		// Sort nodes by level
		const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);
		const points = sortedNodes.map(node => node.position);

		let pathData = `M ${points[0].x},${points[0].y}`;

		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const curr = points[i];

			// For horizontal segment then vertical segment
			if (Math.abs(curr.y - prev.y) > 5) {
				// Add a mid-point to create orthogonal segments
				const midX = prev.x + (curr.x - prev.x) / 2;
				pathData += ` L ${midX},${prev.y} L ${midX},${curr.y} L ${curr.x},${curr.y}`;
			} else {
				// Just a horizontal line
				pathData += ` L ${curr.x},${curr.y}`;
			}
		}

		return pathData;
	}

	// Generate a curved connection between two points
	static curvedConnection(from: Point, to: Point): string {
		const midX = (from.x + to.x) / 2;

		return `
      M ${from.x},${from.y} 
      C ${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}
    `;
	}
}
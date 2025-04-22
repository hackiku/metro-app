// src/app/_components/metro/d3/pathGenerator.ts
import * as d3 from 'd3';
import type { MetroNode } from '~/types/metro';

interface ScaleOptions {
	xScale: d3.ScaleLinear<number, number, never>;
	yScale: d3.ScaleLinear<number, number, never>;
}

interface PathOptions {
	orthogonal?: boolean;
	roundedCorners?: boolean;
	cornerRadius?: number;
}

/**
 * Generate SVG path data for connecting metro line nodes
 * 
 * @param nodes Array of nodes to connect
 * @param scales D3 scales for x and y coordinates
 * @param options Path generation options
 * @returns SVG path data string
 */
export function generateLinePath(
	nodes: MetroNode[],
	scales: ScaleOptions,
	options: PathOptions = {}
): string {
	// Default options
	const {
		orthogonal = true,
		roundedCorners = true,
		cornerRadius = 10
	} = options;

	// Handle empty or single node case
	if (!nodes || nodes.length < 2) return '';

	// Sort nodes by level to ensure proper ordering
	const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);

	// Map data coordinates to screen coordinates
	const { xScale, yScale } = scales;
	const points = sortedNodes.map(node => ({
		x: xScale(node.x),
		y: yScale(node.y),
		id: node.id,
		level: node.level
	}));

	// Start path at the first point
	let pathData = `M ${points[0].x},${points[0].y}`;

	// Connect subsequent points
	for (let i = 1; i < points.length; i++) {
		const prev = points[i - 1];
		const curr = points[i];

		// Calculate the difference between points
		const dx = curr.x - prev.x;
		const dy = curr.y - prev.y;

		if (orthogonal && (Math.abs(dx) > 5 && Math.abs(dy) > 5)) {
			// For non-horizontal/vertical segments, create orthogonal path

			// Calculate midpoint for the bend
			const midX = prev.x + dx / 2;

			if (roundedCorners) {
				// Use smooth curve for corners
				// First segment: horizontal line to midpoint minus corner radius
				pathData += ` L ${midX - Math.sign(dx) * cornerRadius},${prev.y}`;

				// Corner: quadratic bezier curve
				pathData += ` Q ${midX},${prev.y} ${midX},${prev.y + Math.sign(dy) * cornerRadius}`;

				// Second segment: vertical line to next point's y minus corner radius
				pathData += ` L ${midX},${curr.y - Math.sign(dy) * cornerRadius}`;

				// Corner: quadratic bezier curve
				pathData += ` Q ${midX},${curr.y} ${midX + Math.sign(dx) * cornerRadius},${curr.y}`;

				// Third segment: horizontal line to destination
				pathData += ` L ${curr.x},${curr.y}`;
			} else {
				// Use sharp corners
				pathData += ` L ${midX},${prev.y}`;
				pathData += ` L ${midX},${curr.y}`;
				pathData += ` L ${curr.x},${curr.y}`;
			}
		} else {
			// For horizontal or vertical segments, or when orthogonal is disabled
			pathData += ` L ${curr.x},${curr.y}`;
		}
	}

	return pathData;
}

/**
 * Generate path data for a curved connection between nodes
 * 
 * @param sourceNode Source node
 * @param targetNode Target node
 * @param scales D3 scales
 * @returns SVG path data string
 */
export function generateConnectionPath(
	sourceNode: MetroNode,
	targetNode: MetroNode,
	scales: ScaleOptions
): string {
	const { xScale, yScale } = scales;

	// Convert node coordinates to screen space
	const x1 = xScale(sourceNode.x);
	const y1 = yScale(sourceNode.y);
	const x2 = xScale(targetNode.x);
	const y2 = yScale(targetNode.y);

	// Calculate midpoint for the control point
	const midX = (x1 + x2) / 2;

	// Generate curved connection using cubic bezier
	return `M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
}

/**
 * Generate a metro-style orthogonal path with multiple segments
 * Following the pattern: horizontal -> vertical -> horizontal
 * 
 * @param nodes Array of nodes to connect
 * @param scales D3 scales for x and y coordinates
 * @returns SVG path data string
 */
export function generateMetroStylePath(
	nodes: MetroNode[],
	scales: ScaleOptions
): string {
	if (!nodes || nodes.length < 2) return '';

	// Sort nodes by level
	const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);
	const { xScale, yScale } = scales;

	// Start at the first node
	const firstNode = sortedNodes[0];
	let pathData = `M ${xScale(firstNode.x)},${yScale(firstNode.y)}`;

	for (let i = 1; i < sortedNodes.length; i++) {
		const prev = sortedNodes[i - 1];
		const curr = sortedNodes[i];

		// For each segment, draw horizontal then vertical
		const midX = (prev.x + curr.x) / 2;

		pathData += ` L ${xScale(midX)},${yScale(prev.y)}`;
		pathData += ` L ${xScale(midX)},${yScale(curr.y)}`;
		pathData += ` L ${xScale(curr.x)},${yScale(curr.y)}`;
	}

	return pathData;
}
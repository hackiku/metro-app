// src/app/_components/metro/d3-logic/pathGenerator.ts
import * as d3 from 'd3';
import type { PathNode, MetroScales } from './types';

// Config
const CURVE_RADIUS_FACTOR = 1.5; // How sharp are the curves (relative to lineWidth)
const SQRT_2 = Math.sqrt(2);

/**
 * Generates an SVG path string for a metro line, handling straight segments
 * and attempting simple 90-degree curves inspired by the U-Bahn example.
 * Uses abstract grid coordinates.
 */
export function generateEnhancedLinePath(
	nodes: PathNode[],
	scales: MetroScales,
	lineWidth: number,
	baseShiftX: number = 0,
	baseShiftY: number = 0
): string {
	if (nodes.length < 2) return '';

	const { xScale, yScale } = scales;
	const pathSegments: string[] = [];

	// Helper to scale and shift coordinates
	const scalePoint = (node: PathNode): [number, number] => {
		// Note: U-Bahn shift was relative to grid units, here using lineWidth
		const shiftOffsetX = (node.shiftX ?? baseShiftX) * lineWidth;
		const shiftOffsetY = (node.shiftY ?? baseShiftY) * lineWidth;
		return [
			xScale(node.x) + shiftOffsetX,
			yScale(node.y) + shiftOffsetY,
		];
	};

	// Start path
	const startPoint = scalePoint(nodes[0]);
	pathSegments.push(`M ${startPoint[0]},${startPoint[1]}`);

	for (let i = 1; i < nodes.length; i++) {
		const prevNode = nodes[i - 1];
		const currNode = nodes[i];
		const nextNode = nodes[i + 1]; // Can be undefined

		const prevPoint = scalePoint(prevNode);
		const currPoint = scalePoint(currNode);

		const dx = currNode.x - prevNode.x;
		const dy = currNode.y - prevNode.y;

		const isHorizontal = Math.abs(dy) < 1e-6;
		const isVertical = Math.abs(dx) < 1e-6;
		const isDiagonal = Math.abs(Math.abs(dx) - Math.abs(dy)) < 1e-6 && !isHorizontal && !isVertical;

		// Check if the *next* segment implies a curve at the *current* node
		let needsCurve = false;
		let nextDx = 0, nextDy = 0;
		if (nextNode) {
			nextDx = nextNode.x - currNode.x;
			nextDy = nextNode.y - currNode.y;
			const nextIsHorizontal = Math.abs(nextDy) < 1e-6;
			const nextIsVertical = Math.abs(nextDx) < 1e-6;

			// Simple 90-degree turn detection
			if ((isHorizontal && nextIsVertical) || (isVertical && nextIsHorizontal)) {
				needsCurve = true;
			}
			// Add more complex curve conditions here if needed
		}

		if (needsCurve && (isHorizontal || isVertical)) {
			// Draw line up to the point where the curve starts
			const curveRadius = CURVE_RADIUS_FACTOR * lineWidth;
			const lineLengthX = Math.abs(currPoint[0] - prevPoint[0]);
			const lineLengthY = Math.abs(currPoint[1] - prevPoint[1]);

			// Determine direction factors
			const dirX = Math.sign(currPoint[0] - prevPoint[0]);
			const dirY = Math.sign(currPoint[1] - prevPoint[1]);
			const nextDirX = Math.sign(nextDx);
			const nextDirY = Math.sign(nextDy);

			// Point where the line segment ends before the curve
			const curveStartPointX = currPoint[0] - dirX * curveRadius;
			const curveStartPointY = currPoint[1] - dirY * curveRadius;

			if (lineLengthX > curveRadius || lineLengthY > curveRadius) {
				pathSegments.push(`L ${curveStartPointX},${curveStartPointY}`);
			} else {
				// Very short segment, just go to the corner point to avoid weird curves
				// Or potentially skip the curve if segments are too short
				pathSegments.push(`L ${currPoint[0]},${currPoint[1]}`);
				console.warn("Skipping curve due to short segment before node:", currNode);
				continue; // Skip curve drawing for this node
			}


			// Point where the curve ends and the next segment starts
			const curveEndPointX = currPoint[0] + nextDirX * curveRadius;
			const curveEndPointY = currPoint[1] + nextDirY * curveRadius;


			// Add the quadratic curve (simple 90-degree turn)
			// The control point is the corner itself
			pathSegments.push(`Q ${currPoint[0]},${currPoint[1]} ${curveEndPointX},${curveEndPointY}`);

			// Adjust the starting point for the *next* iteration's segment calculation
			// (important because we've already drawn part of the next segment via the curve)
			// This is tricky, U-Bahn example handles state implicitly.
			// For simplicity here, the next 'L' command will start from curveEndPoint.
			// We might need to adjust the *next* iteration to know it starts mid-segment.
			// Let's manually adjust the start for the *next* line segment here.
			if (i + 1 < nodes.length) {
				const nextScaled = scalePoint(nodes[i + 1]);
				pathSegments.push(`L ${nextScaled[0]},${nextScaled[1]}`);
				i++; // Skip the next node's standard L draw since we handled it
			}

		} else if (isHorizontal || isVertical || isDiagonal) {
			// Straight line segment (Horizontal, Vertical, or 45-degree Diagonal)
			pathSegments.push(`L ${currPoint[0]},${currPoint[1]}`);
		} else {
			// Non-simple angle - use a straight line for now, or implement cubic Bezier later
			console.warn(`Complex angle detected between nodes ${i - 1} and ${i}. Using straight line.`);
			pathSegments.push(`L ${currPoint[0]},${currPoint[1]}`);
		}
	}

	return pathSegments.join(' ');
}

/**
 * Placeholder for a potentially more advanced generator using D3's line/curve functions
 * if the manual approach becomes too complex.
 */
// export function generateD3CurvePath(...) { ... }
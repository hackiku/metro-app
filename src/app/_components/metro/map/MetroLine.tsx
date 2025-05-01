// src/app/_components/metro/map/MetroLine.tsx
"use client";

import React, { useMemo } from 'react';
import type { LayoutPath, LayoutNode } from '../engine/types';
import { generatePathSegments, generateSvgPathData } from '../engine/pathDrawer';

interface MetroLineProps {
	path: LayoutPath;
	nodes: LayoutNode[];
	lineWidth?: number;
	opacity?: number;
	isSelected?: boolean;
}

/**
 * Renders a metro line connecting nodes of the same career path.
 * Improved with visual cues and optional highlighting.
 */
export default function MetroLine({
	path,
	nodes,
	lineWidth = 1,
	opacity = 0.9,
	isSelected = false
}: MetroLineProps) {

	const { pathData, markers } = useMemo(() => {
		if (nodes.length < 2) return { pathData: '', markers: [] };

		// Generate path points using manhattan routing
		const pathPoints = generatePathSegments(nodes);

		// Convert points to SVG path data
		const pathData = generateSvgPathData(pathPoints);

		// Generate markers for the path (e.g., direction indicators)
		// For each segment longer than a certain threshold
		const markers: Array<{ x: number, y: number, angle: number }> = [];

		// Add direction indicators on longer segments
		for (let i = 0; i < pathPoints.length - 1; i++) {
			const current = pathPoints[i];
			const next = pathPoints[i + 1];

			// Calculate segment length
			const dx = next.x - current.x;
			const dy = next.y - current.y;
			const length = Math.sqrt(dx * dx + dy * dy);

			// Only add markers for longer segments
			if (length > 70) {
				// Calculate the midpoint of this segment
				const midX = current.x + dx * 0.5;
				const midY = current.y + dy * 0.5;

				// Calculate angle for rotation
				const angle = Math.atan2(dy, dx) * (180 / Math.PI);

				markers.push({ x: midX, y: midY, angle });
			}
		}

		return { pathData, markers };
	}, [nodes]);

	// If there are no nodes or only one node, don't render
	if (nodes.length < 2) return null;

	// Modify styles based on selection state
	const highlightStrokeWidth = isSelected ? lineWidth + 2 : lineWidth;
	const pathOpacity = isSelected ? 1 : opacity;


  return (
		<g className="metro-line">
			{/* Background stroke for better visibility */}
			<path
				d={pathData}
				stroke="rgba(0,0,0,0.3)"
				strokeWidth={lineWidth + 2}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
				opacity={0.3}
				className="metro-line-shadow"
				vectorEffect="non-scaling-stroke" // Keep stroke width consistent when zooming
			/>

			{/* Main path line */}
			<path
				d={pathData}
				stroke={path.color}
				strokeWidth={lineWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
				opacity={pathOpacity}
				className="metro-line-main transition-all duration-300"
				vectorEffect="non-scaling-stroke" // Keep stroke width consistent when zooming
				data-path-id={path.id}
			/>


			{/* Optional direction markers */}
			{markers.map((marker, index) => (
				<g
					key={`marker-${index}`}
					transform={`translate(${marker.x}, ${marker.y}) rotate(${marker.angle})`}
					className="metro-line-marker"
				>
					{/* Simple arrow or dot marker */}
					<circle
						r={lineWidth / 2}
						fill={path.color}
						opacity={pathOpacity}
						className="metro-line-dot"
					/>
				</g>
			))}
		</g>
	);
}
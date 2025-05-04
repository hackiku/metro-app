// src/app/_components/metro/map/MetroLine.tsx
"use client";

import React, { useMemo } from 'react';
import type { LayoutPath, LayoutNode } from '~/types/engine';

interface MetroLineProps {
	path: LayoutPath;
	nodes: LayoutNode[];
	lineWidth?: number;
	opacity?: number;
	isSelected?: boolean;
}

/**
 * Renders a metro line connecting nodes of the same career path.
 * Uses direct lines between nodes without intermediate routing points.
 */
export default function MetroLine({
	path,
	nodes,
	lineWidth = 2,
	opacity = 0.9,
	isSelected = false
}: MetroLineProps) {

	const pathData = useMemo(() => {
		if (nodes.length < 2) return '';

		// Sort nodes by level and sequence
		const sortedNodes = [...nodes].sort((a, b) => {
			// First sort by level
			const levelDiff = a.level - b.level;
			if (levelDiff !== 0) return levelDiff;

			// Then by sequence if available
			if (a.sequence_in_path != null && b.sequence_in_path != null) {
				return a.sequence_in_path - b.sequence_in_path;
			}

			return 0;
		});

		// Generate path data as a series of connected line segments
		let data = `M ${sortedNodes[0].x} ${sortedNodes[0].y}`;

		for (let i = 1; i < sortedNodes.length; i++) {
			data += ` L ${sortedNodes[i].x} ${sortedNodes[i].y}`;
		}

		return data;
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
		</g>
	);
}
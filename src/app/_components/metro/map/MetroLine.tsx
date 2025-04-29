// src/app/_components/metro/map/MetroLine.tsx
"use client";

import React, { useMemo } from 'react';
import type { LayoutPath, LayoutNode } from '../engine/types';
import { generateManhattanSegments, generateSvgPathData } from '../engine/pathRouting';

interface MetroLineProps {
	path: LayoutPath;
	nodes: LayoutNode[];
	lineWidth?: number;
	opacity?: number;
}

/**
 * Renders a metro line connecting nodes of the same career path.
 */
export default function MetroLine({
	path,
	nodes,
	lineWidth = 4,
	opacity = 0.8
}: MetroLineProps) {
	// Generate SVG path data for this line
	const pathData = useMemo(() => {
		if (nodes.length < 2) return '';

		// Generate path points using manhattan routing
		const pathPoints = generateManhattanSegments(nodes);

		// Convert points to SVG path data
		return generateSvgPathData(pathPoints);
	}, [nodes]);

	// If there are no nodes or only one node, don't render
	if (nodes.length < 2) return null;

	// Render the line
	return (
		<path
			d={pathData}
			stroke={path.color}
			strokeWidth={lineWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
			opacity={opacity}
			className="transition-opacity duration-300"
			data-path-id={path.id}
		/>
	);
}
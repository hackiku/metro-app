// src/app/_components/metro/map/MetroLine.tsx
"use client";

import React, { useMemo } from 'react';
import type { LayoutPath, LayoutNode } from '../engine/types';
import { generatePath } from '../engine/manhattanRoute';
import type { RouteMode } from '../engine/manhattanRoute';

interface MetroLineProps {
	path: LayoutPath;
	nodes: LayoutNode[];
	isSelected?: boolean;
	lineWidth?: number;
	opacity?: number;
	routeMode?: RouteMode;
	cornerRadius?: number;
}

/**
 * Renders a metro line connecting nodes of the same career path.
 * 
 * @param path - The career path data
 * @param nodes - All nodes for this path
 * @param isSelected - Whether this line is currently selected
 * @param lineWidth - Width of the line
 * @param opacity - Opacity of the line
 * @param routeMode - Routing algorithm: 'direct', 'manhattan', or 'smooth'
 * @param cornerRadius - Corner radius for smooth paths (0 for sharp corners)
 */
export default function MetroLine({
	path,
	nodes,
	isSelected = false,
	lineWidth = 5,
	opacity = 0.8,
	routeMode = 'manhattan',
	cornerRadius = 0
}: MetroLineProps) {
	// Generate SVG path data for this line
	const pathData = useMemo(() => {
		if (nodes.length < 2) return '';

		// Use the new path generation utilities
		return generatePath(
			nodes,
			routeMode,
			{
				cornerRadius,
				verticalFirst: true,
				minSegmentLength: 10,
				levelPriority: true
			}
		);
	}, [nodes, routeMode, cornerRadius]);

	// If there are no nodes or only one node, don't render
	if (nodes.length < 2) return null;

	// Render the line
	return (
		<path
			d={pathData}
			stroke={path.color}
			strokeWidth={lineWidth * (isSelected ? 1.4 : 1)}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
			opacity={isSelected ? 1 : opacity}
			className="metro-line transition-all duration-300"
			data-path-id={path.id}
		/>
	);
}
// src/app/_components/metro/map/MetroLine.tsx
"use client";

import React, { useMemo } from 'react';
import type { LayoutPath, LayoutNode } from '../engine/types';

interface MetroLineProps {
	path: LayoutPath;
	nodes: LayoutNode[];
	isSelected?: boolean;
	lineWidth?: number;
	opacity?: number;
}

/**
 * Renders a metro line connecting nodes of the same career path.
 * 
 * @param path - The career path data
 * @param nodes - All nodes for this path
 * @param isSelected - Whether this line is currently selected
 * @param lineWidth - Width of the line
 * @param opacity - Opacity of the line
 */
export default function MetroLine({
	path,
	nodes,
	isSelected = false,
	lineWidth = 5,
	opacity = 0.8
}: MetroLineProps) {
	// Generate SVG path data for this line
	const pathData = useMemo(() => {
		if (!nodes.length) return '';

		// Sort nodes by level for a smoother path
		const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);

		// Simple path connecting nodes in level order
		let data = `M ${sortedNodes[0].x} ${sortedNodes[0].y}`;

		for (let i = 1; i < sortedNodes.length; i++) {
			data += ` L ${sortedNodes[i].x} ${sortedNodes[i].y}`;
		}

		return data;
	}, [nodes]);

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
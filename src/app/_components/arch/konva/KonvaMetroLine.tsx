// src/app/_components/metro/konva/KonvaMetroLine.tsx

"use client";

import React, { useMemo } from 'react';
import { Line, Group } from 'react-konva';
import type { LayoutPath, LayoutNode } from '~/types/engine';
import { generatePathSegments } from '~/app/_components/metro/engine/pathDrawer';
import { useMetroMap } from '~/contexts/MetroMapContext';

interface KonvaMetroLineProps {
	path: LayoutPath;
	nodes: LayoutNode[];
	isSelected?: boolean;
	lineWidth?: number;
	opacity?: number;
}

export function KonvaMetroLine({
	path,
	nodes,
	isSelected = false,
	lineWidth = 4,
	opacity = 0.9
}: KonvaMetroLineProps) {
	const { viewport } = useMetroMap();

	// The path data as points for Konva Line
	const pathData = useMemo(() => {
		if (nodes.length < 2) return [];

		// Generate path segments using the existing engine function
		const pathPoints = generatePathSegments(nodes);

		// Convert to flat array for Konva Line [x1, y1, x2, y2, ...]
		return pathPoints.flatMap(point => [point.x, point.y]);
	}, [nodes]);

	// If there are no nodes or only one node, don't render
	if (nodes.length < 2 || pathData.length < 4) return null;

	// Modify styles based on selection state
	const highlightStrokeWidth = isSelected ? lineWidth + 2 : lineWidth;
	const pathOpacity = isSelected ? 1 : opacity;

	// Calculate an adjusted line width that maintains visual consistency regardless of zoom
	// This is a key improvement over the SVG approach
	const adjustedLineWidth = highlightStrokeWidth / viewport.scale;

	return (
		<Group>
			{/* Shadow/Background line for better visibility */}
			<Line
				points={pathData}
				stroke="rgba(0,0,0,0.3)"
				strokeWidth={adjustedLineWidth + (2 / viewport.scale)}
				lineCap="round"
				lineJoin="round"
				opacity={0.3}
				perfectDrawEnabled={false}
				listening={false}
			/>

			{/* Main path line */}
			<Line
				points={pathData}
				stroke={path.color}
				strokeWidth={adjustedLineWidth}
				lineCap="round"
				lineJoin="round"
				opacity={pathOpacity}
				perfectDrawEnabled={false}
				listening={false}
			/>
		</Group>
	);
}
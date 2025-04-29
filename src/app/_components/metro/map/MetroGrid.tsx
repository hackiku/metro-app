// src/app/_components/metro/map/MetroGrid.tsx
"use client";

import React from 'react';
import type { LayoutData } from '../engine/types';

interface MetroGridProps {
	layout: LayoutData;
	showCoordinates?: boolean;
	opacity?: number;
}

/**
 * Enhanced grid overlay to visualize the layout structure
 * Shows the cell structure used by the Manhattan algorithm
 */
export default function MetroGrid({
	layout,
	showCoordinates = true,
	opacity = 0.2,
}: MetroGridProps) {
	if (!layout) return null;

	const { bounds, configUsed } = layout;

	// Get grid config
	const cellWidth = (configUsed as any)?.cellWidth || 100;
	const cellHeight = (configUsed as any)?.cellHeight || 100;

	// Calculate grid lines based on bounds and cell dimensions
	const xLines = [];
	const yLines = [];
	const plusMarkers = [];

	// X grid lines (vertical)
	for (let x = Math.floor(bounds.minX / cellWidth) * cellWidth; x <= bounds.maxX; x += cellWidth) {
		xLines.push(
			<line
				key={`x-${x}`}
				x1={x}
				y1={bounds.minY}
				x2={x}
				y2={bounds.maxY}
				stroke="#777777"
				strokeWidth="0.5"
				opacity={opacity}
			/>
		);

		// Optional coordinate labels
		if (showCoordinates && x % (cellWidth * 2) === 0) {
			xLines.push(
				<text
					key={`x-label-${x}`}
					x={x}
					y={bounds.minY + 16}
					fontSize="9px"
					textAnchor="middle"
					fill="#777777"
					opacity={opacity * 2}
				>
					{x}
				</text>
			);
		}
	}

	// Y grid lines (horizontal)
	for (let y = Math.floor(bounds.minY / cellHeight) * cellHeight; y <= bounds.maxY; y += cellHeight) {
		yLines.push(
			<line
				key={`y-${y}`}
				x1={bounds.minX}
				y1={y}
				x2={bounds.maxX}
				y2={y}
				stroke="#777777"
				strokeWidth="0.5"
				opacity={opacity}
			/>
		);

		// Optional coordinate labels
		if (showCoordinates && y % (cellHeight * 2) === 0) {
			yLines.push(
				<text
					key={`y-label-${y}`}
					x={bounds.minX + 16}
					y={y + 4}
					fontSize="9px"
					textAnchor="start"
					fill="#777777"
					opacity={opacity * 2}
				>
					{y}
				</text>
			);
		}
	}

	// Add plus markers at grid intersections
	for (let x = Math.floor(bounds.minX / cellWidth) * cellWidth; x <= bounds.maxX; x += cellWidth) {
		for (let y = Math.floor(bounds.minY / cellHeight) * cellHeight; y <= bounds.maxY; y += cellHeight) {
			plusMarkers.push(
				<path
					key={`plus-${x}-${y}`}
					d={`M ${x - 4} ${y} H ${x + 4} M ${x} ${y - 4} V ${y + 4}`}
					stroke="#777777"
					strokeWidth="1"
					opacity={opacity * 1.5}
				/>
			);
		}
	}

	// Render everything in a group
	return (
		<g className="metro-grid-debug" pointerEvents="none">
			{/* Grid lines */}
			{xLines}
			{yLines}

			{/* Grid intersections */}
			{plusMarkers}

			{/* Debug info panel */}
			<g transform={`translate(${bounds.minX + 10}, ${bounds.maxY - 10})`}>
				<rect
					x={0}
					y={-80}
					width={120}
					height={70}
					fill="var(--background)"
					fillOpacity={0.7}
					rx={4}
					ry={4}
				/>
				<text x={10} y={-60} fontSize="10px" fill="#777777" fontFamily="monospace">
					<tspan x={10} dy={0}>Grid: {cellWidth}×{cellHeight}</tspan>
					<tspan x={10} dy={16}>Paths: {layout.paths.length}</tspan>
					<tspan x={10} dy={16}>Nodes: {layout.nodes.length}</tspan>
					<tspan x={10} dy={16}>Bounds: {Math.round(bounds.maxX - bounds.minX)}×{Math.round(bounds.maxY - bounds.minY)}</tspan>
				</text>
			</g>
		</g>
	);
}
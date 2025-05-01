// src/app/_components/metro/map/MetroGrid.tsx
"use client";

import React from 'react';
import type { LayoutData, GridLayoutConfig } from '../engine/types';

interface MetroGridProps {
	layout: LayoutData;
	showCoordinates?: boolean;
	showNodeIds?: boolean;
	showBounds?: boolean;
	opacity?: number;
}

/**
 * Debug grid overlay to visualize the layout structure
 * This is primarily for development and debugging purposes
 */
export default function MetroGrid({
	layout,
	showCoordinates = true,
	showNodeIds = false,
	showBounds = true,
	opacity = 0.15,
}: MetroGridProps) {
	if (!layout) return null;

	const { bounds, configUsed } = layout;
	// Cast to correct config type since we know we're using grid layout
	const {
		cellWidth,
		cellHeight,
	} = configUsed as unknown as GridLayoutConfig;

	// Calculate grid lines based on bounds and cell dimensions
	const xLines = [];
	const yLines = [];
	const crossMarkers = [];

	// X grid lines (vertical)
	for (let x = Math.floor(bounds.minX / cellWidth) * cellWidth; x <= bounds.maxX; x += cellWidth) {
		xLines.push(
			<line
				key={`x-${x}`}
				x1={x}
				y1={bounds.minY}
				x2={x}
				y2={bounds.maxY}
				stroke="#666666"
				strokeWidth="0.5"
				strokeDasharray="4 4"
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
					fontSize="8px"
					textAnchor="middle"
					fill="#999999"
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
				stroke="#666666"
				strokeWidth="0.5"
				strokeDasharray="4 4"
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
					fontSize="8px"
					textAnchor="start"
					fill="#999999"
					opacity={opacity * 2}
				>
					{y}
				</text>
			);
		}
	}

	// Add cross markers at grid intersections
	for (let x = Math.floor(bounds.minX / cellWidth) * cellWidth; x <= bounds.maxX; x += cellWidth) {
		for (let y = Math.floor(bounds.minY / cellHeight) * cellHeight; y <= bounds.maxY; y += cellHeight) {
			crossMarkers.push(
				<path
					key={`cross-${x}-${y}`}
					d={`M ${x - 3} ${y} H ${x + 3} M ${x} ${y - 3} V ${y + 3}`}
					stroke="#888888"
					strokeWidth="0.5"
					opacity={opacity * 1.5}
				/>
			);
		}
	}

	// Bounds rectangle if enabled
	const boundsRect = showBounds ? (
		<rect
			x={bounds.minX}
			y={bounds.minY}
			width={bounds.maxX - bounds.minX}
			height={bounds.maxY - bounds.minY}
			fill="none"
			stroke="#888888"
			strokeWidth="1"
			strokeDasharray="8 4"
			opacity={opacity * 2}
		/>
	) : null;

	// Node position markers and labels
	const nodeMarkers = layout.nodes.map(node => (
		<g key={`marker-${node.id}`}>
			<circle
				cx={node.x}
				cy={node.y}
				r={3}
				fill="none"
				stroke="#aaaaaa"
				strokeWidth="0.5"
				opacity={opacity * 2}
			/>
			{/* Display level of node for debugging */}
			{showNodeIds && (
				<text
					x={node.x}
					y={node.y - 8}
					fontSize="7px"
					textAnchor="middle"
					fill="#aaaaaa"
					opacity={opacity * 3}
				>
					L{node.level}:{node.name.substring(0, 10)}
				</text>
			)}
		</g>
	));

	// Render everything in a group
	return (
		<g className="metro-grid-debug" pointerEvents="none">
			{/* Grid lines */}
			{xLines}
			{yLines}

			{/* Grid intersections */}
			{crossMarkers}

			{/* Bounds rectangle */}
			{boundsRect}

			{/* Node position markers */}
			{nodeMarkers}

			{/* Debug info panel */}
			<g transform={`translate(${bounds.minX + 10}, ${bounds.maxY - 10})`}>
				<text x={10} y={-60} fontSize="9px" fill="#999999">
					<tspan x={10} dy={0}>Grid: {cellWidth}×{cellHeight}</tspan>
					<tspan x={10} dy={12}>Paths: {layout.paths.length}</tspan>
					<tspan x={10} dy={12}>Nodes: {layout.nodes.length}</tspan>
				</text>
			</g>
		</g>
	);
}
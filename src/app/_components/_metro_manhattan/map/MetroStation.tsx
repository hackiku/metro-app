// src/app/_components/metro/map/MetroStation.tsx
"use client";

import React from 'react';
import type { LayoutNode } from '../engine/types';

interface MetroStationProps {
	node: LayoutNode;
	isSelected?: boolean;
	isCurrent?: boolean;
	isTarget?: boolean;
	onClick?: (nodeId: string) => void;
	baseRadius?: number;
	interchangeRadius?: number;
}

/**
 * Renders a station (node) on the metro map.
 * 
 * @param node - The node data
 * @param isSelected - Whether this station is currently selected
 * @param isCurrent - Whether this is the user's current position
 * @param isTarget - Whether this is the user's target position
 * @param onClick - Click handler for station selection
 * @param baseRadius - Base radius for normal stations
 * @param interchangeRadius - Radius for interchange stations
 */
export default function MetroStation({
	node,
	isSelected = false,
	isCurrent = false,
	isTarget = false,
	onClick,
	baseRadius = 7,
	interchangeRadius = 9
}: MetroStationProps) {
	// Determine appropriate radius
	const radius = node.isInterchange ? interchangeRadius : baseRadius;

	// Apply selected/current/target adjustments
	const adjustedRadius = isSelected ? radius + 1 : radius;

	// Determine stroke colors and widths
	const strokeWidth = isSelected ? 3 : 1.5;
	let strokeColor = "var(--background)"; // Default

	if (isSelected) strokeColor = "var(--primary)";
	if (isCurrent) strokeColor = "#4f46e5"; // Indigo
	if (isTarget) strokeColor = "#f59e0b";  // Amber

	// Handle click
	const handleClick = () => {
		if (onClick) onClick(node.id);
	};

	return (
		<g
			transform={`translate(${node.x}, ${node.y})`}
			onClick={handleClick}
			style={{ cursor: 'pointer' }}
			className={`metro-station ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''} ${isTarget ? 'target' : ''}`}
			data-node-id={node.id}
			data-position-id={node.positionId}
			data-level={node.level}
			data-interchange={node.isInterchange}
		>
			{/* Station Circle */}
			<circle
				r={adjustedRadius}
				fill={node.color}
				strokeWidth={strokeWidth}
				stroke={strokeColor}
				className={node.isInterchange ? 'interchange-node' : ''}
				style={{ transition: 'r 0.15s ease-out, stroke 0.15s ease-out' }}
			>
				<title>{`${node.name} (Level ${node.level})${node.isInterchange ? ' [Interchange]' : ''}`}</title>
			</circle>

			{/* Station Label */}
			<text
				y={-adjustedRadius - 5}
				textAnchor="middle"
				fontSize="9px"
				fill={isSelected ? "var(--primary)" : "var(--foreground)"}
				className="select-none pointer-events-none font-medium"
				paintOrder="stroke"
				stroke="var(--background)"
				strokeWidth="2.5px"
				strokeLinejoin="round"
				style={{ transition: 'fill 0.15s ease-out' }}
			>
				{node.name}
			</text>

			{/* Level indicator (optional) */}
			{false && (
				<text
					y={adjustedRadius + 12}
					textAnchor="middle"
					fontSize="8px"
					fill="var(--muted-foreground)"
					className="select-none pointer-events-none"
					paintOrder="stroke"
					stroke="var(--background)"
					strokeWidth="2px"
					strokeLinejoin="round"
				>
					L{node.level}
				</text>
			)}
		</g>
	);
}
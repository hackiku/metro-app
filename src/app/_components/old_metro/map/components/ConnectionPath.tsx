// src/app/_components/metro/map/components/ConnectionPath.tsx
"use client"

import { memo } from "react";
import type { Station } from "../../services/dataService";

interface ConnectionPathProps {
	fromStation: Station;
	toStation: Station;
	color: string;
	isHighlighted?: boolean;
	isRecommended?: boolean;
	thickness?: number;
}

/**
 * Renders a path connection between two stations
 */
export const ConnectionPath = memo(function ConnectionPath({
	fromStation,
	toStation,
	color,
	isHighlighted = false,
	isRecommended = false,
	thickness = 3
}: ConnectionPathProps) {
	if (!fromStation?.x || !fromStation?.y || !toStation?.x || !toStation?.y) {
		return null;
	}

	// Calculate control points for curve
	// For direct horizontal or vertical lines, no curve needed
	const isHorizontal = Math.abs(fromStation.y - toStation.y) < 10;
	const isVertical = Math.abs(fromStation.x - toStation.x) < 10;

	// Path data
	let pathData;

	if (isHorizontal || isVertical) {
		// Simple straight line
		pathData = `M ${fromStation.x},${fromStation.y} L ${toStation.x},${toStation.y}`;
	} else {
		// Create a curved path with Bezier curve
		const midX = (fromStation.x + toStation.x) / 2;

		// Create an S-curve between stations
		pathData = `
      M ${fromStation.x},${fromStation.y} 
      C ${midX},${fromStation.y} ${midX},${toStation.y} ${toStation.x},${toStation.y}
    `;
	}

	// Determine styles based on props
	const strokeWidth = isHighlighted ? thickness + 2 : thickness;
	const opacity = isHighlighted ? 1 : 0.8;
	const strokeDasharray = isRecommended ? '0' : '5,5';

	return (
		<path
			d={pathData}
			stroke={color}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeDasharray={strokeDasharray}
			fill="none"
			opacity={opacity}
			className="transition-all duration-300 ease-in-out"
		/>
	);
});
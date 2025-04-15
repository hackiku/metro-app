"use client"

// src/app/_components/metro/map/TransitionConnection.tsx
import { memo } from "react";
import { Role } from "../types";

interface TransitionConnectionProps {
	fromRole: Role;
	toRole: Role;
	isRecommended?: boolean;
	isHighlighted?: boolean;
}

const TransitionConnection = memo(function TransitionConnection({
	fromRole,
	toRole,
	isRecommended = false,
	isHighlighted = false
}: TransitionConnectionProps) {
	if (!fromRole?.x || !fromRole?.y || !toRole?.x || !toRole?.y) {
		return null;
	}

	// Calculate control points for curve
	// For direct horizontal or vertical lines, no curve needed
	const isHorizontal = Math.abs(fromRole.y - toRole.y) < 10;
	const isVertical = Math.abs(fromRole.x - toRole.x) < 10;

	// Path data
	let pathData;

	if (isHorizontal || isVertical) {
		// Simple straight line
		pathData = `M ${fromRole.x},${fromRole.y} L ${toRole.x},${toRole.y}`;
	} else {
		// Create a curved path with Bezier curve
		const midX = (fromRole.x + toRole.x) / 2;

		// Create an S-curve between roles
		pathData = `
      M ${fromRole.x},${fromRole.y} 
      C ${midX},${fromRole.y} ${midX},${toRole.y} ${toRole.x},${toRole.y}
    `;
	}

	// Determine styles based on props
	const strokeWidth = isHighlighted ? 4 : 3;
	const opacity = isHighlighted ? 1 : 0.7;
	const strokeDasharray = isRecommended ? '0' : '5,5';
	const strokeColor = isRecommended ? "#10b981" : "#9ca3af"; // Green for recommended, gray otherwise

	return (
		<path
			d={pathData}
			stroke={strokeColor}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeDasharray={strokeDasharray}
			fill="none"
			opacity={opacity}
			className="transition-all duration-300 ease-in-out"
		/>
	);
});

export default TransitionConnection;
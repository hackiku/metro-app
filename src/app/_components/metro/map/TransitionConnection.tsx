// src/app/_components/metro/map/TransitionConnection.tsx
"use client"

import { memo } from "react";
import type { Role } from "../types";

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

	// Calculate midpoint for the bezier curve
	const midX = (fromRole.x + toRole.x) / 2;

	// Generate path data for a curved connection
	const pathData = `
    M ${fromRole.x},${fromRole.y} 
    C ${midX},${fromRole.y} ${midX},${toRole.y} ${toRole.x},${toRole.y}
  `;

	// Styling based on properties
	const strokeWidth = isHighlighted ? 3 : 2;
	const opacity = isHighlighted ? 0.8 : 0.5;
	const strokeDasharray = isRecommended ? 'none' : '5,5';
	const strokeColor = isRecommended ? "#10b981" : "#9ca3af"; // Green for recommended, gray otherwise

	return (
		<path
			d={pathData}
			stroke={strokeColor}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeDasharray={strokeDasharray}
			fill="none"
			opacity={opacity}
			className="transition-all duration-300"
		/>
	);
});

export default TransitionConnection;
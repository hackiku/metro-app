// src/app/_components/metro/map/components/ConnectionPath.tsx
"use client"

import { memo } from "react";

interface ConnectionPathProps {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	color: string;
	isRecommended?: boolean;
	isHighlighted?: boolean;
}

export const ConnectionPath = memo(function ConnectionPath({
	fromX,
	fromY,
	toX,
	toY,
	color,
	isRecommended = false,
	isHighlighted = false
}: ConnectionPathProps) {
	// Calculate midpoint for the bezier curve
	const midX = (fromX + toX) / 2;

	// Generate path data for a curved connection
	const pathData = `
    M ${fromX},${fromY} 
    C ${midX},${fromY} ${midX},${toY} ${toX},${toY}
  `;

	// Adjust styles based on props
	const strokeWidth = isHighlighted ? 3 : 2;
	const opacity = isHighlighted ? 0.8 : 0.5;
	const strokeDasharray = isRecommended ? 'none' : '5,5';
	const strokeColor = isRecommended ? "#10b981" : color || "#9ca3af"; // Green for recommended

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

export default ConnectionPath;
// src/app/_components/metro/map/components/Station.tsx
"use client"

import { memo } from "react";
// Assuming StationData comes from dataService, adjust if needed
import type { Station as StationData } from "../../services/dataService";

interface StationProps {
	station: StationData; // Use the detailed type from dataService
	x: number;
	y: number;
	color: string;
	isSelected?: boolean;
	isCurrent?: boolean;
	isInterchange: boolean; // <-- ADDED: This station is an interchange point
	onClick: (station: StationData) => void; // <-- Adjusted parameter type
}

export const Station = memo(function Station({
	station,
	x,
	y,
	color,
	isSelected = false,
	isCurrent = false,
	isInterchange, // <-- DESTRUCTURED
	onClick
}: StationProps) {
	// Use isInterchange for potential styling differences
	const baseRadius = isInterchange ? 10 : 12; // Example: slightly smaller base for interchanges if desired
	const finalRadius = isSelected || isCurrent ? baseRadius + 2 : baseRadius;
	const strokeWidth = isSelected || isCurrent ? 4 : (isInterchange ? 3.5 : 3);
	const strokeColor = isCurrent ? "#4f46e5" : color; // Indigo for current, line color otherwise

	// Handle click with the correct station data type
	const handleClick = () => {
		onClick(station);
	};

	return (
		<g
			className="station-group station-component cursor-pointer transition-transform duration-150 ease-in-out hover:scale-110" // Combined classes
			transform={`translate(${x},${y})`}
			onClick={handleClick} // Use wrapped handler
		>
			{/* Render a rect for interchanges, circle otherwise */}
			{isInterchange ? (
				<rect
					x={-finalRadius} // Adjust position based on radius
					y={-finalRadius}
					width={finalRadius * 2}
					height={finalRadius * 2}
					rx={4} // Rounded corners
					ry={4}
					fill="var(--background, white)"
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					// Optional: add a unique class for interchange markers
					className="station-marker interchange-marker"
				/>
			) : (
				<circle
					r={finalRadius}
					fill="var(--background, white)"
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					className="station-marker" // Add class for potential styling
				/>
			)}


			{/* "YOU ARE HERE" indicator */}
			{isCurrent && (
				<text
					y={-finalRadius - 15} // Position above the shape
					textAnchor="middle"
					className="text-[10px] sm:text-xs font-bold fill-indigo-600 dark:fill-indigo-400 select-none" // Added select-none
					style={{ pointerEvents: 'none' }}
				>
					YOU ARE HERE
				</text>
			)}

			{/* Station name */}
			<text
				y={-finalRadius - 5} // Position above the shape
				textAnchor="middle"
				className="text-[11px] sm:text-sm font-medium fill-foreground select-none" // Slightly smaller base size, select-none
				style={{ pointerEvents: 'none' }}
				// Improved halo effect using CSS variables if possible, or defaults
				paintOrder="stroke"
				stroke="var(--background, white)"
				strokeWidth="2.5px" // Thicker halo
				strokeLinecap="round" // Softer edges
				strokeLinejoin="round"
			>
				{station.name}
			</text>

			{/* Station level - Adjusted position */}
			<text
				y={finalRadius + 14} // Position below the shape
				textAnchor="middle"
				className="text-[10px] sm:text-xs fill-muted-foreground select-none" // select-none
				style={{ pointerEvents: 'none' }}
				paintOrder="stroke"
				stroke="var(--background, white)"
				strokeWidth="2px"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				Level {station.level}
			</text>
		</g>
	);
});

// Add display name for easier debugging
Station.displayName = 'MetroStation';
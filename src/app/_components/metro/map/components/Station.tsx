// src/app/_components/metro/map/components/Station.tsx
"use client"

import { memo } from "react";
import type { MetroStation } from "../../types/metro";

interface StationProps {
	station: MetroStation;
	x: number;
	y: number;
	color: string;
	isSelected?: boolean;
	isCurrent?: boolean;
	onClick: (station: MetroStation) => void;
}

export const Station = memo(function Station({
	station,
	x,
	y,
	color,
	isSelected = false,
	isCurrent = false,
	onClick
}: StationProps) {
	const baseRadius = 12;
	const radius = isSelected || isCurrent ? baseRadius + 2 : baseRadius;
	const strokeWidth = isSelected || isCurrent ? 4 : 3;

	return (
		<g
			className="station-group"
			transform={`translate(${x},${y})`}
			onClick={() => onClick(station)}
			style={{ cursor: 'pointer' }}
		>
			{/* Shadow effect */}
			<circle
				r={radius}
				fill="rgba(0,0,0,0.2)"
				transform="translate(2,2)"
			/>

			{/* Station circle */}
			<circle
				r={radius}
				fill="var(--background, white)"
				stroke={isCurrent ? "#4f46e5" : color}
				strokeWidth={strokeWidth}
			/>

			{/* Show "YOU ARE HERE" indicator for current station */}
			{isCurrent && (
				<text
					y={-radius - 15}
					textAnchor="middle"
					className="text-sm font-bold fill-indigo-600 dark:fill-indigo-400"
					style={{ pointerEvents: 'none' }}
				>
					YOU ARE HERE
				</text>
			)}

			{/* Station name */}
			<text
				y={-radius - 8}
				textAnchor="middle"
				className="text-sm font-medium fill-foreground"
				style={{
					pointerEvents: 'none',
					stroke: "white",
					strokeWidth: "0.5px",
					paintOrder: "stroke"
				}}
			>
				{station.name}
			</text>

			{/* Station level */}
			<text
				y={radius + 16}
				textAnchor="middle"
				className="text-xs fill-muted-foreground"
				style={{
					pointerEvents: 'none',
					stroke: "white",
					strokeWidth: "0.3px",
					paintOrder: "stroke"
				}}
			>
				Level {station.level}
			</text>
		</g>
	);
});
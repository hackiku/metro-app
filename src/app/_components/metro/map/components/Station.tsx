// src/app/_components/metro/map/components/Station.tsx
"use client"

import { memo, useState } from "react";
import { StationMenu } from "./StationMenu";
import type { Role } from "~/types/career";

interface StationProps {
	station: Role;
	x: number;
	y: number;
	color: string;
	isSelected?: boolean;
	isCurrent?: boolean;
	isTarget?: boolean;
	isInterchange?: boolean;
	onClick: (station: Role) => void;
	onSetCurrent: (station: Role) => void;
	onSetTarget: (station: Role) => void;
	onViewDetails: (station: Role) => void;
}

export const Station = memo(function Station({
	station,
	x,
	y,
	color,
	isSelected = false,
	isCurrent = false,
	isTarget = false,
	isInterchange = false,
	onClick,
	onSetCurrent,
	onSetTarget,
	onViewDetails
}: StationProps) {
	// Local state to control menu visibility
	const [menuOpen, setMenuOpen] = useState(false);

	const baseRadius = isInterchange ? 12 : 10;
	const finalRadius = (isSelected || isCurrent || isTarget) ? baseRadius + 2 : baseRadius;
	const strokeWidth = isSelected ? 4 : (isCurrent ? 3 : 2);

	// Determine node color
	let strokeColor = color;
	if (isCurrent) strokeColor = "#4f46e5"; // Indigo for current
	if (isTarget) strokeColor = "#f59e0b"; // Amber for target

	// Station shape - square for interchanges, circle for regular stations
	const StationShape = isInterchange ? (
		<rect
			x={-finalRadius}
			y={-finalRadius}
			width={finalRadius * 2}
			height={finalRadius * 2}
			rx={4}
			fill="var(--background, white)"
			stroke={strokeColor}
			strokeWidth={strokeWidth}
			className="transition-all duration-300"
		/>
	) : (
		<circle
			r={finalRadius}
			fill="var(--background, white)"
			stroke={strokeColor}
			strokeWidth={strokeWidth}
			className="transition-all duration-300"
		/>
	);

	// Handle station click - just open the menu
	const handleStationClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick(station);
		setMenuOpen(true); // Open the menu, don't show details yet
	};

	return (
		<g
			className="station-node cursor-pointer group"
			transform={`translate(${x},${y})`}
			onClick={handleStationClick}
		>
			{/* Station shape with hover effect */}
			<g className="transition-transform duration-200 ease-out hover:scale-110">
				{StationShape}

				{/* Current role indicator */}
				{isCurrent && (
					<text
						y={-finalRadius - 15}
						textAnchor="middle"
						className="text-[10px] sm:text-xs font-bold fill-indigo-600 dark:fill-indigo-400 select-none"
						style={{ pointerEvents: 'none' }}
					>
						CURRENT
					</text>
				)}

				{/* Target role indicator */}
				{isTarget && !isCurrent && (
					<text
						y={-finalRadius - 15}
						textAnchor="middle"
						className="text-[10px] sm:text-xs font-bold fill-amber-600 dark:fill-amber-400 select-none"
						style={{ pointerEvents: 'none' }}
					>
						TARGET
					</text>
				)}

				{/* Role name with halo effect */}
				<text
					y={-finalRadius - 5}
					textAnchor="middle"
					className="text-[11px] sm:text-sm font-medium fill-foreground select-none"
					style={{ pointerEvents: 'none' }}
					paintOrder="stroke"
					stroke="var(--background, white)"
					strokeWidth="2.5px"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					{station.name}
				</text>

				{/* Role level */}
				<text
					y={finalRadius + 14}
					textAnchor="middle"
					className="text-[10px] sm:text-xs fill-muted-foreground select-none"
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

			{/* Station menu - opens on normal click */}
			<StationMenu
				station={station}
				isCurrentStation={isCurrent}
				isTargetStation={isTarget}
				onSetCurrent={onSetCurrent}
				onSetTarget={onSetTarget}
				onViewDetails={onViewDetails}
				open={menuOpen}
				onOpenChange={setMenuOpen}
			/>
		</g>
	);
});

export default Station;
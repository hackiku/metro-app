"use client"

// src/app/_components/metro/map/RoleNode.tsx
import { memo } from "react";
import type { Role } from "../types";

interface RoleNodeProps {
	role: Role;
	pathColor: string;
	isSelected?: boolean;
	isCurrent?: boolean;
	isTarget?: boolean;
	isInterchange?: boolean;
	onClick: () => void;
}

const RoleNode = memo(function RoleNode({
	role,
	pathColor,
	isSelected = false,
	isCurrent = false,
	isTarget = false,
	isInterchange = false,
	onClick
}: RoleNodeProps) {
	const baseRadius = 10;
	const finalRadius = isSelected || isCurrent || isTarget ? baseRadius + 2 : baseRadius;
	const strokeWidth = isSelected ? 4 : (isCurrent ? 3 : 2);

	// Determine node color
	let strokeColor = pathColor;
	if (isCurrent) strokeColor = "#4f46e5"; // Indigo for current role
	if (isTarget) strokeColor = "#f59e0b"; // Amber for target role

	return (
		<g
			className="role-node cursor-pointer transition-transform duration-150 ease-in-out hover:scale-110"
			transform={`translate(${role.x},${role.y})`}
			onClick={onClick}
		>
			{/* Base shape - square for interchanges, circle for regular nodes */}
			{isInterchange ? (
				<rect
					x={-finalRadius}
					y={-finalRadius}
					width={finalRadius * 2}
					height={finalRadius * 2}
					rx={3}
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
			)}

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

			{/* Role name */}
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
				{role.name}
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
				Level {role.level}
			</text>
		</g>
	);
});

export default RoleNode;
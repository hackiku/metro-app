// src/app/_components/metro/map/MetroStation.tsx
import React from 'react';
import type { MetroNode } from '~/types/metro';

interface MetroStationProps {
	node: MetroNode;
	scales: {
		xScale: d3.ScaleLinear<number, number>;
		yScale: d3.ScaleLinear<number, number>;
	};
	lineColor: string;
	isInterchange?: boolean;
	isSelected?: boolean;
	isCurrent?: boolean;
	isTarget?: boolean;
	onClick?: (nodeId: string) => void;
}

const MetroStation: React.FC<MetroStationProps> = ({
	node,
	scales,
	lineColor,
	isInterchange = false,
	isSelected = false,
	isCurrent = false,
	isTarget = false,
	onClick
}) => {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onClick) onClick(node.id);
	};

	// Position calculations
	const x = scales.xScale(node.x);
	const y = scales.yScale(node.y);

	// Appearance
	const baseRadius = isInterchange ? 14 : 12;
	const finalRadius = (isSelected || isCurrent || isTarget) ? baseRadius + 2 : baseRadius;
	const strokeWidth = isSelected ? 4 : (isCurrent || isTarget) ? 3 : 2;

	// Color
	let strokeColor = lineColor;
	if (isCurrent) strokeColor = "#4f46e5"; // Indigo for current
	if (isTarget) strokeColor = "#f59e0b"; // Amber for target

	return (
		<g
			className={`node ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''} ${isTarget ? 'target' : ''}`}
			transform={`translate(${x},${y})`}
			onClick={handleClick}
			data-id={node.id}
			style={{ cursor: 'pointer' }}
		>
			{/* Station shape based on interchange status */}
			{isInterchange ? (
				<rect
					x={-finalRadius}
					y={-finalRadius}
					width={finalRadius * 2}
					height={finalRadius * 2}
					rx={4}
					fill="var(--background, white)"
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					className="transition-all duration-200"
				/>
			) : (
				<circle
					r={finalRadius}
					fill="var(--background, white)"
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					className="transition-all duration-200"
				/>
			)}

			{/* Station labels */}
			{/* Special indicators for current/target */}
			{isCurrent && (
				<text
					y={-finalRadius - 15}
					textAnchor="middle"
					className="text-xs font-bold"
					fill="#4f46e5" // Indigo
				>
					CURRENT
				</text>
			)}

			{isTarget && !isCurrent && (
				<text
					y={-finalRadius - 15}
					textAnchor="middle"
					className="text-xs font-bold"
					fill="#f59e0b" // Amber
				>
					TARGET
				</text>
			)}

			{/* Station name */}
			<text
				y={-finalRadius - 5}
				textAnchor="middle"
				className="text-[11px] sm:text-sm font-medium fill-foreground select-none"
				paintOrder="stroke"
				stroke="var(--background, white)"
				strokeWidth="2.5px"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{node.name || `Level ${node.level}`}
			</text>

			{/* Level indicator */}
			<text
				y={finalRadius + 14}
				textAnchor="middle"
				className="text-[10px] sm:text-xs fill-muted-foreground select-none"
				paintOrder="stroke"
				stroke="var(--background, white)"
				strokeWidth="2px"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				Level {node.level}
			</text>
		</g>
	);
};

export default React.memo(MetroStation);
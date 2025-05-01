// src/app/_components/metro/map/MetroStation.tsx
"use client";

import React, { useRef, useState } from 'react';
import type { LayoutNode } from '../engine/types';
import { Target, Trash2 } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface MetroStationProps {
	node: LayoutNode;
	isSelected?: boolean;
	isCurrent?: boolean;
	isTarget?: boolean;
	onClick?: (nodeId: string) => void;
	onSetTarget?: (nodeId: string) => void;
	onRemoveTarget?: (nodeId: string) => void;
}

/**
 * Renders a station node on the metro map with improved text positioning
 */
export default function MetroStation({
	node,
	isSelected = false,
	isCurrent = false,
	isTarget = false,
	onClick,
	onSetTarget,
	onRemoveTarget
}: MetroStationProps) {
	const [isOpen, setIsOpen] = useState(false);
	const circleRef = useRef<SVGCircleElement>(null);

	// Base styling values - make interchange nodes more visible
	const radius = node.isInterchange ? 8 : 6;

	// Text positioning based on node position to avoid overlap
	// Calculate angle from center to determine label position
	const angle = Math.atan2(node.y, node.x) * (180 / Math.PI);

	// Determine label position based on angle
	let labelX = -60;
	let labelY = -radius - 25;
	let labelAnchor = "middle";

	// Position text to avoid overlapping with lines
	// We divide the space around the node into 8 sectors and position accordingly
	if (angle > -22.5 && angle <= 22.5) {
		// Right
		labelX = radius + 10;
		labelY = -5;
		labelAnchor = "start";
	} else if (angle > 22.5 && angle <= 67.5) {
		// Bottom-right
		labelX = radius + 10;
		labelY = radius + 5;
		labelAnchor = "start";
	} else if (angle > 67.5 && angle <= 112.5) {
		// Bottom
		labelX = 0;
		labelY = radius + 15;
		labelAnchor = "middle";
	} else if (angle > 112.5 && angle <= 157.5) {
		// Bottom-left
		labelX = -radius - 10;
		labelY = radius + 5;
		labelAnchor = "end";
	} else if ((angle > 157.5 && angle <= 180) || (angle <= -157.5 && angle > -180)) {
		// Left
		labelX = -radius - 10;
		labelY = -5;
		labelAnchor = "end";
	} else if (angle > -157.5 && angle <= -112.5) {
		// Top-left
		labelX = -radius - 10;
		labelY = -radius - 5;
		labelAnchor = "end";
	} else if (angle > -112.5 && angle <= -67.5) {
		// Top
		labelX = 0;
		labelY = -radius - 15;
		labelAnchor = "middle";
	} else if (angle > -67.5 && angle <= -22.5) {
		// Top-right
		labelX = radius + 10;
		labelY = -radius - 5;
		labelAnchor = "start";
	}

	// Station style based on state
	let strokeColor = "var(--border)";
	let strokeWidth = 1.0;

	if (isSelected) {
		strokeColor = "white";
		strokeWidth = 2;
	}
	if (isCurrent) strokeColor = "#4f46e5"; // Indigo
	if (isTarget) strokeColor = "#f59e0b";  // Amber

	// Station click handler
	const handleStationClick = () => {
		if (onClick) onClick(node.id);
		// Don't automatically open menu on click - only on right click or explicit menu trigger
	};

	// Right click handler to open context menu
	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		if (circleRef.current) {
			setIsOpen(true);
		}
	};

	return (
		<g
			transform={`translate(${node.x}, ${node.y})`}
			className={`metro-station station ${isCurrent ? 'current' : ''} ${isTarget ? 'target' : ''} ${isOpen ? 'menu-open' : ''}`}
		>
			{/* Station circle with hover effects */}
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<g className="cursor-pointer">
						{/* Larger hit area for easier interaction */}
						<circle
							r={radius + 5}
							fill="transparent"
							className="station-hit-area"
						/>

						{/* Visual station circle */}
						<circle
							ref={circleRef}
							r={radius}
							fill={node.color}
							stroke={strokeColor}
							strokeWidth={strokeWidth}
							className="station-circle transition-all duration-200 hover:stroke-white"
						/>

						{/* Inner dot for interchange stations */}
						{node.isInterchange && (
							<circle
								r={radius / 2}
								fill="var(--background)"
								className="station-interchange"
							/>
						)}
					</g>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="center" sideOffset={5}>
					<DropdownMenuItem
						className="gap-2 cursor-pointer"
						onClick={() => onSetTarget?.(node.id)}
					>
						<Target size={16} />
						<span>Set Target</span>
					</DropdownMenuItem>

					{isTarget && (
						<DropdownMenuItem
							className="gap-2 cursor-pointer text-destructive"
							onClick={() => onRemoveTarget?.(node.id)}
						>
							<Trash2 size={16} />
							<span>Remove Target</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Station label using foreignObject for Tailwind styling 
          with dynamic positioning based on angle */}
			<foreignObject
				x={labelX}
				y={labelY}
				width={120}
				height={24}
				style={{
					pointerEvents: 'none',
					textAlign: labelAnchor === 'middle' ? 'center' : labelAnchor === 'start' ? 'left' : 'right',
					overflow: 'visible'
				}}
				className="station-label"
			>
				<div
					className="station-text px-1.5 py-0.5 rounded bg-background/90 text-foreground 
                     text-xs font-medium inline-block"
					style={{
						maxWidth: '114px',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						// Add a subtle text shadow to help with readability
						textShadow: '0 0 2px rgba(0,0,0,0.5)'
					}}
				>
					{node.name}
				</div>
			</foreignObject>
		</g>
	);
}
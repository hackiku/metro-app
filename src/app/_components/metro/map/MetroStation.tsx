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
 * Renders a station node on the metro map
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

	// Base styling values
	const radius = node.isInterchange ? 9 : 7;

	// Station style based on state
	let strokeColor = "var(--border-foreground)";
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
			className={`station ${isCurrent ? 'current' : ''} ${isTarget ? 'target' : ''} ${isOpen ? 'menu-open' : ''}`}
		>
			{/* Station circle */}
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<circle
						ref={circleRef}
						r={radius}
						fill={node.color}
						stroke={strokeColor}
						strokeWidth={1.5}
						className="cursor-pointer transition-colors duration-200"
						onClick={handleStationClick}
						onContextMenu={handleContextMenu}
					/>
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

			{/* Station label using foreignObject for Tailwind styling */}
			<foreignObject
				x={-60}
				y={-radius - 25}
				width={120}
				height={24}
				style={{ pointerEvents: 'none' }}
			>
				<div className="h-full flex items-center justify-center text-xs font-medium">
					<div
						className="px-1.5 py-0.5 rounded bg-background/90 text-foreground truncate"
						style={{ maxWidth: '114px' }}
					>
						{node.name}
					</div>
				</div>
			</foreignObject>
		</g>
	);
}
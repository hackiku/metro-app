// src/app/_components/metro/map/MetroStation.tsx
"use client";

import React, { useState, useRef } from 'react';
import type { LayoutNode } from '../engine/types';
import { Target, Trash2, MoreHorizontal } from 'lucide-react';
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
	baseRadius?: number;
	interchangeRadius?: number;
}

/**
 * Renders a station (node) on the metro map with dropdown menu.
 */
export default function MetroStation({
	node,
	isSelected = false,
	isCurrent = false,
	isTarget = false,
	onClick,
	onSetTarget,
	onRemoveTarget,
	baseRadius = 7,
	interchangeRadius = 9
}: MetroStationProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Determine appropriate radius
	const radius = node.isInterchange ? interchangeRadius : baseRadius;

	// Apply selected/current/target adjustments
	const adjustedRadius = isSelected ? radius + 1 : radius;

	// Determine stroke colors and widths
	const strokeWidth = isSelected ? 3 : 1.5;
	let strokeColor = "var(--border-foreground)";

	if (isSelected) strokeColor = "var(--primary)";
	if (isCurrent) strokeColor = "#4f46e5"; // Indigo
	if (isTarget) strokeColor = "#f59e0b";  // Amber

	// Handle click (prevent propagation if menu is open)
	const handleClick = (e: React.MouseEvent) => {
		if (menuOpen) {
			e.stopPropagation();
			return;
		}

		if (onClick) onClick(node.id);
	};

	// Handle menu items
	const handleSetTarget = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onSetTarget) onSetTarget(node.id);
		setMenuOpen(false);
	};

	const handleRemoveTarget = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onRemoveTarget) onRemoveTarget(node.id);
		setMenuOpen(false);
	};

	// Position the dropdown relative to SVG coordinates
	const dropdownStyle = {
		position: 'absolute',
		left: `${node.x}px`,
		top: `${node.y}px`,
		transform: 'translate(-50%, -50%)',
		zIndex: 100
	} as React.CSSProperties;

	// SVG station and label elements
	const stationElements = (
		<g
			transform={`translate(${node.x}, ${node.y})`}
			onClick={handleClick}
			style={{ cursor: 'pointer' }}
			className={`metro-station ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''} ${isTarget ? 'target' : ''}`}
			data-node-id={node.id}
			data-position-id={node.positionId}
			data-level={node.level}
			data-interchange={node.isInterchange}
		>
			{/* Station Circle */}
			<circle
				r={adjustedRadius}
				fill={node.color}
				strokeWidth={strokeWidth}
				stroke={strokeColor}
				className={node.isInterchange ? 'interchange-node' : ''}
				style={{ transition: 'r 0.15s ease-out, stroke 0.15s ease-out' }}
			>
				<title>{`${node.name} (Level ${node.level})${node.isInterchange ? ' [Interchange]' : ''}`}</title>
			</circle>

			{/* Station Label */}
			<text
				y={-adjustedRadius - 5}
				textAnchor="middle"
				fontSize="9px"
				fill={isSelected ? "var(--primary)" : "var(--foreground)"}
				className="select-none pointer-events-none font-medium"
				paintOrder="stroke"
				stroke="var(--background)"
				strokeWidth="2.5px"
				strokeLinejoin="round"
				style={{ transition: 'fill 0.15s ease-out' }}
			>
				{node.name}
			</text>

			{/* Optional dropdown trigger circle - shown on hover/selection */}
			{(isSelected || isTarget) && (
				<circle
					r={3}
					cy={adjustedRadius + 7}
					fill="var(--background)"
					stroke="var(--border)"
					strokeWidth="1"
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						setMenuOpen(prev => !prev);
					}}
				/>
			)}

			{/* Menu icon inside trigger circle */}
			{(isSelected || isTarget) && (
				<MoreHorizontal
					className="pointer-events-none"
					size={6}
					style={{
						transform: `translate(-3px, ${adjustedRadius + 5}px)`,
						color: 'var(--foreground)'
					}}
				/>
			)}
		</g>
	);

	// Render dropdown menu separately to avoid SVG nesting issues
	return (
		<>
			{stationElements}

			{/* Dropdown menu positioned absolutely */}
			<div ref={dropdownRef} style={dropdownStyle} className="pointer-events-none">
				<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
					<DropdownMenuTrigger asChild className="pointer-events-none">
						<button className="invisible">Menu</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-36 pointer-events-auto">
						<DropdownMenuItem onClick={handleSetTarget} className="gap-2">
							<Target size={16} />
							<span>Set Target</span>
						</DropdownMenuItem>
						{isTarget && (
							<DropdownMenuItem onClick={handleRemoveTarget} className="gap-2 text-destructive">
								<Trash2 size={16} />
								<span>Remove Target</span>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}
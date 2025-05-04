// src/app/_components/metro/map/MetroStation.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { LayoutNode } from '~/types/engine';
import { Target, Trash2, Info, ArrowRight, Star, Briefcase, Eye } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from '~/components/ui/dropdown-menu';

interface MetroStationProps {
	node: LayoutNode;
	isSelected?: boolean;
	isCurrent?: boolean;
	isTarget?: boolean;
	onClick?: (nodeId: string) => void;
	onSetTarget?: (nodeId: string) => void;
	onRemoveTarget?: (nodeId: string) => void;
	onViewDetails?: (nodeId: string) => void;
	onSetAsFavorite?: (nodeId: string) => void;
}

export default function MetroStation({
	node,
	isSelected = false,
	isCurrent = false,
	isTarget = false,
	onClick,
	onSetTarget,
	onRemoveTarget,
	onViewDetails,
	onSetAsFavorite
}: MetroStationProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [currentScale, setCurrentScale] = useState(1);
	const groupRef = useRef<SVGGElement>(null);

	// Calculate current transform scale using DOM method
	useEffect(() => {
		const updateScale = () => {
			if (!groupRef.current) return;

			// Try to find the parent SVG transform group
			let element: Element | null = groupRef.current;
			while (element && element.tagName !== 'svg') {
				if (element.tagName === 'g' && element.getAttribute('transform')?.includes('scale')) {
					const transformAttr = element.getAttribute('transform') || '';
					const scaleMatch = transformAttr.match(/scale\(([^)]+)\)/);
					if (scaleMatch && scaleMatch[1]) {
						const scaleValue = parseFloat(scaleMatch[1]);
						if (!isNaN(scaleValue) && scaleValue > 0) {
							setCurrentScale(scaleValue);
							return;
						}
					}
				}
				element = element.parentElement;
			}
		};

		// Update initially and when parent transform might change
		updateScale();

		// Create a MutationObserver to detect transform changes
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' &&
					mutation.attributeName === 'transform') {
					updateScale();
				}
			});
		});

		// Start observing parent elements for attribute changes
		let element: Element | null = groupRef.current;
		while (element && element.tagName !== 'svg') {
			if (element.tagName === 'g') {
				observer.observe(element, { attributes: true });
			}
			element = element.parentElement;
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	// Determine station appearance based on state - INCREASED SIZES
	const baseStationSize = node.isInterchange ? 24 : 18; // Increased from 16/12

	// Calculate inverse scale to counteract parent transformation
	const inverseScale = currentScale > 0 ? 1 / currentScale : 1;

	// adaptive text size based on zoom level
	const adaptiveTextSize = currentScale < 1
		? Math.max(9, 14 * currentScale) // Scales down faster when zooming out
		: Math.min(16, 14 + (currentScale - 1) * 2); // Scales up slower when zooming in

	// Get state-based styling for the ring/stroke
	let ringColor = "var(--border)";
	let strokeWidth = 2; // Increased from 1

	if (isSelected) {
		ringColor = "white";
		strokeWidth = 3; // Increased from 2
	} else if (isCurrent) {
		ringColor = "#4f46e5"; // Indigo
		strokeWidth = 3; // Increased from 2
	} else if (isTarget) {
		ringColor = "#f59e0b"; // Amber
		strokeWidth = 3; // Increased from 2
	}

	// Handle station click
	const handleStationClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent map panning
		if (onClick) onClick(node.id);
	};

	// Build level indicator string
	const levelIndicator = `${node.level}`;

	return (
		<g
			ref={groupRef}
			transform={`translate(${node.x}, ${node.y})`}
			className="metro-station"
			onClick={handleStationClick}
		>
			{/* Counter-scale group to maintain visual size */}
			<g transform={`scale(${inverseScale})`}>
				{/* Larger hit area for easier interaction */}
				<circle
					r={baseStationSize / 2 + 8} // Increased padding
					fill="transparent"
					className="station-hit-area"
				/>

				{/* Visual station circle */}
				<circle
					r={baseStationSize / 2}
					fill={node.color}
					stroke={ringColor}
					strokeWidth={strokeWidth}
					className="station-circle transition-all duration-200 hover:stroke-white hover:stroke-[3px]"
				/>

				{/* Inner dot for interchange stations */}
				{node.isInterchange && (
					<circle
						r={baseStationSize / 4}
						fill="var(--background)"
						className="station-interchange"
					/>
				)}

				{/* Station label with fixed size - MUCH WIDER CONTAINER */}
				<foreignObject
					x={-baseStationSize * 2} // Wider container (250px total width)
					y={-40}
					width={250} // Much wider container
					height={40} // Taller container
					style={{ overflow: 'visible', pointerEvents: 'none' }}
				>
					<div
						className="px-2.5 py-1.5 rounded bg-background/90 text-foreground
                      font-medium shadow-sm mx-auto whitespace-nowrap 
                      overflow-hidden text-ellipsis text-center"
						style={{
							display: 'inline-block',
							maxWidth: '100%',
							fontSize: `${adaptiveTextSize}px` // Dynamic font size based on zoom
						}}
					>
						{node.name}
					</div>
				</foreignObject>

				{/* Level indicator badge below station */}
				<foreignObject
					x={-20}
					y={baseStationSize / 2 + 5}
					width={40}
					height={20}
					style={{ overflow: 'visible', pointerEvents: 'none' }}
				>
					<div className="px-1.5 py-0.5 rounded bg-muted/80 text-foreground/80
                      text-xs font-medium shadow-sm mx-auto whitespace-nowrap text-center"
						style={{ display: 'inline-block' }}
					>
						{levelIndicator}
					</div>
				</foreignObject>

				{/* Current user position indicator */}
				{isCurrent && (
					<g className="player-indicator">
						{/* Animated pulsing circle */}
						<circle
							cy={-baseStationSize - 10}
							r={7}
							fill="rgba(79, 70, 229, 0.2)"
							className="animate-ping"
						/>
						{/* Avatar circle */}
						<circle
							cy={-baseStationSize - 10}
							r={6}
							fill="#4f46e5"
							stroke="white"
							strokeWidth={1.5}
						/>
						{/* User icon or initial */}
						<text
							y={-baseStationSize - 10}
							textAnchor="middle"
							dominantBaseline="middle"
							fill="white"
							fontSize={8}
							fontWeight="bold"
						>
							U
						</text>
					</g>
				)}

				{/* Target indicator */}
				{isTarget && !isCurrent && (
					<g className="target-indicator">
						<circle
							cy={-baseStationSize - 10}
							r={6}
							fill="#f59e0b"
							stroke="white"
							strokeWidth={1.5}
						/>
						<Target
							transform={`translate(-6, ${-baseStationSize - 16}) scale(0.5)`}
							color="white"
						/>
					</g>
				)}
			</g>

			{/* Dropdown menu container - sized to account for scale */}
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<circle
						r={(baseStationSize / 2 + 8) * inverseScale} // Larger hit area adjusted for scale
						fill="transparent"
						className="cursor-pointer"
						onClick={(e) => {
							e.stopPropagation();
							// Let the DropdownMenuTrigger handle the toggle logic
						}}
					/>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="center" sideOffset={5}>
					<DropdownMenuLabel className="font-normal py-1 pb-2">
						<span className="block font-medium text-sm">{node.name}</span>
						<span className="block text-xs text-muted-foreground">{levelIndicator}</span>
					</DropdownMenuLabel>

					<DropdownMenuSeparator />

					{/* View details */}
					<DropdownMenuItem
						className="gap-2 cursor-pointer"
						onClick={() => {
							onClick?.(node.id);
							setIsOpen(false);
						}}
					>
						<Eye size={16} />
						<span>View Details</span>
					</DropdownMenuItem>

					{/* Set as target */}
					{!isTarget && !isCurrent && (
						<DropdownMenuItem
							className="gap-2 cursor-pointer"
							onClick={() => {
								onSetTarget?.(node.id);
								setIsOpen(false);
							}}
						>
							<Target size={16} />
							<span>Set as Target</span>
						</DropdownMenuItem>
					)}

					{/* Current position indicator */}
					{isCurrent && (
						<DropdownMenuItem
							className="gap-2 cursor-pointer opacity-75"
							disabled
						>
							<Briefcase size={16} />
							<span>Current Position</span>
						</DropdownMenuItem>
					)}

					{/* Add to favorites */}
					<DropdownMenuItem
						className="gap-2 cursor-pointer"
						onClick={() => {
							onSetAsFavorite?.(node.id);
							setIsOpen(false);
						}}
					>
						<Star size={16} />
						<span>Add to Favorites</span>
					</DropdownMenuItem>

					{/* Explore path */}
					<DropdownMenuItem
						className="gap-2 cursor-pointer"
						onClick={() => {
							setIsOpen(false);
						}}
					>
						<ArrowRight size={16} />
						<span>Explore Path</span>
					</DropdownMenuItem>

					{/* Remove target - shown only if this is a target */}
					{isTarget && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="gap-2 cursor-pointer text-destructive"
								onClick={() => {
									onRemoveTarget?.(node.id);
									setIsOpen(false);
								}}
							>
								<Trash2 size={16} />
								<span>Remove Target</span>
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</g>
	);
}
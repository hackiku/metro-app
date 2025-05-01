// src/app/_components/metro/map/MetroStation.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
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
	const adaptiveTextSize = Math.max(0.9, Math.min(1, 1 * ((currentScale) * 0.2)));
	// const adaptiveTextSize = (currentScale) * 0.2;
	
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
					style={{ overflow: 'visible', pointerEvents: 'none'}}
				>
					<div
						className="px-2.5 py-1.5 rounded bg-background/90 text-foreground
                      font-medium shadow-sm mx-auto whitespace-nowrap 
                      overflow-hidden text-ellipsis text-center"
						style={{
							display: 'inline-block',
							maxWidth: '100%',
							// fontSize: `${adaptiveTextSize}em` // Dynamic font size based on zoom
							fontSize: `${adaptiveTextSize}em` // Dynamic font size based on zoom
						}}
					>
						{node.name}
					</div>
				</foreignObject>
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
		</g>
	);
}
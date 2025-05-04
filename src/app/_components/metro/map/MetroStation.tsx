// src/app/_components/metro/map/MetroStation.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { LayoutNode } from '~/types/engine';
import { Target } from 'lucide-react';
import { YouAreHere } from './YouAreHere';
import { StationMenu } from './StationMenu';

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

		updateScale();

		// Observe for transform changes
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' &&
					mutation.attributeName === 'transform') {
					updateScale();
				}
			});
		});

		let element: Element | null = groupRef.current;
		while (element && element.tagName !== 'svg') {
			if (element.tagName === 'g') {
				observer.observe(element, { attributes: true });
			}
			element = element.parentElement;
		}

		return () => { observer.disconnect(); };
	}, []);

	// Determine station appearance based on state
	const baseStationSize = node.isInterchange ? 24 : 18;
	const inverseScale = currentScale > 0 ? 1 / currentScale : 1;
	const adaptiveTextSize = currentScale < 1
		? Math.max(9, 14 * currentScale)
		: Math.min(16, 14 + (currentScale - 1) * 2);

	// Get state-based styling
	let ringColor = "var(--border)";
	let strokeWidth = 2;

	if (isSelected) {
		ringColor = "white";
		strokeWidth = 3;
	} else if (isCurrent) {
		ringColor = "#4f46e5";
		strokeWidth = 3;
	} else if (isTarget) {
		ringColor = "#f59e0b";
		strokeWidth = 3;
	}

	// Handle station click
	const handleStationClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsOpen(prev => !prev);
	};

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
					r={baseStationSize / 2 + 8}
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

				{/* Station label */}
				<foreignObject
					x={-baseStationSize * 2}
					y={-40}
					width={250}
					height={40}
					style={{ overflow: 'visible', pointerEvents: 'none' }}
				>
					<div
						className="px-2.5 py-1.5 rounded bg-background/90 text-foreground
                    font-medium shadow-sm mx-auto whitespace-nowrap 
                    overflow-hidden text-ellipsis text-center"
						style={{
							display: 'inline-block',
							maxWidth: '100%',
							fontSize: `${adaptiveTextSize}px`
						}}
					>
						{node.name}
					</div>
				</foreignObject>

				{/* Level indicator badge */}
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

				{/* Current user indicator */}
				{isCurrent && <YouAreHere currentNodeId={node.id} />}

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

						{/* Target label */}
						<foreignObject x="-40" y={-baseStationSize - 35} width="80" height="20">
							<div className="flex justify-center">
								<div className="bg-background text-xs font-medium px-1.5 py-0.5 rounded shadow-sm border border-amber-500/20 whitespace-nowrap text-center">
									Target
								</div>
							</div>
						</foreignObject>
					</g>
				)}
			</g>

			{/* Station menu - only for regular stations */}
			{!isCurrent && !isTarget && onClick && onSetTarget && onSetAsFavorite && (
				<StationMenu
					node={node}
					isOpen={isOpen}
					onOpenChange={setIsOpen}
					onNodeSelect={onClick}
					onSetTarget={onSetTarget}
					onSetAsFavorite={onSetAsFavorite}
					stationSize={baseStationSize}
					inverseScale={inverseScale}
				/>
			)}
		</g>
	);
}
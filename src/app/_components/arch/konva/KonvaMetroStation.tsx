// src/app/_components/metro/konva/KonvaMetroStation.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Group, Circle, Text } from 'react-konva';
import type { LayoutNode } from '~/types/engine';
import { useMetroMap } from '~/contexts/MetroMapContext';
import Konva from 'konva';
import { KonvaStationMenu } from './KonvaStationMenu';

interface KonvaMetroStationProps {
	node: LayoutNode;
	isSelected?: boolean;
	isCurrent?: boolean;
	isTarget?: boolean;
	onClick?: () => void;
}

export function KonvaMetroStation({
	node,
	isSelected = false,
	isCurrent = false,
	isTarget = false,
	onClick
}: KonvaMetroStationProps) {
	const { viewport } = useMetroMap();
	const [isHovered, setIsHovered] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [stageRef, setStageRef] = useState<Konva.Stage | null>(null);
	const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

	// Base styling values - make interchange nodes more visible
	const radius = node.isInterchange ? 8 : 6;

	// Calculate angle from center for label positioning
	const angle = Math.atan2(node.y, node.x) * (180 / Math.PI);

	// Define label position based on angle
	let labelX = 0;
	let labelY = -radius - 10;
	let labelAlign = 'center';

	// Position text to avoid overlapping with lines
	// We divide the space around the node into 8 sectors and position accordingly
	if (angle > -22.5 && angle <= 22.5) {
		// Right
		labelX = radius + 10;
		labelY = 0;
		labelAlign = 'left';
	} else if (angle > 22.5 && angle <= 67.5) {
		// Bottom-right
		labelX = radius + 10;
		labelY = radius + 5;
		labelAlign = 'left';
	} else if (angle > 67.5 && angle <= 112.5) {
		// Bottom
		labelX = 0;
		labelY = radius + 15;
		labelAlign = 'center';
	} else if (angle > 112.5 && angle <= 157.5) {
		// Bottom-left
		labelX = -radius - 10;
		labelY = radius + 5;
		labelAlign = 'right';
	} else if ((angle > 157.5 && angle <= 180) || (angle <= -157.5 && angle > -180)) {
		// Left
		labelX = -radius - 10;
		labelY = 0;
		labelAlign = 'right';
	} else if (angle > -157.5 && angle <= -112.5) {
		// Top-left
		labelX = -radius - 10;
		labelY = -radius - 5;
		labelAlign = 'right';
	} else if (angle > -112.5 && angle <= -67.5) {
		// Top
		labelX = 0;
		labelY = -radius - 15;
		labelAlign = 'center';
	} else if (angle > -67.5 && angle <= -22.5) {
		// Top-right
		labelX = radius + 10;
		labelY = -radius - 5;
		labelAlign = 'left';
	}

	// Station style based on state
	let strokeColor = "#555";
	let strokeWidth = 1.0 / viewport.scale;

	if (isSelected) {
		strokeColor = "white";
		strokeWidth = 2.0 / viewport.scale;
	}
	if (isCurrent) {
		strokeColor = "#4f46e5"; // Indigo
		strokeWidth = 2.0 / viewport.scale;
	}
	if (isTarget) {
		strokeColor = "#f59e0b"; // Amber
		strokeWidth = 2.0 / viewport.scale;
	}
	if (isHovered) {
		strokeWidth = Math.max(strokeWidth, 2.0 / viewport.scale);
	}

	// For performance, scale text inversely to maintain consistent size
	const textScale = 1 / viewport.scale;

	// Find stage and container references
	useEffect(() => {
		// This is executed on the client side only after component mounts
		const findStageAndContainer = () => {
			try {
				// Find stage by traversing up from node
				const stage = Konva.stages[0]; // Usually there's only one stage
				if (stage) {
					setStageRef(stage);
				}

				// Find container
				const container = document.querySelector('.konva-container') as HTMLDivElement;
				if (container) {
					setContainerRef(container);
				}
			} catch (err) {
				console.error('Error finding stage or container:', err);
			}
		};

		// Wait a bit for the Konva elements to be created
		const timeoutId = setTimeout(findStageAndContainer, 500);
		return () => clearTimeout(timeoutId);
	}, []);

	// Handle context menu
	const handleContextMenu = (e: Konva.KonvaEventObject<ContextMenuEvent>) => {
		e.evt.preventDefault();
		setMenuOpen(true);

		// Stop propagation to prevent stage handlers
		e.cancelBubble = true;
	};

	return (
		<>
			<Group
				x={node.x}
				y={node.y}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={onClick}
				onContextMenu={handleContextMenu}
			>
				{/* Main station circle */}
				<Circle
					radius={radius}
					fill={node.color}
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					perfectDrawEnabled={false}
				/>

				{/* Inner dot for interchange stations */}
				{node.isInterchange && (
					<Circle
						radius={radius / 2}
						fill="#ffffff"
						perfectDrawEnabled={false}
					/>
				)}

				{/* Station label */}
				<Text
					x={labelX}
					y={labelY}
					text={node.name}
					fontSize={12}
					fill="#ffffff"
					align={labelAlign as Konva.TextConfig['align']}
					verticalAlign="middle"
					scaleX={textScale}
					scaleY={textScale}
					perfectDrawEnabled={false}
					shadowColor="rgba(0,0,0,0.5)"
					shadowBlur={4}
					shadowOffset={{ x: 1, y: 1 }}
				/>
			</Group>

			{/* Context Menu */}
			{menuOpen && stageRef && containerRef && (
				<KonvaStationMenu
					node={node}
					stageRef={{ current: stageRef }}
					containerRef={{ current: containerRef }}
					position={{ x: node.x, y: node.y }}
					isOpen={menuOpen}
					onClose={() => setMenuOpen(false)}
				/>
			)}
		</>
	);
}
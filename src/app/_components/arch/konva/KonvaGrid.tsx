// src/app/_components/metro/konva/KonvaGrid.tsx
"use client";

import React from 'react';
import { Group, Circle, Line, Text, Rect } from 'react-konva';
import type { PolarGridConfig, LayoutBounds } from '~/types/engine';
import { useMetroMap } from '~/contexts/MetroMapContext';

interface KonvaGridProps {
	config: PolarGridConfig;
	bounds: LayoutBounds;
	opacity?: number;
	centerX?: number;
	centerY?: number;
}

export function KonvaGrid({
	config,
	bounds,
	opacity = 0.15,
	centerX = 0,
	centerY = 0,
}: KonvaGridProps) {
	const { viewport } = useMetroMap();

	if (!config) return null;

	// Extract relevant config values with defaults
	const {
		midLevelRadius = 250,
		radiusStep = 70,
		minRadius = 100,
		numAngleSteps = 8,
		angleOffsetDegrees = 0,
	} = config;

	// Calculate maximum radius based on bounds
	const maxBoundsDist = Math.max(
		Math.abs(bounds.minX),
		Math.abs(bounds.maxX),
		Math.abs(bounds.minY),
		Math.abs(bounds.maxY)
	);
	const maxRadius = Math.max(500, maxBoundsDist * 1.1);

	// Calculate radii for concentric circles
	const radii: number[] = [];

	// Start with minimum radius
	if (minRadius > 0) {
		radii.push(minRadius);
	}

	// Add mid-level radius if not already included
	if (midLevelRadius > 0 && !radii.includes(midLevelRadius)) {
		radii.push(midLevelRadius);
	}

	// Add additional radius steps
	let currentRadius = radiusStep;
	while (currentRadius <= maxRadius) {
		if (!radii.includes(currentRadius)) {
			radii.push(currentRadius);
		}
		currentRadius += radiusStep;
	}

	// Sort radii in ascending order
	radii.sort((a, b) => a - b);

	// Calculate angles for radial lines
	const angles: number[] = [];
	const angleStep = 360 / Math.max(1, numAngleSteps);

	for (let i = 0; i < numAngleSteps; i++) {
		angles.push((i * angleStep + (angleOffsetDegrees || 0)) % 360);
	}

	// Convert angle from degrees to radians
	const toRadians = (degrees: number) => ((degrees || 0) * Math.PI) / 180;

	// Scale text inversely to maintain consistent size
	const textScale = 1 / viewport.scale;
	const lineWidth = 0.5 / viewport.scale;

	return (
		<Group opacity={opacity}>
			{/* Concentric Circles */}
			{radii.map((radius, index) => {
				// Highlight the mid-level radius
				const isMidLevel = radius === midLevelRadius;
				return (
					<Group key={`radius-${radius}`}>
						<Circle
							x={centerX}
							y={centerY}
							radius={radius}
							stroke={isMidLevel ? "#6366f1" : "#666666"}
							strokeWidth={isMidLevel ? lineWidth * 1.5 : lineWidth}
							dash={isMidLevel ? [] : [4, 4]}
							perfectDrawEnabled={false}
							listening={false}
						/>
						<Text
							x={centerX}
							y={centerY - radius}
							text={radius === midLevelRadius ? `Mid (${radius})` : `${radius}`}
							fontSize={10}
							fill={isMidLevel ? "#6366f1" : "#666666"}
							align="center"
							verticalAlign="bottom"
							offsetY={5}
							scaleX={textScale}
							scaleY={textScale}
							perfectDrawEnabled={false}
							listening={false}
						/>
					</Group>
				);
			})}

			{/* Radial Lines */}
			{angles.map((angle, index) => {
				const radians = toRadians(angle);
				const cosAngle = Math.cos(radians);
				const sinAngle = Math.sin(radians);

				const x2 = centerX + maxRadius * cosAngle;
				const y2 = centerY + maxRadius * sinAngle;

				// Position the label slightly beyond the line end
				const labelDistance = maxRadius * 1.05;
				const labelX = centerX + labelDistance * cosAngle;
				const labelY = centerY + labelDistance * sinAngle;

				return (
					<Group key={`angle-${angle}`}>
						<Line
							points={[centerX, centerY, x2, y2]}
							stroke="#666666"
							strokeWidth={lineWidth}
							dash={[4, 4]}
							perfectDrawEnabled={false}
							listening={false}
						/>
						<Text
							x={labelX}
							y={labelY}
							text={`${angle}°`}
							fontSize={10}
							fill="#666666"
							align="center"
							verticalAlign="middle"
							scaleX={textScale}
							scaleY={textScale}
							perfectDrawEnabled={false}
							listening={false}
						/>
					</Group>
				);
			})}

			{/* Config Info Panel */}
			<Group x={centerX - 100} y={centerY + maxRadius - 140}>
				<Group>
					<Rect
						x={0}
						y={0}
						width={200}
						height={130}
						fill="#111111"
						opacity={0.85}
						cornerRadius={4}
						stroke="#333333"
						strokeWidth={lineWidth}
						perfectDrawEnabled={false}
						listening={false}
					/>
					<Text
						x={10}
						y={10}
						text="Polar Grid Config:"
						fontSize={11}
						fill="#ffffff"
						fontFamily="monospace"
						scaleX={textScale}
						scaleY={textScale}
						perfectDrawEnabled={false}
						listening={false}
					/>
					<Text
						x={10}
						y={26}
						text={`• Mid Radius: ${midLevelRadius}`}
						fontSize={11}
						fill="#ffffff"
						fontFamily="monospace"
						scaleX={textScale}
						scaleY={textScale}
						perfectDrawEnabled={false}
						listening={false}
					/>
					<Text
						x={10}
						y={42}
						text={`• Radius Step: ${radiusStep}`}
						fontSize={11}
						fill="#ffffff"
						fontFamily="monospace"
						scaleX={textScale}
						scaleY={textScale}
						perfectDrawEnabled={false}
						listening={false}
					/>
					<Text
						x={10}
						y={58}
						text={`• Min Radius: ${minRadius}`}
						fontSize={11}
						fill="#ffffff"
						fontFamily="monospace"
						scaleX={textScale}
						scaleY={textScale}
						perfectDrawEnabled={false}
						listening={false}
					/>
					<Text
						x={10}
						y={74}
						text={`• Angle Steps: ${numAngleSteps}`}
						fontSize={11}
						fill="#ffffff"
						fontFamily="monospace"
						scaleX={textScale}
						scaleY={textScale}
						perfectDrawEnabled={false}
						listening={false}
					/>
					<Text
						x={10}
						y={90}
						text={`• Angle Offset: ${angleOffsetDegrees || 0}°`}
						fontSize={11}
						fill="#ffffff"
						fontFamily="monospace"
						scaleX={textScale}
						scaleY={textScale}
						perfectDrawEnabled={false}
						listening={false}
					/>
				</Group>
			</Group>
		</Group>
	);
}
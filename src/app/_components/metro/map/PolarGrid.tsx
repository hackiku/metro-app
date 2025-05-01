// src/app/_components/metro/map/PolarGrid.tsx
"use client";

import React from 'react';
import type { PolarGridConfig } from '../engine/types';

interface PolarGridProps {
	config: PolarGridConfig;
	maxRadius?: number;
	showLabels?: boolean;
	opacity?: number;
	centerX?: number;
	centerY?: number;
}

/**
 * Enhanced polar grid overlay to visualize the layout structure
 * Shows concentric circles and radial lines with relevant information
 */
export default function PolarGrid({
	config,
	maxRadius = 500,
	showLabels = true,
	opacity = 0.15,
	centerX = 0,
	centerY = 0,
}: PolarGridProps) {
	if (!config) return null;

	// Extract relevant config values
	const {
		midLevelRadius = 300,
		radiusStep = 100,
		minRadius = 100,
		numAngleSteps = 8,
		angleOffsetDegrees = 0,
	} = config;

	// Calculate radii for concentric circles
	const radii: number[] = [];
	let currentRadius = minRadius;

	// Add circles below mid level
	while (currentRadius < midLevelRadius) {
		radii.push(currentRadius);
		currentRadius += radiusStep;
	}

	// Add mid level circle
	radii.push(midLevelRadius);
	currentRadius = midLevelRadius + radiusStep;

	// Add circles above mid level, up to maxRadius
	while (currentRadius <= maxRadius) {
		radii.push(currentRadius);
		currentRadius += radiusStep;
	}

	// Calculate angles for radial lines
	const angles: number[] = [];
	const angleStep = 360 / numAngleSteps;

	for (let i = 0; i < numAngleSteps; i++) {
		angles.push((i * angleStep + angleOffsetDegrees) % 360);
	}

	// Convert angle from degrees to radians
	const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

	return (
		<g className="polar-grid" pointerEvents="none">
			{/* Concentric Circles */}
			{radii.map((radius, index) => {
				// Highlight the mid-level radius
				const isMidLevel = radius === midLevelRadius;
				return (
					<React.Fragment key={`radius-${radius}`}>
						<circle
							cx={centerX}
							cy={centerY}
							r={radius}
							fill="none"
							stroke={isMidLevel ? "var(--primary)" : "var(--muted-foreground)"}
							strokeWidth={isMidLevel ? "0.75" : "0.5"}
							strokeDasharray={isMidLevel ? "none" : "4 4"}
							opacity={isMidLevel ? opacity * 1.5 : opacity}
						/>
						{showLabels && (
							<text
								x={centerX}
								y={centerY - radius}
								dy="-5"
								fontSize="10px"
								fill={isMidLevel ? "var(--primary)" : "var(--muted-foreground)"}
								textAnchor="middle"
								opacity={opacity * 1.5}
							>
								{radius === midLevelRadius ?
									`Mid (${radius})` :
									`${radius < midLevelRadius ? 'Junior' : 'Senior'} (${radius})`
								}
							</text>
						)}
					</React.Fragment>
				);
			})}

			{/* Radial Lines */}
			{angles.map((angle, index) => {
				const radians = toRadians(angle);
				const x2 = centerX + maxRadius * Math.cos(radians);
				const y2 = centerY + maxRadius * Math.sin(radians);

				// Position the label slightly beyond the line end
				const labelDistance = maxRadius * 1.05;
				const labelX = centerX + labelDistance * Math.cos(radians);
				const labelY = centerY + labelDistance * Math.sin(radians);

				return (
					<React.Fragment key={`angle-${angle}`}>
						<line
							x1={centerX}
							y1={centerY}
							x2={x2}
							y2={y2}
							stroke="var(--muted-foreground)"
							strokeWidth="0.5"
							strokeDasharray="4 4"
							opacity={opacity}
						/>
						{showLabels && (
							<text
								x={labelX}
								y={labelY}
								fontSize="10px"
								fill="var(--muted-foreground)"
								textAnchor="middle"
								dominantBaseline="middle"
								opacity={opacity * 1.5}
							>
								{angle}°
							</text>
						)}
					</React.Fragment>
				);
			})}

			{/* Debug Info Panel */}
			{showLabels && (
				<g transform={`translate(${centerX - 100}, ${centerY + maxRadius - 140})`}>
					<rect
						x={0}
						y={0}
						width={200}
						height={130}
						fill="var(--background)"
						fillOpacity={0.85}
						rx={4}
						ry={4}
						stroke="var(--border)"
						strokeWidth="0.5"
					/>
					<text x={10} y={20} fontSize="11px" fill="var(--foreground)" fontFamily="monospace">
						<tspan x={10} dy={0}>Polar Grid Config:</tspan>
						<tspan x={10} dy={16}>• Mid Radius: {midLevelRadius}</tspan>
						<tspan x={10} dy={16}>• Radius Step: {radiusStep}</tspan>
						<tspan x={10} dy={16}>• Min Radius: {minRadius}</tspan>
						<tspan x={10} dy={16}>• Angle Steps: {numAngleSteps}</tspan>
						<tspan x={10} dy={16}>• Angle Offset: {angleOffsetDegrees}°</tspan>
						<tspan x={10} dy={16}>• Pull Interchanges: {config.pullInterchanges || 0}</tspan>
					</text>
				</g>
			)}
		</g>
	);
}
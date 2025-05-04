// src/app/_components/metro/map/PolarGrid.tsx
"use client";

import React from 'react';
import type { PolarGridConfig } from '~/types/engine';

interface PolarGridProps {
	config: PolarGridConfig;
	maxRadius?: number;
	showLabels?: boolean;
	opacity?: number;
	centerX?: number; // Center X override (usually 0)
	centerY?: number; // Center Y override (usually 0)
	currentScale?: number; // Current zoom scale passed from parent
}

// Constants for adaptive sizing
const BASE_LABEL_FONT_SIZE = 10; // Base font size at scale 1
const MIN_LABEL_FONT_SIZE = 6;   // Minimum font size when zoomed out
const MAX_LABEL_FONT_SIZE = 24;  // Maximum font size when zoomed in
const BASE_CONFIG_FONT_SIZE = 9;
const MIN_CONFIG_FONT_SIZE = 5;
const MAX_CONFIG_FONT_SIZE = 11;

export default function PolarGrid({
	config,
	maxRadius = 500,
	showLabels = true,
	opacity = 0.15,
	centerX = 0,
	centerY = 0,
	currentScale = 1, // Default scale is 1
}: PolarGridProps) {
	if (!config) return null;

	// --- Scale Sanity Check ---
	// Ensure scale is a positive number, default to 1 otherwise
	const scale = (currentScale && currentScale > 0) ? currentScale : 1;
	const inverseScale = 1 / scale; // Used to counteract scaling for certain elements

	// --- Config Extraction ---
	const {
		midLevelRadius = 250,
		radiusStep = 70,
		minRadius = 100,
		numAngleSteps = 8,
		angleOffsetDegrees = 0,
	} = config;

	// --- Calculate Radii & Angles (Unchanged logic) ---
	const radii: number[] = [];
	if (minRadius > 0) radii.push(minRadius);
	if (midLevelRadius > 0 && !radii.includes(midLevelRadius)) radii.push(midLevelRadius);
	let currentR = radiusStep;
	while (currentR <= maxRadius) { if (!radii.includes(currentR)) radii.push(currentR); currentR += radiusStep; }
	radii.sort((a, b) => a - b);

	const angles: number[] = [];
	const angleStep = 360 / Math.max(1, numAngleSteps);
	for (let i = 0; i < numAngleSteps; i++) angles.push((i * angleStep + (angleOffsetDegrees || 0)) % 360);

	const toRadians = (degrees: number) => ((degrees || 0) * Math.PI) / 180;

	// --- Adaptive Sizing Calculations ---
	// Calculate font size based on scale, clamping between min and max
	const adaptiveLabelFontSize = Math.max(
		MIN_LABEL_FONT_SIZE,
		Math.min(MAX_LABEL_FONT_SIZE, BASE_LABEL_FONT_SIZE * inverseScale)
	);
	const adaptiveConfigFontSize = Math.max(
		MIN_CONFIG_FONT_SIZE,
		Math.min(MAX_CONFIG_FONT_SIZE, BASE_CONFIG_FONT_SIZE * inverseScale)
	);

	// Calculate adaptive line height for config panel tspans
	const adaptiveConfigLineHeight = 16 * inverseScale;
	// Calculate adaptive offset for radius labels
	const adaptiveRadiusLabelOffset = -5 * inverseScale;


	return (
		<g className="polar-grid" pointerEvents="none">
			{/* Concentric Circles */}
			{radii.map((radius) => {
				const isMidLevel = radius === midLevelRadius;
				const baseStrokeWidth = isMidLevel ? 0.75 : 0.5;

				return (
					<React.Fragment key={`radius-${radius}`}>
						<circle
							cx={centerX}
							cy={centerY}
							r={radius}
							fill="none"
							stroke={isMidLevel ? "var(--primary)" : "var(--muted-foreground)"}
							// strokeWidth={baseStrokeWidth * inverseScale} // Option 1: Scale stroke width directly
							strokeWidth={baseStrokeWidth} // Option 2: Use base width + vector-effect
							strokeDasharray={isMidLevel ? "none" : "4 4"}
							opacity={isMidLevel ? opacity * 1.5 : opacity}
							vectorEffect="non-scaling-stroke" // Option 2: Let SVG handle stroke scaling
						/>
						{showLabels && (
							<text
								x={centerX}
								y={centerY - radius}
								// dy="-5" // Use adaptive offset instead
								dy={adaptiveRadiusLabelOffset} // Adaptive vertical offset
								fontSize={adaptiveLabelFontSize} // Adaptive font size
								fill={isMidLevel ? "var(--primary)" : "var(--muted-foreground)"}
								textAnchor="middle"
								opacity={opacity * 1.5}
							// Prevent text from scaling with the main transform
							// style={{ transform: `scale(${inverseScale})`, transformOrigin: `${centerX}px ${centerY - radius}px` }} // Can cause issues with positioning
							// Simpler just to set adaptive font size
							>
								{radius === midLevelRadius ? `Mid (${radius.toFixed(0)})` : radius.toFixed(0)}
							</text>
						)}
					</React.Fragment>
				);
			})}

			{/* Radial Lines */}
			{angles.map((angle) => {
				const radians = toRadians(angle);
				const cosAngle = Math.cos(radians) || 0;
				const sinAngle = Math.sin(radians) || 0;
				const x2 = centerX + maxRadius * cosAngle;
				const y2 = centerY + maxRadius * sinAngle;
				const labelDistance = maxRadius + (20 * inverseScale); // Adjust label distance slightly based on scale
				const labelX = centerX + labelDistance * cosAngle;
				const labelY = centerY + labelDistance * sinAngle;
				const baseStrokeWidth = 0.5;

				return (
					<React.Fragment key={`angle-${angle}`}>
						<line
							x1={centerX}
							y1={centerY}
							x2={x2 || centerX}
							y2={y2 || centerY}
							stroke="var(--muted-foreground)"
							// strokeWidth={baseStrokeWidth * inverseScale} // Option 1
							strokeWidth={baseStrokeWidth} // Option 2
							strokeDasharray="4 4"
							opacity={opacity}
							vectorEffect="non-scaling-stroke" // Option 2
						/>
						{showLabels && (
							<text
								x={labelX || centerX}
								y={labelY || centerY}
								fontSize={adaptiveLabelFontSize} // Adaptive font size
								fill="var(--muted-foreground)"
								textAnchor="middle"
								dominantBaseline="middle"
								opacity={opacity * 1.5}
							>
								{angle.toFixed(0)}°
							</text>
						)}
					</React.Fragment>
				);
			})}

			{/* Config Info Panel - Also adapt font size and line height */}
			{showLabels && (
				// Position the group itself, let inverse scale handle text size
				<g transform={`translate(${centerX + maxRadius - 150}, ${centerY + maxRadius - 130})`}>
					{/* Apply inverse scale to the whole panel group */}
					<g transform={`scale(${inverseScale})`}>
						<rect
							x={0}
							y={0}
							width={140 / inverseScale} // Scale the rect size too if needed, or keep fixed
							height={120 / inverseScale}
							fill="var(--background)"
							fillOpacity={0.85}
							rx={4 * inverseScale} // Scale corner radius
							ry={4 * inverseScale}
							stroke="var(--border)"
							// strokeWidth={0.5 * inverseScale} // Scale stroke width
							strokeWidth={0.5} // Or use vector-effect
							vectorEffect="non-scaling-stroke"
						/>
						<text x={10} y={20} fontSize={adaptiveConfigFontSize} fill="var(--muted)" fontFamily="monospace">
							{/* Use adaptive line height for tspans */}
							<tspan x={10} dy={0}>Polar Grid Config:</tspan>
							<tspan x={10} dy={adaptiveConfigLineHeight}>• Mid Radius: {midLevelRadius?.toFixed(0)}</tspan>
							<tspan x={10} dy={adaptiveConfigLineHeight}>• Radius Step: {radiusStep?.toFixed(0)}</tspan>
							<tspan x={10} dy={adaptiveConfigLineHeight}>• Min Radius: {minRadius?.toFixed(0)}</tspan>
							<tspan x={10} dy={adaptiveConfigLineHeight}>• Angle Steps: {numAngleSteps}</tspan>
							<tspan x={10} dy={adaptiveConfigLineHeight}>• Angle Offset: {angleOffsetDegrees?.toFixed(0) || 0}°</tspan>
						</text>
					</g>
				</g>
			)}
		</g>
	);
}
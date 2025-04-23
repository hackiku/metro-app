// src/app/_components/metro/map/PolarGridBackground.tsx
"use client";

import React from 'react';

interface PolarGridBackgroundProps {
	centerX?: number; // Usually 0
	centerY?: number; // Usually 0
	maxRadius: number; // Furthest circle to draw
	radiusSteps?: number; // How many concentric circles
	angleSteps?: number; // How many radial lines
	radiusColor?: string;
	angleColor?: string;
	opacity?: number;
}

export function PolarGridBackground({
	centerX = 0,
	centerY = 0,
	maxRadius,
	radiusSteps = 5, // e.g., 5 circles
	angleSteps = 12, // e.g., 12 lines (every 30 degrees)
	radiusColor = "var(--foreground)",
	angleColor = "var(--foreground)",
	opacity = 0.2,
}: PolarGridBackgroundProps) {

	if (maxRadius <= 0 || radiusSteps <= 0 || angleSteps <= 0) {
		return null; // Don't render if invalid props
	}

	// Calculate radii for circles
	const radii = [];
	const radiusIncrement = maxRadius / radiusSteps;
	for (let i = 1; i <= radiusSteps; i++) {
		radii.push(i * radiusIncrement);
	}

	// Calculate angles for lines (in radians)
	const angles = [];
	const angleIncrement = (2 * Math.PI) / angleSteps;
	for (let i = 0; i < angleSteps; i++) {
		angles.push(i * angleIncrement);
	}

	return (
		<g className="polar-grid-background pointer-events-none">
			{/* Concentric Circles */}
			{radii.map((r, index) => (
				<circle
					key={`radius-${index}`}
					cx={centerX}
					cy={centerY}
					r={r}
					fill="none"
					stroke={radiusColor}
					strokeWidth="0.5"
					strokeDasharray="4 4"
					opacity={opacity}
				/>
			))}

			{/* Radial Lines */}
			{angles.map((angle, index) => (
				<line
					key={`angle-${index}`}
					x1={centerX}
					y1={centerY}
					// Calculate end point using trigonometry
					x2={centerX + maxRadius * Math.cos(angle)}
					y2={centerY + maxRadius * Math.sin(angle)}
					stroke={angleColor}
					strokeWidth="0.5"
					strokeDasharray="4 4"
					opacity={opacity * 0.6} // Make angle lines slightly more faint
				/>
			))}

			{/* Optional: Mark Center */}
			{/* <circle cx={centerX} cy={centerY} r={3} fill={angleColor} opacity={opacity * 1.5} /> */}
		</g>
	);
}

export default PolarGridBackground;
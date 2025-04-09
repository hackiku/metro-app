// src/app/_components/metro/map/components/YouAreHere.tsx
"use client"

import { memo } from "react";

interface YouAreHereProps {
	x: number;
	y: number;
}

export const YouAreHere = memo(function YouAreHere({ x, y }: YouAreHereProps) {
	return (
		<g transform={`translate(${x}, ${y})`} className="pointer-events-none">
			{/* Outer pulsing circle */}
			<circle
				className="animate-ping"
				r="8"
				fill="rgba(99, 102, 241, 0.3)"
			/>

			{/* Inner solid circle */}
			<circle
				r="6"
				fill="rgb(99, 102, 241)"
				stroke="white"
				strokeWidth="2"
			/>

			{/* Center dot */}
			<circle
				r="2"
				fill="white"
			/>
		</g>
	);
});
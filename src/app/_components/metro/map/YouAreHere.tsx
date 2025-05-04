// src/app/_components/metro/map/YouAreHere.tsx
"use client"

import React from 'react';
import { useUser } from '~/contexts/UserContext';

interface YouAreHereProps {
	currentNodeId: string | null;
	transform: { x: number; y: number; scale: number };
}

export function YouAreHere({ currentNodeId, transform }: YouAreHereProps) {
	const { currentUser } = useUser();

	// Don't render if no current node is selected
	if (!currentNodeId) return null;

	// Get the user's initial
	const initial = currentUser?.full_name
		? currentUser.full_name.charAt(0).toUpperCase()
		: "U";

	// No need to position this component based on coordinates since it will be
	// rendered in the node's position as determined by the MetroMap

	return (
		<g
			className="you-are-here-marker"
			transform={`translate(0, -40)`} // Position above the station
		>
			{/* Outer pulsing circle */}
			<circle
				r="14"
				fill="rgba(99, 102, 241, 0.3)"
				className="animate-ping"
			/>

			{/* Solid circle */}
			<circle
				r="10"
				fill="rgb(99, 102, 241)"
				stroke="white"
				strokeWidth="2"
			/>

			{/* User initial */}
			<text
				textAnchor="middle"
				dominantBaseline="central"
				fill="white"
				fontSize="12"
				fontWeight="bold"
			>
				{initial}
			</text>

			{/* "You are here" label */}
			{/* <foreignObject x="-50" y="15" width="100" height="24">
				<div className="flex justify-center">
					<div className="bg-background text-xs font-medium px-2 py-1 rounded shadow-sm border border-border whitespace-nowrap">
						You are here
					</div>
				</div>
			</foreignObject> */}
		</g>
	);
}
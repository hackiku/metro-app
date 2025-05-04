// src/app/_components/metro/map/YouAreHere.tsx
"use client"

import React from 'react';
import { useUser } from '~/contexts/UserContext';

interface YouAreHereProps {
	currentNodeId: string | null;
}

export function YouAreHere({ currentNodeId }: YouAreHereProps) {
	const { currentUser } = useUser();

	if (!currentNodeId) return null;

	// Get the user's initial
	const initial = currentUser?.full_name
		? currentUser.full_name.charAt(0).toUpperCase()
		: "U";

	return (
		<g className="you-are-here-marker">
			{/* Animated pulsing circle */}
			<circle
				cy={-26}
				r={12}
				fill="rgba(79, 70, 229, 0.2)"
				className="animate-ping"
			/>

			{/* Avatar circle */}
			<circle
				cy={-26}
				r={7}
				fill="#4f46e5"
				stroke="white"
				strokeWidth={1.5}
			/>

			{/* User initial */}
			<text
				y={-26}
				textAnchor="middle"
				dominantBaseline="middle"
				fill="white"
				fontSize={8}
				fontWeight="bold"
			>
				{initial}
			</text>

			{/* "You are here" label */}
			{/* <foreignObject x="-40" y="-50" width="80" height="20">
				<div className="flex justify-center">
					<div className="bg-background text-xs font-medium px-1.5 py-0.5 rounded shadow-sm border border-primary/20 whitespace-nowrap text-center">
						You are here
					</div>
				</div>
			</foreignObject> */}
		</g>
	);
}
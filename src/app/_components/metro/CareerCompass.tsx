// src/app/_components/metro/CareerCompass.tsx
"use client";

import React from 'react';
// Import the NEW context hook
import { useCareerCompass } from '~/contexts/CareerCompassProvider';
// Import the NEW display component
import DataDisplay from './DataDisplay'; // Assuming it's in the same folder

/**
 * CareerCompass: Main wrapper component.
 * Consumes context and passes data down to specific UI sections (like DataDisplay or later, the MetroMap).
 */
export default function CareerCompass() {
	// Destructure only the data needed by child components from the context
	const {
		organization,
		careerPaths,
		positions,
		positionDetails,
		loading,
		error,
	} = useCareerCompass();

	// --- Loading State ---
	if (loading) {
		return (
			<div className="flex items-center justify-center h-full w-full bg-background">
				<div className="flex flex-col items-center">
					{/* Use foreground color for spinner */}
					<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-foreground"></div>
					<p className="mt-4 text-muted-foreground">Loading Career Data...</p>
				</div>
			</div>
		);
	}

	// --- Error State ---
	if (error) {
		return (
			<div className="flex items-center justify-center h-full w-full p-4 bg-background">
				{/* Use destructive colors */}
				<div className="text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive/20 max-w-md">
					<h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
					<pre className="text-sm text-left whitespace-pre-wrap">{error}</pre>
					{/* Optionally add a retry button - might need refreshData from context */}
					<button
						onClick={() => window.location.reload()} // Simple reload for now
						className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 text-sm"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	// --- Success State ---
	// Render the DataDisplay component, passing down the fetched data
	return (
		// Ensure the container takes up space if needed, otherwise DataDisplay handles scroll
		<div className="h-full w-full">
			<DataDisplay
				organization={organization}
				careerPaths={careerPaths}
				positions={positions}
				positionDetails={positionDetails}
			// Pass other data down later when added back to context
			/>
			{/*
              Future additions:
              <PlayerCard user={...} />
              <ZoomControls onZoomIn={...} />
              <RoleDetails role={...} />
              <MetroMap layout={...} />
            */}
		</div>
	);
}
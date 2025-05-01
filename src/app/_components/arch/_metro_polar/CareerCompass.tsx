// src/app/_components/metro/CareerCompass.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { useCareerCompass } from '~/contexts/CareerCompassProvider';
import DataDisplay from './ui/DataDisplay';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Database } from 'lucide-react';
// --- Use the RENAMED engine function and map component ---
import { generateLayout } from './engine/layoutEngine'; // Updated import name
// import type {  } from './engine/layoutEngine'; // Updated import name
import type { LayoutData, LayoutConfig } from './engine/types'; // Properly import types
import MetroMap from './map/MetroMap'; // Updated import name

export default function CareerCompass() {
	const contextData = useCareerCompass();
	const {
		organization,
		careerPaths,
		positions,
		positionDetails,
		loading,
		error,
	} = contextData;

	const [isDataSheetOpen, setIsDataSheetOpen] = useState(false);
	// --- State for selected node ID ---
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

	// --- Layout Calculation ---
	const layout = useMemo<LayoutData | null>(() => { // Update type to LayoutData
		if (loading || error || !Array.isArray(careerPaths) || !Array.isArray(positionDetails) || !Array.isArray(positions)
			|| careerPaths.length === 0 || positionDetails.length === 0 || positions.length === 0) {
			console.log("Skipping layout calculation - data not ready");
			return null;
		}

		console.log("Calculating layout (v3 - Centrality)...");

		// Configuration for the layout engine
		const layoutConfig: Partial<LayoutConfig> = {
			radiusStep: 150,        // Increased for better spacing
			centerRadius: 50,      // Negative value for inverse mode
			centralityFactor: 1.6,   // Stronger centrality effect
			jitter: 0.01             // Minimal jitter for cleaner appearance
		};

		return generateLayout(
			careerPaths,
			positionDetails,
			positions,
			layoutConfig
		);
	}, [loading, error, careerPaths, positionDetails, positions]);

	// --- Loading State ---
	if (loading) { return <LoadingIndicator />; }

	// --- Error State ---
	if (error) { return <ErrorDisplay error={error} />; }

	// --- Success State ---
	return (
		<div className="relative h-full w-full text-foreground">
			{/* Render the updated MetroMap */}
			<div className="absolute inset-0">
				{layout ? (
					<MetroMap // Use renamed component
						layout={layout}
						selectedNodeId={selectedNodeId} // Pass selection state
						onNodeSelect={setSelectedNodeId} // Pass selection handler
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">Preparing map layout...</p>
					</div>
				)}
			</div>

			{/* Data Display Trigger & Sheet */}
			<div className="absolute top-4 right-4 z-10">
				<Sheet open={isDataSheetOpen} onOpenChange={setIsDataSheetOpen}>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="bg-background/80 backdrop-blur hover:bg-background/90"
						>
							<Database className="h-4 w-4" />
							<span className="sr-only">Show Data</span>
						</Button>
					</SheetTrigger>
					<SheetContent className="w-full max-w-lg sm:max-w-xl md:max-w-2xl" side="right">
						<SheetHeader>
							<SheetTitle>Career Framework Data</SheetTitle>
						</SheetHeader>
						<DataDisplay
							organization={organization}
							careerPaths={careerPaths}
							positions={positions}
							positionDetails={positionDetails}
						/>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
}


// --- Loading State component ---
const LoadingIndicator = () => (
	<div className="flex items-center justify-center h-full w-full bg-background">
		<div className="flex flex-col items-center">
			<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-foreground"></div>
			<p className="mt-4 text-muted-foreground">Loading Career Data...</p>
		</div>
	</div>
);

// --- Error State component ---
const ErrorDisplay = ({ error }: { error: string | null }) => (
	<div className="flex items-center justify-center h-full w-full p-4 bg-background">
		<div className="text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive/20 max-w-md">
			<h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
			<pre className="text-sm text-left whitespace-pre-wrap">{error}</pre>
			<button
				onClick={() => window.location.reload()}
				className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 text-sm"
			>
				Retry
			</button>
		</div>
	</div>
);
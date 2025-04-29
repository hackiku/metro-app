// src/app/_components/metro/CareerCompass.tsx
// Refactored to use tRPC hooks instead of context

import React, { useState, useMemo } from 'react';
import DataDisplay from './ui/DataDisplay';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Database } from 'lucide-react';
// Import the grid layout engine
import { generateGridLayout } from './engine/gridLayoutEngine';
import type { LayoutData } from './engine/types';
import StreamlinedMetroMap from './map/StreamlinedMetroMap';
// Import the new hook instead of context
import { useCareerCompassData } from './hooks/useCareerCompassData';

export default function CareerCompass() {
	// Use the new hook instead of the context
	const {
		organization,
		careerPaths,
		positions,
		positionDetails,
		loading,
		error,
	} = useCareerCompassData();

	const [isDataSheetOpen, setIsDataSheetOpen] = useState(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

	// Layout Calculation using the grid approach
	const layout = useMemo<LayoutData | null>(() => {
		if (loading || error || !Array.isArray(careerPaths) || !Array.isArray(positionDetails) || !Array.isArray(positions)
			|| careerPaths.length === 0 || positionDetails.length === 0 || positions.length === 0) {
			console.log("Skipping layout calculation - data not ready");
			return null;
		}

		console.log("Calculating grid layout...");

		return generateGridLayout(
			careerPaths,
			positionDetails,
			positions,
			{
				cellWidth: 100,
				cellHeight: 100,
				levelMultiplier: 1.5,
				domainSpread: 2,
				centerWeight: 0.4
			}
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
					<StreamlinedMetroMap
						layout={layout}
						selectedNodeId={selectedNodeId}
						onNodeSelect={setSelectedNodeId}
						routeMode="manhattan"
						cornerRadius={0}
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
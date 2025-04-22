// src/app/_components/metro/CareerCompass.tsx
"use client";

import React, { useState, useMemo } from 'react'; // Added useMemo
import { useCareerCompass } from '~/contexts/CareerCompassProvider';
import DataDisplay from './ui/DataDisplay'; // Assuming path is correct
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'; // Import Sheet components
import { Button } from '~/components/ui/button';
import { Database } from 'lucide-react'; // Icon for trigger

// --- Import the NEW basic engine and map ---
// Note: We will create these files next
import { generateBasicPolarLayout, type BasicLayoutData } from './engine/layoutEngine';
import BasicMetroMap from './map/BasicMetroMap'; // We'll call the basic map this for now

export default function CareerCompass() {
	const contextData = useCareerCompass();
	const {
		organization,
		careerPaths,
		positions, // Keep this, might be needed for names if not in details
		positionDetails,
		loading,
		error,
	} = contextData;

	const [isDataSheetOpen, setIsDataSheetOpen] = useState(false);

	// --- Basic Layout Calculation ---
	const basicLayout = useMemo<BasicLayoutData | null>(() => {
		if (loading || error || !careerPaths || !positionDetails) {
			return null;
		}
		console.log("Calculating basic layout...");
		// Prepare data slightly if needed, or pass directly
		// For now, pass directly assuming engine handles it
		return generateBasicPolarLayout(careerPaths, positionDetails, { radiusStep: 100 });
	}, [loading, error, careerPaths, positionDetails]); // Recalculate when data changes

	// --- Loading State ---
	if (loading) {
		return (
			<div className="flex items-center justify-center h-full w-full bg-background">
				<div className="flex flex-col items-center">
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
	}

	// --- Success State ---
	return (
		<div className="relative h-full w-full bg-background text-foreground">
			{/* Basic Map Display */}
			<div className="absolute inset-0">
				{basicLayout ? (
					<BasicMetroMap layout={basicLayout} />
				) : (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">Layout data not available.</p>
					</div>
				)}
			</div>

			{/* Data Display Trigger & Sheet */}
			<div className="absolute top-4 right-4 z-10">
				<Sheet open={isDataSheetOpen} onOpenChange={setIsDataSheetOpen}>
					<SheetTrigger asChild>
						<Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
							<Database className="h-4 w-4" />
							<span className="sr-only">View Raw Data</span>
						</Button>
					</SheetTrigger>
					<SheetContent className="w-full sm:w-[540px] md:w-[720px] lg:w-[900px] xl:w-[1080px] flex flex-col" side="right"> {/* Adjust width/side */}
						<SheetHeader>
							<SheetTitle>Raw Career Framework Data</SheetTitle>
						</SheetHeader>
						<div className="flex-1 overflow-y-auto pr-6"> {/* Make content scrollable */}
							<DataDisplay
								organization={organization}
								careerPaths={careerPaths}
								positions={positions} // Pass positions for potential name lookups
								positionDetails={positionDetails}
							/>
						</div>
					</SheetContent>
				</Sheet>
			</div>

			{/* Other UI elements like PlayerCard, ZoomControls would go here later */}
		</div>
	);
}
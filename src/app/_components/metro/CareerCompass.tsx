// src/app/_components/metro/CareerCompass.tsx
import React, { useState, useMemo, useRef } from 'react';
import DataDisplay from './ui/DataDisplay';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Database } from 'lucide-react';
// Import the metro layout engine
import { generateMetroLayout } from './engine/metroEngine';
import { DEFAULT_CONFIG } from './engine/config';
// Import necessary types
import type { LayoutData } from './engine/types';
import MetroMap from './map/MetroMap';
import type { MetroMapRef } from './map/MetroMap';
// Import the updated data hook
import { useCareerCompassData } from './hooks/useCareerCompassData';

export default function CareerCompass() {
	// Use the hook to get data
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
	const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
	// Default grid visibility based on environment
	const [showGrid, setShowGrid] = useState(process.env.NODE_ENV === 'development');

	// Ref for map controls
	const mapRef = useRef<MetroMapRef>(null);

	// Layout Calculation using our improved Metro engine
	const layout = useMemo<LayoutData | null>(() => {
		if (loading || error || !Array.isArray(careerPaths) || !Array.isArray(positionDetails) || !Array.isArray(positions)
			|| careerPaths.length === 0 || positionDetails.length === 0 || positions.length === 0) {
			console.log("Skipping layout calculation - data not ready");
			return null;
		}

		console.log("Calculating Metro layout...");

		try {
			// Use the metro layout generator with the default config
			// All config parameters can now be adjusted in config.ts
			return generateMetroLayout(
				careerPaths,
				positions,
				positionDetails,
				DEFAULT_CONFIG
			);
		} catch (layoutError) {
			console.error("Error generating metro layout:", layoutError);
			// Optionally return a fallback layout or null
			return null;
		}
	}, [loading, error, careerPaths, positionDetails, positions]);

	// --- Loading State ---
	if (loading) { return <LoadingIndicator />; }

	// --- Error State ---
	if (error) { return <ErrorDisplay error={error} />; }
	if (!layout) { return <LayoutErrorDisplay />; } // Specific message if layout fails

	// --- Event Handlers ---
	const handleSetTarget = (nodeId: string) => {
		setTargetNodeId(nodeId);
		// Center the map on the target
		mapRef.current?.centerOnNode(nodeId);
	};

	const handleRemoveTarget = () => {
		setTargetNodeId(null);
	};

	const handleNodeSelect = (nodeId: string | null) => {
		setSelectedNodeId(nodeId);
		// Optionally center on selected node
		if (nodeId) {
			// mapRef.current?.centerOnNode(nodeId);
		}
	}

	const handleToggleGrid = () => {
		setShowGrid(prev => !prev);
	};

	// --- Render ---
	return (
		<div className="relative h-full w-full text-foreground">
			{/* Render the MetroMap */}
			<div className="absolute inset-0">
				<MetroMap
					ref={mapRef}
					layout={layout} // Layout is guaranteed non-null here
					selectedNodeId={selectedNodeId}
					targetNodeId={targetNodeId}
					onNodeSelect={handleNodeSelect}
					onSetTarget={handleSetTarget}
					onRemoveTarget={handleRemoveTarget}
					showGrid={showGrid}
					onToggleGrid={handleToggleGrid}
				/>
			</div>

			{/* Data Display Trigger & Sheet */}
			<div className="absolute top-4 right-4 z-10">
				<Sheet open={isDataSheetOpen} onOpenChange={setIsDataSheetOpen}>
					<SheetTrigger asChild>
						<Button variant="outline" size="icon" className="bg-background/80 backdrop-blur hover:bg-background/90" >
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
							selectedNodeId={selectedNodeId}
							layoutData={layout}
						/>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
}

// --- Helper Components ---
const LoadingIndicator = () => (
	<div className="flex items-center justify-center h-full w-full bg-background">
		<div className="flex flex-col items-center">
			<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-foreground"></div>
			<p className="mt-4 text-muted-foreground">Loading Career Data...</p>
		</div>
	</div>
);

const ErrorDisplay = ({ error }: { error: string | null }) => (
	<div className="flex items-center justify-center h-full w-full p-4 bg-background">
		<div className="text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive/20 max-w-md">
			<h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
			<pre className="text-sm text-left whitespace-pre-wrap">{error || "Unknown error"}</pre>
			<button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 text-sm"> Retry </button>
		</div>
	</div>
);

const LayoutErrorDisplay = () => (
	<div className="flex items-center justify-center h-full w-full p-4 bg-background">
		<div className="text-center text-warning bg-warning/10 p-6 rounded-lg border border-warning/20 max-w-md">
			<h2 className="text-lg font-semibold mb-2">Layout Calculation Failed</h2>
			<p className="text-sm">Could not generate the map layout. Please check the data or configuration.</p>
			<button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-warning text-warning-foreground rounded hover:bg-warning/80 text-sm"> Retry </button>
		</div>
	</div>
);
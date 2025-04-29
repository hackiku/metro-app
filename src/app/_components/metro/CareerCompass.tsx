// src/app/_components/metro/CareerCompass.tsx
import React, { useState, useMemo, useRef } from 'react';
import DataDisplay from './ui/DataDisplay';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Database, ZoomIn, ZoomOut, RefreshCw, Grid } from 'lucide-react';
// Import the NEW polar grid layout engine
import { generatePolarGridLayout } from './engine/polarGridLayoutEngine';
// Import necessary types, including the config type
import type { LayoutData, PolarGridConfig } from './engine/types';
import MetroMap from './map/MetroMap';
import type { MetroMapRef } from './map/MetroMap';
// Import the data hook
import { useCareerCompassData } from './hooks/useCareerCompassData';
// Import organization type if needed by DataDisplay
import type { Organization } from "~/types/compass";

export default function CareerCompass() {
	// Use the hook to get data
	const {
		organization, // Assuming hook provides this or similar
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

	// Layout Calculation using the Polar Grid approach
	const layout = useMemo<LayoutData | null>(() => {
		if (loading || error || !Array.isArray(careerPaths) || !Array.isArray(positionDetails) || !Array.isArray(positions)
			|| careerPaths.length === 0 || positionDetails.length === 0 || positions.length === 0) {
			console.log("Skipping layout calculation - data not ready");
			return null;
		}

		console.log("Calculating Polar Grid layout...");

		// Define specific polar grid config options if needed
		const polarConfig: Partial<PolarGridConfig> = {
			midLevelRadius: 100,
			radiusStep: 70,
			numAngleSteps: 8, // 8 directions (45 deg steps)
			pullInterchanges: 0.6,
			nodeSortKey: 'level' // or 'sequence_in_path'
		};

		try {
			// Use the new polar grid layout generator
			return generatePolarGridLayout(
				careerPaths,
				positionDetails,
				positions,
				polarConfig // Pass the custom config
			);
		} catch (layoutError) {
			console.error("Error generating polar grid layout:", layoutError);
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

	const handleRemoveTarget = () => { // Removed nodeId param as it's not needed
		setTargetNodeId(null);
	};

	const handleNodeSelect = (nodeId: string | null) => {
		setSelectedNodeId(nodeId);
		// Optionally center on selected node
		if (nodeId) {
			// mapRef.current?.centerOnNode(nodeId);
		}
	}

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
					onNodeSelect={handleNodeSelect} // Use updated handler
					onSetTarget={handleSetTarget}
					onRemoveTarget={handleRemoveTarget}
					showGrid={showGrid} // Pass grid visibility state
				/>
			</div>

			{/* Map Controls */}
			<div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
				<Button
					variant="outline"
					size="icon"
					className="bg-background/80 backdrop-blur hover:bg-background/90"
					onClick={() => setShowGrid(prev => !prev)}
					title={showGrid ? "Hide Grid" : "Show Grid"}
				>
					<Grid className={`h-4 w-4 ${showGrid ? 'text-primary' : ''}`} />
				</Button>
				<Button variant="outline" size="icon" className="bg-background/80 backdrop-blur hover:bg-background/90" onClick={() => mapRef.current?.zoomIn()} title="Zoom In" >
					<ZoomIn className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="icon" className="bg-background/80 backdrop-blur hover:bg-background/90" onClick={() => mapRef.current?.zoomOut()} title="Zoom Out" >
					<ZoomOut className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="icon" className="bg-background/80 backdrop-blur hover:bg-background/90" onClick={() => mapRef.current?.zoomReset()} title="Reset View" >
					<RefreshCw className="h-4 w-4" />
				</Button>
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
							organization={organization as Organization | null | undefined} // Cast if needed
							careerPaths={careerPaths}
							positions={positions}
							positionDetails={positionDetails}
							selectedNodeId={selectedNodeId} // Pass selectedNodeId
							layoutData={layout} // Pass layout data if needed by DataDisplay
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
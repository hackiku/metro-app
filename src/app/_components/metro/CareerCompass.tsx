// src/app/_components/metro/CareerCompass.tsx
import React, { useState, useMemo, useRef } from 'react';
import DataDisplay from './ui/DataDisplay';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Database, ZoomIn, ZoomOut, RefreshCw, Grid } from 'lucide-react';
// Import the grid layout engine
import { generateGridLayout } from './engine/layoutEngine';
import type { LayoutData } from './engine/types';
import MetroMap from './map/MetroMap';
import type { MetroMapRef } from './map/MetroMap';

// Import the data hook
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
	const [showGrid, setShowGrid] = useState(process.env.NODE_ENV === 'development');

	// Ref for map controls
	const mapRef = useRef<MetroMapRef>(null);

	// Layout Calculation
	const layout = useMemo<LayoutData | null>(() => {
		if (loading || error || !Array.isArray(careerPaths) || !Array.isArray(positionDetails) || !Array.isArray(positions)
			|| careerPaths.length === 0 || positionDetails.length === 0 || positions.length === 0) {
			console.log("Skipping layout calculation - data not ready");
			return null;
		}

		console.log("Calculating layout...");

		return generateGridLayout(
			careerPaths,
			positionDetails,
			positions,
			{
				cellWidth: 100,
				cellHeight: 100,
				nodeSpacing: 1.5,
				centerWeight: 0.6
			}
		);
	}, [loading, error, careerPaths, positionDetails, positions]);

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

	// Handle target setting
	const handleSetTarget = (nodeId: string) => {
		setTargetNodeId(nodeId);
		// Center the map on the target
		if (mapRef.current) {
			mapRef.current.centerOnNode(nodeId);
		}
	};

	const handleRemoveTarget = () => {
		setTargetNodeId(null);
	};

	// --- Success State ---
	return (
		<div className="relative h-full w-full text-foreground">
			{/* Render the MetroMap */}
			<div className="absolute inset-0">
				{layout ? (
					<MetroMap
						ref={mapRef}
						layout={layout}
						selectedNodeId={selectedNodeId}
						targetNodeId={targetNodeId}
						onNodeSelect={setSelectedNodeId}
						onSetTarget={handleSetTarget}
						onRemoveTarget={handleRemoveTarget}
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">Preparing map layout...</p>
					</div>
				)}
			</div>

			{/* Map Controls */}
			<div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
				<Button
					variant="outline"
					size="icon"
					className="bg-background/80 backdrop-blur hover:bg-background/90"
					onClick={() => setShowGrid(prev => !prev)}
					title="Toggle Grid"
				>
					<Grid className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="bg-background/80 backdrop-blur hover:bg-background/90"
					onClick={() => mapRef.current?.zoomIn()}
					title="Zoom In"
				>
					<ZoomIn className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="bg-background/80 backdrop-blur hover:bg-background/90"
					onClick={() => mapRef.current?.zoomOut()}
					title="Zoom Out"
				>
					<ZoomOut className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="bg-background/80 backdrop-blur hover:bg-background/90"
					onClick={() => mapRef.current?.zoomReset()}
					title="Reset View"
				>
					<RefreshCw className="h-4 w-4" />
				</Button>
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
							selectedNodeId={selectedNodeId}
						/>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
}
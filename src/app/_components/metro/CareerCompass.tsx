// src/app/_components/metro/CareerCompass.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import DataDisplay from './ui/DataDisplay';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Database } from 'lucide-react';
// Import the metro layout engine
import { generateMetroLayout } from './engine/metroEngine';
import { DEFAULT_CONFIG } from './engine/config';

// Import user-related components
import PlayerCard from '../user/PlayerCard';
import { useUser } from '~/contexts/UserContext';

// Import necessary types
import type { LayoutData } from '~/types/engine';
import MetroMap from './map/MetroMap';
import type { MetroMapRef } from './map/MetroMap';
// Import the updated data hook
import { useCareerCompassData } from './hooks/useCareerCompassData';
// Import PositionPreview component
import PositionPreview from './ui/PositionPreview';

export default function CareerCompass() {
	// Use the hook to get data
	const {
		organization,
		careerPaths,
		positions,
		positionDetails,
		loading,
		error,
		refreshData
	} = useCareerCompassData();

	const { currentUser } = useUser();

	const [isDataSheetOpen, setIsDataSheetOpen] = useState(false);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
	// Default grid visibility based on environment
	const [showGrid, setShowGrid] = useState(process.env.NODE_ENV === 'development');
	// Current position ID (needed for comparison in position preview)
	const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

	// Ref for map controls
	const mapRef = useRef<MetroMapRef>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Set current node based on user data
	useEffect(() => {
		// If user has a current position ID, use it
		if (currentUser?.current_job_family_id && positionDetails) {
			// In a real app, you'd map the job family to the position detail
			// For now, we'll use a basic example
			const userPosition = positionDetails.find(p =>
				p.path_specific_description?.includes(currentUser.current_job_family_id)
			);

			if (userPosition) {
				setCurrentNodeId(userPosition.id);
				return;
			}
		}

		// Fallback: set first junior position as current
		if (positionDetails && positionDetails.length > 0) {
			const entryPosition = positionDetails.find(p => p.level === 1);
			if (entryPosition) {
				setCurrentNodeId(entryPosition.id);
			}
		}
	}, [currentUser, positionDetails]);

	// Get the selected position details for preview
	const selectedPositionDetail = useMemo(() => {
		if (!selectedNodeId || !positionDetails) return null;
		return positionDetails.find(detail => detail.id === selectedNodeId);
	}, [selectedNodeId, positionDetails]);

	// Get the selected position information
	const selectedPosition = useMemo(() => {
		if (!selectedPositionDetail || !positions) return null;
		return positions.find(position => position.id === selectedPositionDetail.position_id);
	}, [selectedPositionDetail, positions]);

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
		// Close the position preview when setting target
		setIsPreviewOpen(false);
	};

	const handleRemoveTarget = () => {
		setTargetNodeId(null);
		// Close the position preview when removing target
		setIsPreviewOpen(false);
	};

	const handleNodeSelect = (nodeId: string | null) => {
		setSelectedNodeId(nodeId);

		// Show position preview if a node is selected
		if (nodeId) {
			setIsPreviewOpen(true);
		} else {
			setIsPreviewOpen(false);
		}
	};

	const handleToggleGrid = () => {
		setShowGrid(prev => !prev);
	};

	// Set a user's position
	const handleSetUserPosition = (nodeId: string) => {
		setCurrentNodeId(nodeId);
		// In a real app, you would persist this to the user's profile
		console.log(`Setting user position to ${nodeId}`);
	};

	// --- Render ---
	return (
		<div className="relative h-full w-full text-foreground" ref={containerRef}>
			{/* Render the MetroMap */}
			<div className="absolute inset-0">
				<MetroMap
					ref={mapRef}
					layout={layout} // Layout is guaranteed non-null here
					selectedNodeId={selectedNodeId}
					targetNodeId={targetNodeId}
					currentNodeId={currentNodeId}
					onNodeSelect={handleNodeSelect}
					onSetTarget={handleSetTarget}
					onRemoveTarget={handleRemoveTarget}
					showGrid={showGrid}
					onToggleGrid={handleToggleGrid}
				/>
			</div>

			{/* Player Card */}
			
			<div className="absolute top-2 left-12 z-10">
				<PlayerCard
					onPositionChange={handleSetUserPosition}
					currentPositionId={currentNodeId}
				/>
			</div>

			{/* Position Preview Drawer */}
			<PositionPreview
				position={selectedPosition}
				positionDetail={selectedPositionDetail}
				isOpen={isPreviewOpen && !!selectedNodeId}
				onOpenChange={setIsPreviewOpen}
				onSetTarget={handleSetTarget}
				onRemoveTarget={handleRemoveTarget}
				onClose={() => setIsPreviewOpen(false)}
				isCurrent={selectedNodeId === currentNodeId}
				isTarget={selectedNodeId === targetNodeId}
			/>

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
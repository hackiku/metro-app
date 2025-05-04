// src/app/_components/metro/map/MetroMap.tsx
"use client";

import React, { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import type { LayoutData, LayoutNode } from '../engine/types';
import PolarGrid from './PolarGrid';
import MetroLine from './MetroLine';
import MetroStation from './MetroStation';
import ZoomControls from '../ui/ZoomControls';
import { useMetroMapInteraction } from '../hooks/useMetroMapInteraction'; // Assuming the hook is correctly imported

interface MetroMapProps {
	layout: LayoutData;
	selectedNodeId?: string | null;
	onNodeSelect?: (nodeId: string | null) => void;
	currentNodeId?: string | null;
	targetNodeId?: string | null;
	onSetTarget?: (nodeId: string) => void;
	onRemoveTarget?: (nodeId?: string) => void;
	onSetAsFavorite?: (nodeId: string) => void;
	onViewDetails?: (nodeId: string) => void;
	showGrid?: boolean;
	onToggleGrid?: () => void;
	className?: string;
}

export interface MetroMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	zoomReset: () => void;
	centerOnNode: (nodeId: string) => void;
}

const MetroMap = forwardRef<MetroMapRef, MetroMapProps>(({
	layout,
	selectedNodeId,
	onNodeSelect,
	currentNodeId,
	targetNodeId,
	onSetTarget,
	onRemoveTarget,
	onSetAsFavorite,
	onViewDetails,
	showGrid = false, // Default to false unless overridden
	onToggleGrid,
	className = ""
}, ref) => {
	const containerRef = useRef<HTMLDivElement>(null);

	// Use our interaction hook for all zoom and drag functionality
	const [{ dimensions, transform, isDragging, svgRef }, {
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnNode,
		handleMouseDown,
		handleMouseMove,
		handleMouseUpOrLeave,
		handleBackgroundClick
	}] = useMetroMapInteraction({ layout, containerRef });

	// Store station coordinates for player positioning
	// This attaches coordinates to the window for access elsewhere
	React.useEffect(() => {
		if (!layout?.nodes) return;

		// Create an object to store coordinates
		const stationCoordinates: Record<string, { x: number, y: number }> = {};

		// Transform coordinates based on current transform
		layout.nodes.forEach(node => {
			stationCoordinates[node.id] = {
				x: node.x * transform.scale + transform.x,
				y: node.y * transform.scale + transform.y
			};
		});

		// Attach to window for global access
		if (typeof window !== 'undefined') {
			(window as any)._metroStationCoordinates = stationCoordinates;
		}
	}, [layout, transform]);

	// Group nodes by path for easier rendering
	const nodesByPath = useMemo(() => {
		const result = new Map<string, LayoutNode[]>();

		if (!layout?.paths || !layout?.nodesById) return result; // Added checks for layout properties

		layout.paths.forEach(path => {
			const pathNodes = path.nodes
				.map(nodeId => layout.nodesById[nodeId])
				.filter((node): node is LayoutNode => !!node); // Ensure node exists
			result.set(path.id, pathNodes);
		});

		return result;
	}, [layout]);

	// Calculate the maximum radius for the polar grid
	const maxRadius = useMemo(() => {
		if (!layout?.nodes?.length) return 500; // Default max radius

		let maxDist = 0;
		layout.nodes.forEach(node => {
			// Ensure node coordinates are numbers
			const x = typeof node.x === 'number' ? node.x : 0;
			const y = typeof node.y === 'number' ? node.y : 0;
			const dist = Math.sqrt(x * x + y * y);
			maxDist = Math.max(maxDist, dist);
		});

		// Add some padding and round up nicely
		return Math.ceil(maxDist * 1.2 / 100) * 100;
	}, [layout]);

	// Expose methods via ref
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnNode
	}), [zoomIn, zoomOut, zoomReset, centerOnNode]);

	// Enhanced background click handler that also handles node deselection
	const handleBackgroundClickWithDeselect = (e: React.MouseEvent<SVGSVGElement>) => {
		handleBackgroundClick(e);

		// Check if the click target is the background or the main transform group
		const target = e.target as Element;
		const isBackgroundClick = target === svgRef.current || target === svgRef.current?.firstElementChild;

		// If it's a background click and not initiated from dragging, deselect
		if (!isDragging && isBackgroundClick && onNodeSelect) {
			onNodeSelect(null);
		}
	};

	// Handle favorite node - implementation example
	const handleSetAsFavorite = (nodeId: string) => {
		console.log(`Node ${nodeId} added to favorites`);
		// Implement favorite functionality here
		// For example, save to local storage or user preferences

		// For demo, use toast notification
		if (typeof window !== 'undefined' && (window as any).toast) {
			(window as any).toast({
				title: "Added to favorites",
				description: `Position has been added to your favorites.`,
			});
		}
	};

	// Handle potential missing layout data gracefully
	if (!layout) {
		// Optionally return a loading indicator or null
		return <div className={`flex items-center justify-center w-full h-full ${className}`}>Loading Layout...</div>;
	}

	return (
		<div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
			{/* ZoomControls Component */}
			<div className="absolute left-4 top-4 z-10">
				<ZoomControls
					onZoomIn={zoomIn}
					onZoomOut={zoomOut}
					onZoomReset={zoomReset}
					showGrid={showGrid}
					onToggleGrid={onToggleGrid}
					currentZoom={transform.scale}
				/>
			</div>

			<svg
				ref={svgRef}
				width={dimensions.width}
				height={dimensions.height}
				className={`block w-full h-full bg-background`}
				style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUpOrLeave}
				onMouseLeave={handleMouseUpOrLeave} // Handle leaving the SVG area
				onClick={handleBackgroundClickWithDeselect}
			>
				{/* Main transform group */}
				<g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
					{/* PolarGrid - Pass the current scale */}
					{showGrid && layout.configUsed && (
						<PolarGrid
							config={layout.configUsed}
							maxRadius={maxRadius}
							showLabels={true} // Can be controlled by state if needed
							opacity={0.15}
							// --- PASS SCALE PROP ---
							currentScale={transform.scale}
						/>
					)}

					{/* Path lines */}
					{layout.paths.map(path => {
						const pathNodes = nodesByPath.get(path.id) || [];
						// Determine if any node on this path is selected
						const isPathSelected = selectedNodeId ?
							pathNodes.some(node => node.id === selectedNodeId) :
							false;

						return (
							<MetroLine
								key={`line-${path.id}`}
								path={path}
								nodes={pathNodes}
								lineWidth={2} // Base line width
								opacity={0.75}
								isSelected={isPathSelected} // Pass selection state
							/>
						);
					})}

					{/* Stations */}
					{layout.nodes.map(node => (
						<MetroStation
							key={`station-${node.id}`}
							node={node}
							isSelected={node.id === selectedNodeId}
							isCurrent={node.id === currentNodeId}
							isTarget={node.id === targetNodeId}
							onClick={onNodeSelect ? () => onNodeSelect(node.id) : undefined}
							onSetTarget={onSetTarget}
							onRemoveTarget={onRemoveTarget}
							onViewDetails={onViewDetails}
							onSetAsFavorite={onSetAsFavorite || handleSetAsFavorite}
						/>
					))}
				</g>
			</svg>
		</div>
	);
});

MetroMap.displayName = 'MetroMap';

export default MetroMap;
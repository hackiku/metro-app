// src/app/_components/metro/map/MetroMap.tsx
"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from "react";
import * as d3 from "d3";
import type { MetroLine, MetroStation } from "../types/metro";
import { Line } from "./components/Line";
import { Station } from "./components/Station";

// Store zoom state globally to persist between navigation
// This is a simple solution for the demo; consider using React Context for production
let globalZoomState: {
	transform?: d3.ZoomTransform;
	initialized: boolean;
} = {
	initialized: false
};

export interface MetroMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	zoomReset: () => void;
}

interface MetroMapProps {
	lines: MetroLine[];
	isLoading?: boolean;
	onStationSelect?: (station: MetroStation) => void;
	selectedStation?: MetroStation | null;
	currentStation?: MetroStation | null;
}

export const MetroMap = forwardRef<MetroMapRef, MetroMapProps>(function MetroMap(
	{ lines, isLoading = false, onStationSelect, selectedStation, currentStation },
	ref
) {
	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<SVGGElement>(null);

	// Use refs to maintain instance references across renders
	const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

	// Store current dimensions
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

	// Track whether the component is mounted
	const isMountedRef = useRef(false);

	// Function to handle zoom events
	const handleZoom = useCallback((event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
		if (!containerRef.current) return;

		// Store the transform globally for persistence
		globalZoomState.transform = event.transform;

		// Apply transformation to the container
		d3.select(containerRef.current).attr("transform", event.transform.toString());
	}, []);

	// Update dimensions when window resizes
	useEffect(() => {
		function updateDimensions() {
			if (!svgRef.current) return;

			const { width, height } = svgRef.current.getBoundingClientRect();
			setDimensions({
				width: width || 800,
				height: height || 600
			});
		}

		// Initial update
		updateDimensions();

		// Add resize listener
		window.addEventListener('resize', updateDimensions);

		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	}, []);

	// Calculate bounds based on stations
	const getBounds = useCallback(() => {
		if (lines.length === 0) {
			return { minX: 0, minY: 0, maxX: 100, maxY: 100, padding: 20 };
		}

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		const padding = 50;

		lines.forEach(line => {
			line.stations.forEach(station => {
				minX = Math.min(minX, station.x);
				minY = Math.min(minY, station.y);
				maxX = Math.max(maxX, station.x);
				maxY = Math.max(maxY, station.y);
			});
		});

		return {
			minX: minX - padding,
			minY: minY - padding,
			maxX: maxX + padding,
			maxY: maxY + padding,
			padding
		};
	}, [lines]);

	// Create scales based on dimensions and bounds
	const createScales = useCallback(() => {
		const { minX, minY, maxX, maxY } = getBounds();

		const xScale = d3.scaleLinear()
			.domain([minX, maxX])
			.range([50, dimensions.width - 50]);

		const yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([50, dimensions.height - 50]);

		return { xScale, yScale };
	}, [getBounds, dimensions]);

	// Initialize or update zoom behavior
	// This is the CRITICAL function for fixing zoom persistence
	const initializeZoom = useCallback(() => {
		if (!svgRef.current || !containerRef.current) return null;

		const svg = d3.select(svgRef.current);

		// IMPORTANT: First remove any existing zoom behavior
		svg.on(".zoom", null);

		// Create a new zoom behavior
		const zoom = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 5])
			.on("zoom", handleZoom);

		// Apply zoom to SVG
		svg.call(zoom);

		// Determine initial transform
		let initialTransform: d3.ZoomTransform;

		if (globalZoomState.initialized && globalZoomState.transform) {
			// Use stored transform if available
			initialTransform = globalZoomState.transform;
		} else {
			// Create a new initial transform
			initialTransform = d3.zoomIdentity
				.translate(dimensions.width / 4, dimensions.height / 4)
				.scale(0.9);

			globalZoomState.initialized = true;
			globalZoomState.transform = initialTransform;
		}

		// Apply the transform
		svg.call(zoom.transform, initialTransform);

		return zoom;
	}, [dimensions, handleZoom]);

	// Zoom control functions
	const zoomIn = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);
		const currentTransform = d3.zoomTransform(svg.node() as Element);
		const newScale = Math.min(5, currentTransform.k * 1.2);

		svg.transition().duration(300)
			.call(zoomBehaviorRef.current.transform,
				currentTransform.scale(newScale / currentTransform.k));

		// Update global state
		globalZoomState.transform = currentTransform.scale(newScale / currentTransform.k);
	}, []);

	const zoomOut = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);
		const currentTransform = d3.zoomTransform(svg.node() as Element);
		const newScale = Math.max(0.5, currentTransform.k / 1.2);

		svg.transition().duration(300)
			.call(zoomBehaviorRef.current.transform,
				currentTransform.scale(newScale / currentTransform.k));

		// Update global state
		globalZoomState.transform = currentTransform.scale(newScale / currentTransform.k);
	}, []);

	const zoomReset = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const initialTransform = d3.zoomIdentity
			.translate(dimensions.width / 4, dimensions.height / 4)
			.scale(0.9);

		const svg = d3.select(svgRef.current);
		svg.transition().duration(300)
			.call(zoomBehaviorRef.current.transform, initialTransform);

		// Update global state
		globalZoomState.transform = initialTransform;
	}, [dimensions]);

	// Expose zoom methods to parent via ref
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset
	}), [zoomIn, zoomOut, zoomReset]);

	// Set up D3 zoom behavior on mount and when dimensions change
	useEffect(() => {
		if (!svgRef.current || !containerRef.current) return;

		// Track that the component is mounted
		isMountedRef.current = true;

		// Initialize zoom behavior
		const zoom = initializeZoom();
		zoomBehaviorRef.current = zoom;

		// CRITICAL: Proper cleanup on unmount
		return () => {
			if (svgRef.current) {
				// Explicitly remove all zoom handlers to prevent memory leaks
				d3.select(svgRef.current).on(".zoom", null);
			}

			// Note that we're NOT clearing globalZoomState here
			// as we want to preserve it for when we return to this page

			isMountedRef.current = false;
		};
	}, [initializeZoom]);

	// Store station coordinates for external components (like Player)
	useEffect(() => {
		if (lines.length === 0 || typeof window === 'undefined') return;

		const { xScale, yScale } = createScales();
		const coordinates: Record<string, { x: number, y: number }> = {};

		lines.forEach(line => {
			line.stations.forEach(station => {
				coordinates[station.id] = {
					x: xScale(station.x),
					y: yScale(station.y)
				};
			});
		});

		window._metroStationCoordinates = coordinates;

		return () => {
			if (window._metroStationCoordinates === coordinates) {
				window._metroStationCoordinates = undefined;
			}
		};
	}, [lines, createScales]);

	// Render loading state
	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="flex flex-col items-center">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
					<p className="mt-4 text-muted-foreground">Loading metro map...</p>
				</div>
			</div>
		);
	}

	// Render empty state
	if (lines.length === 0) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="text-center">
					<p className="text-lg font-semibold">No metro lines found</p>
					<p className="mt-2 text-muted-foreground">No data available for the current view</p>
				</div>
			</div>
		);
	}

	// Calculate scales for rendering
	const { xScale, yScale } = createScales();

	return (
		<div className="h-full w-full">
			<svg
				ref={svgRef}
				className="h-full w-full touch-none bg-background"
				preserveAspectRatio="xMidYMid meet"
			>
				<g ref={containerRef}>
					{/* Render lines first (below stations) */}
					{lines.map(line => (
						<Line
							key={line.id}
							stations={line.stations}
							color={line.color}
							xScale={xScale}
							yScale={yScale}
						/>
					))}

					{/* Then render all stations */}
					{lines.map(line =>
						line.stations.map(station => (
							<Station
								key={station.id}
								station={station}
								x={xScale(station.x)}
								y={yScale(station.y)}
								color={line.color}
								isSelected={selectedStation?.id === station.id}
								isCurrent={currentStation?.id === station.id}
								onClick={onStationSelect || (() => { })}
							/>
						))
					)}
				</g>
			</svg>
		</div>
	);
});
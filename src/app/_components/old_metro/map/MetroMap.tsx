// src/app/_components/metro/map/MetroMap.tsx
"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from "react";
import * as d3 from "d3";
import { Line } from "./components/Line";
import { Station } from "./components/Station";
import { ConnectionPath } from "./components/ConnectionPath";
import {
	fetchMetroData,
	type MetroData,
	type Line as LineData,
	type Station as StationData
} from "../services/dataService";
import {
	calculateLayout,
	type LayoutConfig
} from "../services/layoutEngine";

// Create a persistent zoom state object
const PersistentZoomState = {
	transform: null as d3.ZoomTransform | null,
	initialized: false,

	// Method to save current transform
	save(transform: d3.ZoomTransform) {
		this.transform = transform;
		this.initialized = true;
	},

	// Method to get current transform
	get() {
		return this.transform;
	},

	// Check if we have an initial state
	hasState() {
		return this.initialized;
	},

	// Reset the state if needed
	reset() {
		this.transform = null;
		this.initialized = false;
	}
};

// Interface for the component ref
export interface MetroMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	zoomReset: () => void;
}

// Props interface
interface MetroMapProps {
	schema?: string;
	onStationSelect?: (station: StationData) => void;
	selectedStation?: StationData | null;
	currentStation?: StationData | null;
	activeCategory?: string;
}

export const MetroMap = forwardRef<MetroMapRef, MetroMapProps>(function MetroMap(
	{
		schema = 'gasunie',
		onStationSelect,
		selectedStation,
		currentStation,
		activeCategory
	},
	ref
) {
	// Core refs
	const svgRef = useRef<SVGSVGElement>(null);
	const zoomContainerRef = useRef<SVGGElement>(null);
	const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

	// Component lifecycle tracking
	const isMounted = useRef(true);

	// Internal component state
	const [metroData, setMetroData] = useState<MetroData | null>(null);
	const [processedData, setProcessedData] = useState<MetroData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [scales, setScales] = useState<{
		xScale: d3.ScaleLinear<number, number>;
		yScale: d3.ScaleLinear<number, number>
	} | null>(null);

	// Layout configuration
	const [layoutConfig] = useState<LayoutConfig>({
		lineSpacing: 100,
		levelSpacing: 150,
		padding: 50,
		adjustInterchanges: true,
		stationRadius: 12,
		lineWidth: 8
	});

	// Store dimensions as a ref to prevent unnecessary re-renders
	const dimensionsRef = useRef({
		width: typeof window !== 'undefined' ? window.innerWidth : 800,
		height: typeof window !== 'undefined' ? window.innerHeight - 64 : 600
	});

	// Fetch metro data
	useEffect(() => {
		let isActive = true;

		async function loadData() {
			if (!isActive) return;

			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchMetroData(schema);

				if (isActive) {
					setMetroData(data);
				}
			} catch (err) {
				console.error("Error loading metro data:", err);
				if (isActive) {
					setError("Failed to load metro data");
				}
			} finally {
				if (isActive) {
					setIsLoading(false);
				}
			}
		}

		loadData();

		return () => {
			isActive = false;
		};
	}, [schema, activeCategory]);

	// Process and layout the data
	useEffect(() => {
		if (!metroData) return;

		// Apply layout to position stations
		const data = calculateLayout(metroData, layoutConfig);
		setProcessedData(data);
	}, [metroData, layoutConfig]);

	// Calculate bounds based on station data
	const calculateBounds = useCallback(() => {
		// Default bounds if no data
		if (!processedData || processedData.lines.length === 0) {
			return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
		}

		// Find min/max coordinates across all stations
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		processedData.lines.forEach(line => {
			line.stations.forEach(station => {
				if (station.x !== undefined && station.y !== undefined) {
					minX = Math.min(minX, station.x);
					minY = Math.min(minY, station.y);
					maxX = Math.max(maxX, station.x);
					maxY = Math.max(maxY, station.y);
				}
			});
		});

		// Add padding
		const padding = layoutConfig.padding;
		return {
			minX: minX - padding,
			minY: minY - padding,
			maxX: maxX + padding,
			maxY: maxY + padding
		};
	}, [processedData, layoutConfig.padding]);

	// Create scales based on bounds and dimensions
	const createScales = useCallback(() => {
		const bounds = calculateBounds();
		const { width, height } = dimensionsRef.current;

		const xScale = d3.scaleLinear()
			.domain([bounds.minX, bounds.maxX])
			.range([50, width - 50]);

		const yScale = d3.scaleLinear()
			.domain([bounds.minY, bounds.maxY])
			.range([50, height - 50]);

		return { xScale, yScale };
	}, [calculateBounds]);

	// Zoom control methods
	const zoomIn = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		try {
			const svg = d3.select(svgRef.current);
			const currentTransform = d3.zoomTransform(svg.node()!);
			const newScale = Math.min(5, currentTransform.k * 1.2);

			svg.transition().duration(300)
				.call(zoomBehaviorRef.current.transform, currentTransform.scale(newScale / currentTransform.k));

			// Save transform state
			PersistentZoomState.save(currentTransform.scale(newScale / currentTransform.k));
		} catch (error) {
			console.error("Error in zoomIn:", error);
		}
	}, []);

	const zoomOut = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		try {
			const svg = d3.select(svgRef.current);
			const currentTransform = d3.zoomTransform(svg.node()!);
			const newScale = Math.max(0.5, currentTransform.k / 1.2);

			svg.transition().duration(300)
				.call(zoomBehaviorRef.current.transform, currentTransform.scale(newScale / currentTransform.k));

			// Save transform state
			PersistentZoomState.save(currentTransform.scale(newScale / currentTransform.k));
		} catch (error) {
			console.error("Error in zoomOut:", error);
		}
	}, []);

	const zoomReset = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		try {
			const svg = d3.select(svgRef.current);
			const { width, height } = dimensionsRef.current;

			const initialTransform = d3.zoomIdentity.scale(1.1).translate(width / 4, height / 8);

			svg.transition().duration(300)
				.call(zoomBehaviorRef.current.transform, initialTransform);

			// Save transform state
			PersistentZoomState.save(initialTransform);
		} catch (error) {
			console.error("Error in zoomReset:", error);
		}
	}, []);

	// Expose zoom methods via ref
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset
	}), [zoomIn, zoomOut, zoomReset]);

	// Track window resizing and update dimensions
	useEffect(() => {
		const updateDimensions = () => {
			dimensionsRef.current = {
				width: window.innerWidth,
				height: window.innerHeight - 64 // Subtract navbar height
			};

			// Update scales when dimensions change
			setScales(createScales());
		};

		// Initial update
		updateDimensions();

		// Add resize listener
		window.addEventListener('resize', updateDimensions);

		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	}, [createScales]);

	// Component lifecycle tracking
	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
		};
	}, []);

	// Initial setup of scales when data is available
	useEffect(() => {
		if (processedData && processedData.lines.length > 0) {
			setScales(createScales());
		}
	}, [processedData, createScales]);

	// Initialize and manage D3 zoom behavior
	useEffect(() => {
		if (!svgRef.current || !zoomContainerRef.current) return;

		// Clean up existing zoom behavior
		const svg = d3.select(svgRef.current);
		svg.on(".zoom", null);

		// Create new zoom behavior
		const zoom = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 5])
			.on("zoom", (event) => {
				if (!zoomContainerRef.current || !isMounted.current) return;

				// Apply transform to container
				d3.select(zoomContainerRef.current).attr("transform", event.transform.toString());

				// Save transform for persistence
				PersistentZoomState.save(event.transform);
			});

		// Store zoom behavior in ref
		zoomBehaviorRef.current = zoom;

		// Apply zoom behavior to SVG
		svg.call(zoom);

		// Default transform
		const { width, height } = dimensionsRef.current;
		const defaultTransform = d3.zoomIdentity.scale(1.1).translate(width / 4, height / 8);

		// Apply saved transform or default
		if (PersistentZoomState.hasState() && PersistentZoomState.get()) {
			svg.call(zoom.transform, PersistentZoomState.get()!);
		} else {
			svg.call(zoom.transform, defaultTransform);
			PersistentZoomState.save(defaultTransform);
		}

		// Clean up on unmount
		return () => {
			if (svgRef.current) {
				// Remove zoom handlers
				d3.select(svgRef.current).on(".zoom", null);
			}
		};
	}, []); // Empty dependency array - initialize zoom only once

	// Store station coordinates in global variable for external components
	useEffect(() => {
		if (!scales || !processedData || processedData.lines.length === 0 || typeof window === 'undefined') return;

		const { xScale, yScale } = scales;
		const coordinates: Record<string, { x: number, y: number }> = {};

		processedData.lines.forEach(line => {
			line.stations.forEach(station => {
				if (station.x !== undefined && station.y !== undefined) {
					coordinates[station.id] = {
						x: xScale(station.x),
						y: yScale(station.y)
					};
				}
			});
		});

		window._metroStationCoordinates = coordinates;

		return () => {
			if (window._metroStationCoordinates === coordinates) {
				window._metroStationCoordinates = undefined;
			}
		};
	}, [processedData, scales]);

	// Find selectedStation in our processed data if needed
	const findStationById = useCallback((id: string): StationData | undefined => {
		if (!processedData) return undefined;

		for (const line of processedData.lines) {
			const station = line.stations.find(s => s.id === id);
			if (station) return station;
		}

		return undefined;
	}, [processedData]);

	// Base SVG component - this is ALWAYS rendered, even during loading
	// This prevents the zoom state from being lost during loading/reloading
	return (
		<div className="h-full w-full relative">
			{/* The SVG container is always present */}
			<svg
				ref={svgRef}
				className="h-full w-full bg-background touch-none select-none"
				preserveAspectRatio="xMidYMid meet"
				onClick={(e) => e.stopPropagation()}
			>
				<g ref={zoomContainerRef} className="zoom-container">
					{/* Only render content when we have data and scales */}
					{!isLoading && processedData && scales && (
						<>
							{/* Render connections between stations */}
							{processedData.connections.map(connection => {
								const fromStation = findStationById(connection.fromStationId);
								const toStation = findStationById(connection.toStationId);
								const lineForStation = processedData.lines.find(
									line => line.stations.some(s => s.id === connection.fromStationId)
								);

								if (!fromStation || !toStation || !lineForStation) return null;

								return (
									<ConnectionPath
										key={connection.id}
										fromStation={fromStation}
										toStation={toStation}
										color={lineForStation.color}
										isRecommended={connection.isRecommended}
									/>
								);
							})}

							{/* Render lines */}
							{processedData.lines.map(line => (
								<Line
									key={line.id}
									stations={line.stations}
									color={line.color}
									xScale={scales.xScale}
									yScale={scales.yScale}
								/>
							))}

							{/* Render stations */}
							{processedData.lines.map(line =>
								line.stations.map(station => (
									<Station
										key={station.id}
										station={station}
										x={scales.xScale(station.x || 0)}
										y={scales.yScale(station.y || 0)}
										color={line.color}
										isSelected={selectedStation?.id === station.id}
										isCurrent={currentStation?.id === station.id}
										isInterchange={station.isInterchange}
										onClick={() => onStationSelect?.(station)}
									/>
								))
							)}
						</>
					)}
				</g>
			</svg>

			{/* Loading overlay - sits on top of the SVG */}
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10">
					<div className="flex flex-col items-center">
						<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
						<p className="mt-4 text-muted-foreground">Loading metro map...</p>
					</div>
				</div>
			)}

			{/* Error state overlay */}
			{error && (
				<div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10">
					<div className="text-center">
						<p className="text-lg font-semibold text-destructive">Error loading metro map</p>
						<p className="mt-2 text-muted-foreground">{error}</p>
					</div>
				</div>
			)}

			{/* Empty state overlay */}
			{!isLoading && !error && (!processedData || processedData.lines.length === 0) && (
				<div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10">
					<div className="text-center">
						<p className="text-lg font-semibold">No metro lines found</p>
						<p className="mt-2 text-muted-foreground">No data available for the current view</p>
					</div>
				</div>
			)}
		</div>
	);
});
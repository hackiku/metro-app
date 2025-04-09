// src/app/_components/metro/map/MetroMap.tsx
"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from "react";
import * as d3 from "d3";
import type { MetroLine, MetroStation } from "../types/metro";
import { Line } from "./components/Line";
import { Station } from "./components/Station";

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
	const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
	const containerRef = useRef<SVGGElement>(null);
	const isMountedRef = useRef(false);

	// Store dimensions
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

	// Get base dimensions and update on resize
	useEffect(() => {
		const updateDimensions = () => {
			if (!svgRef.current) return;
			const { width, height } = svgRef.current.getBoundingClientRect();
			setDimensions({ width, height });
		};

		// Initial update
		updateDimensions();

		// Add resize listener
		window.addEventListener('resize', updateDimensions);

		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	}, []);

	// Calculate bounds based on stations
	const bounds = useCallback(() => {
		if (lines.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100 };

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

		lines.forEach(line => {
			line.stations.forEach(station => {
				minX = Math.min(minX, station.x);
				minY = Math.min(minY, station.y);
				maxX = Math.max(maxX, station.x);
				maxY = Math.max(maxY, station.y);
			});
		});

		// Add padding
		const padding = 20;
		return {
			minX: minX - padding,
			minY: minY - padding,
			maxX: maxX + padding,
			maxY: maxY + padding
		};
	}, [lines]);

	// Create scales based on dimensions and bounds
	const scales = useCallback(() => {
		const { minX, minY, maxX, maxY } = bounds();

		const xScale = d3.scaleLinear()
			.domain([minX, maxX])
			.range([50, dimensions.width - 50]);

		const yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([50, dimensions.height - 50]);

		return { xScale, yScale };
	}, [bounds, dimensions]);

	// Initialize or update zoom behavior
	const initializeZoom = useCallback(() => {
		if (!svgRef.current || !containerRef.current) return;

		// Important: properly clean up any existing behavior first
		if (zoomRef.current) {
			const existingSvg = d3.select(svgRef.current);
			existingSvg.on(".zoom", null);
		}

		const svg = d3.select(svgRef.current);
		const container = d3.select(containerRef.current);

		// Create zoom behavior
		const zoom = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 5])
			.on("zoom", (event) => {
				// Apply transform to the container
				container.attr("transform", event.transform.toString());
			});

		// Store zoom behavior
		zoomRef.current = zoom;

		// Apply zoom behavior to SVG
		svg.call(zoom);

		// Apply initial transform
		svg.call(zoom.transform, d3.zoomIdentity.translate(dimensions.width / 4, dimensions.height / 4).scale(0.9));

		return zoom;
	}, [dimensions]);

	// Zoom handlers
	const zoomIn = useCallback(() => {
		if (!svgRef.current || !zoomRef.current) return;
		const svg = d3.select(svgRef.current);
		const currentTransform = d3.zoomTransform(svg.node() as Element);
		const newScale = Math.min(5, currentTransform.k * 1.2);

		svg.transition().duration(300)
			.call(zoomRef.current.transform, currentTransform.scale(newScale / currentTransform.k));
	}, []);

	const zoomOut = useCallback(() => {
		if (!svgRef.current || !zoomRef.current) return;
		const svg = d3.select(svgRef.current);
		const currentTransform = d3.zoomTransform(svg.node() as Element);
		const newScale = Math.max(0.5, currentTransform.k / 1.2);

		svg.transition().duration(300)
			.call(zoomRef.current.transform, currentTransform.scale(newScale / currentTransform.k));
	}, []);

	const zoomReset = useCallback(() => {
		if (!svgRef.current || !zoomRef.current) return;
		const svg = d3.select(svgRef.current);

		svg.transition().duration(300)
			.call(zoomRef.current.transform, d3.zoomIdentity.translate(dimensions.width / 4, dimensions.height / 4).scale(0.9));
	}, [dimensions]);

	// Expose zoom methods to parent
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset
	}), [zoomIn, zoomOut, zoomReset]);

	// Set up zoom behavior - critical for maintaining zoom after navigation
	useEffect(() => {
		// Initialize zoom when component mounts or remounts
		const zoom = initializeZoom();

		// This is extremely important for proper cleanup
		return () => {
			if (svgRef.current && zoomRef.current) {
				// Explicitly remove all zoom listeners
				d3.select(svgRef.current).on(".zoom", null);
			}
			// Clear the zoom behavior reference
			zoomRef.current = null;
		};
	}, [initializeZoom]);

	// Track the first mount
	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Store station coordinates for external use
	useEffect(() => {
		if (lines.length === 0 || typeof window === 'undefined') return;

		const { xScale, yScale } = scales();
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
	}, [lines, scales]);

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
	const { xScale, yScale } = scales();

	return (
		<div className="h-full w-full">
			<svg
				ref={svgRef}
				className="h-full w-full touch-none"
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
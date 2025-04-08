// src/app/_components/metro/d3/MetroMap.tsx
"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import * as d3 from "d3"
import type { MetroLine, MetroStation } from "../types/metro"

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
	onZoomChange?: (transform: d3.ZoomTransform) => void;
	currentStation?: MetroStation | null; // Add current station for player position
}

export const MetroMap = forwardRef<MetroMapRef, MetroMapProps>(function MetroMap(
	{ lines, isLoading = false, onStationSelect, selectedStation, onZoomChange, currentStation },
	ref
) {
	const svgRef = useRef<SVGSVGElement>(null);
	const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

	// Expose zoom methods to parent component
	useImperativeHandle(ref, () => ({
		zoomIn: () => {
			if (!svgRef.current || !zoomRef.current) return;
			const svg = d3.select(svgRef.current);
			const transform = d3.zoomTransform(svg.node() as any);
			const newScale = Math.min(5, transform.k * 1.2);

			svg.transition().duration(300)
				.call(zoomRef.current.transform, transform.scale(newScale / transform.k));
		},
		zoomOut: () => {
			if (!svgRef.current || !zoomRef.current) return;
			const svg = d3.select(svgRef.current);
			const transform = d3.zoomTransform(svg.node() as any);
			const newScale = Math.max(0.5, transform.k / 1.2);

			svg.transition().duration(300)
				.call(zoomRef.current.transform, transform.scale(newScale / transform.k));
		},
		zoomReset: () => {
			if (!svgRef.current || !zoomRef.current) return;
			d3.select(svgRef.current).transition().duration(300)
				.call(zoomRef.current.transform, d3.zoomIdentity);
		}
	}), []);

	// Setup D3 zoom behavior
	useEffect(() => {
		if (!svgRef.current) return;

		const svg = d3.select(svgRef.current);

		// Create zoom behavior
		zoomRef.current = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 5])
			.on("zoom", (event) => {
				svg.select(".zoom-container").attr("transform", event.transform.toString());
				if (onZoomChange) onZoomChange(event.transform);
			});

		// Apply zoom behavior to SVG
		svg.call(zoomRef.current);

		// Reset to center
		svg.call(zoomRef.current.transform, d3.zoomIdentity);

		// Cleanup
		return () => {
			svg.on(".zoom", null);
		};
	}, [onZoomChange]);

	// Render map visualization
	useEffect(() => {
		if (!svgRef.current || lines.length === 0) return;

		const svg = d3.select(svgRef.current);
		const container = svg.select(".zoom-container");

		// Clear previous elements
		container.selectAll("*").remove();

		// Calculate bounds for proper scaling
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
		const padding = 50;
		minX -= padding;
		minY -= padding;
		maxX += padding;
		maxY += padding;

		// Get actual viewport dimensions
		const width = svgRef.current.clientWidth || 800;
		const height = svgRef.current.clientHeight || 600;

		// Create scales - use full width/height for better visibility
		const xScale = d3.scaleLinear()
			.domain([minX, maxX])
			.range([50, width - 50]); // 50px padding on each side

		const yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([50, height - 50]); // 50px padding on each side

		// Create line generator
		const lineGenerator = d3.line<MetroStation>()
			.x(d => xScale(d.x))
			.y(d => yScale(d.y))
			.curve(d3.curveMonotoneX);

		// Draw each metro line
		lines.forEach(line => {
			// Line path
			if (line.stations.length >= 2) {
				container.append("path")
					.attr("d", lineGenerator(line.stations))
					.attr("stroke", line.color)
					.attr("stroke-width", 6)
					.attr("fill", "none")
					.attr("stroke-linecap", "round");
			}

			// Create stations
			line.stations.forEach(station => {
				const stationGroup = container.append("g")
					.datum(station) // Store station data with the element
					.attr("class", "station")
					.attr("transform", `translate(${xScale(station.x)},${yScale(station.y)})`)
					.style("cursor", "pointer")
					.on("click", (event) => {
						event.stopPropagation();
						if (onStationSelect) onStationSelect(station);
					});

				// Station circle - highlight if selected or current
				const isSelected = selectedStation?.id === station.id;
				const isCurrent = currentStation?.id === station.id;

				stationGroup.append("circle")
					.attr("r", isSelected || isCurrent ? 10 : 8)
					.attr("fill", "var(--background)")
					.attr("stroke", isCurrent ? "#4f46e5" : line.color) // Indigo for current station
					.attr("stroke-width", isSelected || isCurrent ? 4 : 3);

				// If this is the current station, add a "You are here" indicator
				if (isCurrent) {
					stationGroup.append("text")
						.attr("y", -25)
						.attr("text-anchor", "middle")
						.attr("class", "text-xs font-bold fill-indigo-600 dark:fill-indigo-400")
						.text("YOU ARE HERE");
				}

				// Station name
				stationGroup.append("text")
					.attr("x", 0)
					.attr("y", -15)
					.attr("text-anchor", "middle")
					.attr("class", "text-sm font-medium fill-foreground")
					.text(station.name);

				// Station level
				stationGroup.append("text")
					.attr("x", 0)
					.attr("y", 20)
					.attr("text-anchor", "middle")
					.attr("class", "text-xs fill-muted-foreground")
					.text(`Level ${station.level}`);
			});
		});

		// Store station coordinates in a global variable for Player component
		if (typeof window !== 'undefined') {
			window._metroStationCoordinates = {};
			lines.forEach(line => {
				line.stations.forEach(station => {
					window._metroStationCoordinates[station.id] = {
						x: xScale(station.x),
						y: yScale(station.y)
					};
				});
			});
		}

	}, [lines, selectedStation, onStationSelect, currentStation]);

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

	return (
		<div className="h-full w-full">
			<svg
				ref={svgRef}
				className="h-full w-full bg-background touch-none"
				preserveAspectRatio="xMidYMid meet"
			>
				<g className="zoom-container" />
			</svg>
		</div>
	);
});
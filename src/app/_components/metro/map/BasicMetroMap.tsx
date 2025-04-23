// src/app/_components/metro/map/BasicMetroMap.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { BasicLayoutData, BasicNode } from '../engine/layoutEngine';
// --- Import the new Grid component ---
import PolarGridBackground from './PolarGridBackground';

interface BasicMetroMapProps {
	layout: BasicLayoutData;
	className?: string;
}

export default function BasicMetroMap({ layout, className = "" }: BasicMetroMapProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	const [currentZoom, setCurrentZoom] = useState<d3.ZoomTransform>(d3.zoomIdentity);

	// Update dimensions on resize (useEffect remains the same)
	useEffect(() => {
		if (!containerRef.current) return;
		const resizeObserver = new ResizeObserver(entries => {
			if (!entries || entries.length === 0) return;
			const { width, height } = entries[0].contentRect;
			if (width > 0 && height > 0) {
				setDimensions({ width, height });
			}
		});
		resizeObserver.observe(containerRef.current);
		const initialRect = containerRef.current.getBoundingClientRect();
		if (initialRect.width > 0 && initialRect.height > 0) {
			setDimensions({ width: initialRect.width, height: initialRect.height });
		}
		return () => resizeObserver.disconnect();
	}, []);

	// Calculate max radius from bounds for grid
	const maxRadiusForGrid = useMemo(() => {
		const { minX, maxX, minY, maxY } = layout.bounds;
		// Find the largest distance from the origin (0,0) in any direction
		return Math.max(Math.abs(minX), Math.abs(maxX), Math.abs(minY), Math.abs(maxY));
	}, [layout.bounds]);

	// Set up D3 Zoom (useEffect remains largely the same)
	useEffect(() => {
		if (!svgRef.current || !gRef.current || dimensions.width === 0) return;

		const svg = d3.select(svgRef.current);
		const g = d3.select(gRef.current);

		// Determine initial scale to roughly fit the content
		const padding = 50; // Add some padding
		const scaleX = dimensions.width / ((layout.bounds.maxX - layout.bounds.minX) + padding * 2);
		const scaleY = dimensions.height / ((layout.bounds.maxY - layout.bounds.minY) + padding * 2);
		const initialScale = Math.min(scaleX, scaleY, 1); // Don't zoom in initially more than 1x

		// Calculate initial translation to center the content
		const initialTranslateX = dimensions.width / 2 - ((layout.bounds.minX + layout.bounds.maxX) / 2) * initialScale;
		const initialTranslateY = dimensions.height / 2 - ((layout.bounds.minY + layout.bounds.maxY) / 2) * initialScale;

		const initialTransform = d3.zoomIdentity.translate(initialTranslateX, initialTranslateY).scale(initialScale);

		const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 8]) // Adjust scale extent if needed
			// Remove translateExtent for now, it can be tricky to get right initially
			// .translateExtent([[layout.bounds.minX*2, layout.bounds.minY*2], [layout.bounds.maxX*2, layout.bounds.maxY*2]])
			.on("zoom", (event) => {
				setCurrentZoom(event.transform); // Store transform state
				g.attr("transform", event.transform.toString());
			});

		svg.call(zoomBehavior)
			.call(zoomBehavior.transform, initialTransform); // Apply initial transform

		// Store the initial transform
		setCurrentZoom(initialTransform);


		return () => {
			svg.on(".zoom", null);
		};

	}, [layout.bounds, dimensions.width, dimensions.height]); // Rerun on bounds or dimension change

	// --- Basic Rendering ---
	const nodeRadius = 6;

	return (
		<div
			ref={containerRef}
			className={`w-full h-full overflow-hidden bg-muted/10 ${className}`}
		>
			<svg
				ref={svgRef}
				width={dimensions.width}
				height={dimensions.height}
				style={{ cursor: 'grab' }}
				onMouseDown={() => { if (svgRef.current) svgRef.current.style.cursor = 'grabbing'; }}
				onMouseUp={() => { if (svgRef.current) svgRef.current.style.cursor = 'grab'; }}
			>
				{/* Background rect for zoom */}
				<rect width="100%" height="100%" fill="transparent" />
				{/* Apply the currentZoom transform to the group */}
				<g ref={gRef} transform={currentZoom.toString()}>
					{/* --- Render Polar Grid FIRST --- */}
					<PolarGridBackground
						maxRadius={maxRadiusForGrid * 1.1} // Draw grid slightly larger than content
						radiusSteps={5} // Adjust number of circles
						angleSteps={12} // Adjust number of radial lines (e.g., 12 = 30deg steps)
					/>

					{/* Render basic nodes */}
					{layout.nodes.map((node) => (
						<g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
							<circle
								r={nodeRadius}
								fill={node.color}
								stroke="var(--background)"
								strokeWidth={1.5}
							>
								<title>{`${node.name} (Pos: ${node.positionId}, Path: ${node.careerPathId})`}</title>
							</circle>
							<text
								y={-nodeRadius - 4}
								textAnchor="middle"
								fontSize="10px"
								fill="var(--foreground)"
								className="select-none pointer-events-none"
								// Optional: Add a background stroke for readability
								paintOrder="stroke"
								stroke="var(--background)"
								strokeWidth="2px"
								strokeLinejoin="round"
							>
								{node.name}
							</text>
						</g>
					))}
					{/* Lines and connections will be added here later */}
				</g>
			</svg>
		</div>
	);
}
// src/app/_components/metro/map/BasicMetroMap.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { BasicLayoutData, BasicNode } from '../engine/layoutEngine'; // Import from basic engine

interface BasicMetroMapProps {
	layout: BasicLayoutData;
	className?: string;
}

export default function BasicMetroMap({ layout, className = "" }: BasicMetroMapProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null); // Ref for the zoomable group
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	const [currentZoom, setCurrentZoom] = useState<d3.ZoomTransform>(d3.zoomIdentity);

	// Update dimensions on resize
	useEffect(() => {
		if (!containerRef.current) return;
		const resizeObserver = new ResizeObserver(entries => {
			if (!entries || entries.length === 0) return;
			const { width, height } = entries[0].contentRect;
			// Avoid setting 0 dimensions initially
			if (width > 0 && height > 0) {
				setDimensions({ width, height });
			}
		});
		resizeObserver.observe(containerRef.current);
		// Initial size check
		const initialRect = containerRef.current.getBoundingClientRect();
		if (initialRect.width > 0 && initialRect.height > 0) {
			setDimensions({ width: initialRect.width, height: initialRect.height });
		}
		return () => resizeObserver.disconnect();
	}, []);

	// Set up D3 Zoom
	useEffect(() => {
		if (!svgRef.current || !gRef.current) return;

		const svg = d3.select(svgRef.current);
		const g = d3.select(gRef.current);

		const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.3, 5]) // Min/max zoom levels
			.translateExtent([[layout.bounds.minX * 1.5, layout.bounds.minY * 1.5], [layout.bounds.maxX * 1.5, layout.bounds.maxY * 1.5]]) // Pan extent based on layout
			.on("zoom", (event) => {
				g.attr("transform", event.transform.toString());
				setCurrentZoom(event.transform); // Store zoom state if needed elsewhere
			});

		svg.call(zoomBehavior);

		// Optional: Initialize zoom to fit bounds (can be complex, start simple)
		// Example: zoomBehavior.translateTo(svg, 0, 0); // Center at origin

		// Cleanup function
		return () => {
			svg.on(".zoom", null); // Remove zoom listener
		};

	}, [layout.bounds]); // Re-run if layout bounds change

	// --- Basic Rendering ---
	// No complex scales needed yet, as layout engine gives direct coords
	const nodeRadius = 6;

	return (
		<div
			ref={containerRef}
			className={`w-full h-full overflow-hidden bg-muted/10 ${className}`} // Use muted for background
		>
			<svg
				ref={svgRef}
				width={dimensions.width} // Use state for dimensions
				height={dimensions.height}
				// ViewBox is not strictly necessary if we zoom/pan the <g>
				// viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
				style={{ cursor: 'grab' }}
				onMouseDown={() => { if (svgRef.current) svgRef.current.style.cursor = 'grabbing'; }}
				onMouseUp={() => { if (svgRef.current) svgRef.current.style.cursor = 'grab'; }}
			>
				{/* Add a background rect for capturing zoom events */}
				<rect width="100%" height="100%" fill="transparent" />
				<g ref={gRef}>
					{/* Render basic nodes */}
					{layout.nodes.map((node) => (
						<g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
							<circle
								r={nodeRadius}
								fill={node.color}
								stroke="var(--background)" // Use background for stroke contrast
								strokeWidth={1.5}
							>
								<title>{`${node.name} (Pos: ${node.positionId}, Path: ${node.careerPathId})`}</title> {/* Basic tooltip */}
							</circle>
							{/* Simple text label */}
							<text
								y={-nodeRadius - 4} // Position above circle
								textAnchor="middle"
								fontSize="10px"
								fill="var(--foreground)"
								className="select-none pointer-events-none" // Make text non-interactive
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
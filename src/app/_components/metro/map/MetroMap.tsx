// src/app/_components/metro/map/MetroMap.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo, useImperativeHandle } from 'react'; // Added useImperativeHandle
import * as d3 from 'd3';
// *** REMOVE the old hook import ***
// import { useMetroMap } from '../hooks/useMetroMap';
import type { LayoutData, LayoutNode } from '../engine/layoutEngine';
import PolarGridBackground from './PolarGridBackground';

interface MetroMapProps {
	layout: LayoutData | null; // Can be null initially
	selectedNodeId?: string | null;
	onNodeSelect?: (nodeId: string) => void;
	className?: string;
	// Add current/target later
}

// --- Define Ref type ---
export interface MetroMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	zoomReset: () => void;
	centerOnNode: (nodeId: string) => void;
}

// Use React.forwardRef
const MetroMap = React.forwardRef<MetroMapRef, MetroMapProps>(({
	layout,
	selectedNodeId,
	onNodeSelect,
	className = ""
}, ref) => { // Add ref parameter
	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	// Store the zoom behavior instance
	const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
	// Keep track of zoom state internally for potential use
	const [currentZoomState, setCurrentZoomState] = useState<d3.ZoomTransform>(d3.zoomIdentity);

	// --- Update dimensions on resize ---
	useEffect(() => {
		const currentContainer = containerRef.current;
		if (!currentContainer) return;
		let { width, height } = currentContainer.getBoundingClientRect();
		// Ensure initial dimensions are not 0
		width = width > 0 ? width : 800;
		height = height > 0 ? height : 600;
		setDimensions({ width, height });

		const resizeObserver = new ResizeObserver(entries => {
			if (!entries || entries.length === 0) return;
			const { width: newWidth, height: newHeight } = entries[0].contentRect;
			if (newWidth > 0 && newHeight > 0) {
				setDimensions({ width: newWidth, height: newHeight });
			}
		});
		resizeObserver.observe(currentContainer);
		return () => { if (currentContainer) { resizeObserver.unobserve(currentContainer); } resizeObserver.disconnect(); };
	}, []);

	// --- Calculate max radius for grid ---
	const maxRadiusForGrid = useMemo(() => {
		if (!layout?.bounds) return 300;
		const { minX, maxX, minY, maxY } = layout.bounds;
		return Math.max(Math.abs(minX), Math.abs(maxX), Math.abs(minY), Math.abs(maxY), 100);
	}, [layout?.bounds]);

	// --- Set up D3 Zoom ---
	useEffect(() => {
		if (!svgRef.current || !gRef.current || !layout || dimensions.width === 0) return;

		const svg = d3.select(svgRef.current);
		const g = d3.select(gRef.current);

		// Create the zoom behavior
		const newZoomBehavior = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 8])
			.on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
				if (!event.transform) return;
				setCurrentZoomState(event.transform); // Update internal state
				g.attr("transform", event.transform.toString());
			});

		// Store it in the ref
		zoomBehavior.current = newZoomBehavior;
		svg.call(newZoomBehavior);

		// Calculate initial transform only once or when layout/dimensions significantly change
		let initialTransform = d3.zoomIdentity;
		const { minX, maxX, minY, maxY } = layout.bounds;
		const boundsWidth = maxX - minX; const boundsHeight = maxY - minY;
		if (boundsWidth > 0 && boundsHeight > 0) {
			const padding = 50;
			const effectiveWidth = dimensions.width - padding * 2;
			const effectiveHeight = dimensions.height - padding * 2;
			const scaleX = effectiveWidth / boundsWidth;
			const scaleY = effectiveHeight / boundsHeight;
			const initialScale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));
			const initialTranslateX = (dimensions.width / 2) - ((minX + maxX) / 2) * initialScale;
			const initialTranslateY = (dimensions.height / 2) - ((minY + maxY) / 2) * initialScale;
			initialTransform = d3.zoomIdentity.translate(initialTranslateX, initialTranslateY).scale(initialScale);
		} else {
			initialTransform = d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(1);
		}

		// Apply the initial transform
		svg.call(newZoomBehavior.transform, initialTransform);
		setCurrentZoomState(initialTransform); // Set initial state

		return () => { svg.on(".zoom", null); zoomBehavior.current = null; }; // Cleanup

	}, [layout, dimensions.width, dimensions.height]); // Depend on layout and dimensions

	// --- Imperative Handle for Controls ---
	useImperativeHandle(ref, () => ({
		zoomIn: () => {
			if (svgRef.current && zoomBehavior.current) {
				d3.select(svgRef.current).transition().call(zoomBehavior.current.scaleBy, 1.2);
			}
		},
		zoomOut: () => {
			if (svgRef.current && zoomBehavior.current) {
				d3.select(svgRef.current).transition().call(zoomBehavior.current.scaleBy, 1 / 1.2);
			}
		},
		zoomReset: () => {
			if (svgRef.current && zoomBehavior.current && layout) {
				// Recalculate initial transform to reset view
				let initialTransform = d3.zoomIdentity;
				const { minX, maxX, minY, maxY } = layout.bounds;
				const boundsWidth = maxX - minX; const boundsHeight = maxY - minY;
				if (boundsWidth > 0 && boundsHeight > 0) {
					const padding = 50;
					const effectiveWidth = dimensions.width - padding * 2;
					const effectiveHeight = dimensions.height - padding * 2;
					const scaleX = effectiveWidth / boundsWidth;
					const scaleY = effectiveHeight / boundsHeight;
					const initialScale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));
					const initialTranslateX = (dimensions.width / 2) - ((minX + maxX) / 2) * initialScale;
					const initialTranslateY = (dimensions.height / 2) - ((minY + maxY) / 2) * initialScale;
					initialTransform = d3.zoomIdentity.translate(initialTranslateX, initialTranslateY).scale(initialScale);
				} else {
					initialTransform = d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(1);
				}
				d3.select(svgRef.current)
					.transition()
					.duration(500) // Smooth transition
					.call(zoomBehavior.current.transform, initialTransform);
			}
		},
		centerOnNode: (nodeId: string) => {
			if (!svgRef.current || !zoomBehavior.current || !layout?.nodesById || !layout.nodesById[nodeId]) return;

			const node = layout.nodesById[nodeId];
			const targetX = node.x;
			const targetY = node.y;
			const currentScale = currentZoomState.k; // Use the stored scale

			// Calculate the translation needed to center the node
			const targetTranslateX = dimensions.width / 2 - targetX * currentScale;
			const targetTranslateY = dimensions.height / 2 - targetY * currentScale;

			const newTransform = d3.zoomIdentity.translate(targetTranslateX, targetTranslateY).scale(currentScale);

			d3.select(svgRef.current)
				.transition()
				.duration(500) // Smooth transition
				.call(zoomBehavior.current.transform, newTransform);
		}
	}), [layout, dimensions, currentZoomState]); // Add dependencies for functions using them

	// --- Rendering Logic ---
	const nodeRadius = 7;
	const interchangeRadius = 9;
	const selectedStrokeWidth = 3;
	const normalStrokeWidth = 1.5;

	const handleNodeClick = (nodeId: string) => {
		if (onNodeSelect) {
			onNodeSelect(nodeId);
		}
	};

	return (
		<div ref={containerRef} className={`w-full h-full overflow-hidden ${className}`}>
			<svg
				ref={svgRef}
				width={dimensions.width}
				height={dimensions.height}
				className="block"
				style={{ cursor: 'grab', background: 'transparent' }}
				onMouseDown={(e) => { e.currentTarget.style.cursor = 'grabbing'; }}
				onMouseUp={(e) => { e.currentTarget.style.cursor = 'grab'; }}
				onMouseLeave={(e) => { e.currentTarget.style.cursor = 'grab'; }}
			>
				<rect width="100%" height="100%" fill="none" pointerEvents="all" />
				{/* Use internal zoom state for transform */}
				<g ref={gRef} transform={currentZoomState.toString()}>
					{/* Render Polar Grid */}
					{layout && (
						<PolarGridBackground
							maxRadius={maxRadiusForGrid * 1.05}
							radiusSteps={Math.max(3, Math.round(maxRadiusForGrid / (layout.configUsed?.radiusStep || 80)))}
							angleSteps={12}
							opacity={0.15}
							radiusColor="var(--foreground)"
							angleColor="var(--foreground)"
						/>
					)}

					{/* Render nodes */}
					{layout?.nodes?.map((node) => {
						const isSelected = node.id === selectedNodeId;
						const currentRadius = node.isInterchange ? interchangeRadius : nodeRadius;
						const currentStrokeWidth = isSelected ? selectedStrokeWidth : normalStrokeWidth;

						return (
							<g
								key={node.id}
								transform={`translate(${node.x}, ${node.y})`}
								onClick={() => handleNodeClick(node.id)}
								style={{ cursor: 'pointer' }}
								className={isSelected ? 'node-selected' : 'node-normal'}
							>
								<circle
									r={isSelected ? currentRadius + 1 : currentRadius}
									fill={node.color || 'grey'}
									strokeWidth={currentStrokeWidth}
									stroke={isSelected ? "var(--primary)" : "var(--background)"}
									className={node.isInterchange ? 'interchange-node stroke-foreground/50' : 'stroke-foreground/30'}
									style={{ transition: 'r 0.15s ease-out, stroke 0.15s ease-out' }}
								>
									<title>{`${node.name} (L${node.level})${node.isInterchange ? ' [Interchange]' : ''}\nID: ${node.id}`}</title>
								</circle>
								<text
									y={-currentRadius - 5}
									textAnchor="middle"
									fontSize="9px"
									fill={isSelected ? "var(--primary)" : "var(--foreground)"}
									className="select-none pointer-events-none font-medium"
									paintOrder="stroke"
									stroke="var(--background)"
									strokeWidth="2.5px"
									strokeLinejoin="round"
									style={{ transition: 'fill 0.15s ease-out' }}
								>
									{node.name}
								</text>
							</g>
						);
					})}
				</g>
			</svg>
		</div>
	);
}); // End of forwardRef

// Add display name for DevTools
MetroMap.displayName = 'MetroMap';

export default MetroMap;
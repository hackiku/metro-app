// src/app/_components/metro/map/MetroMap.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import type { LayoutData, LayoutNode } from '../engine/types';
import PolarGridBackground from './PolarGridBackground';
import MetroLine from './MetroLine';
import MetroStation from './MetroStation';

interface MetroMapProps {
	layout: LayoutData | null;
	selectedNodeId?: string | null;
	onNodeSelect?: (nodeId: string) => void;
	currentNodeId?: string | null;
	targetNodeId?: string | null;
	className?: string;
}

// Define Ref type for imperative controls
export interface MetroMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	zoomReset: () => void;
	centerOnNode: (nodeId: string) => void;
}

// Use React.forwardRef for imperative handle
const MetroMap = React.forwardRef<MetroMapRef, MetroMapProps>(({
	layout,
	selectedNodeId,
	onNodeSelect,
	currentNodeId,
	targetNodeId,
	className = ""
}, ref) => {
	// Refs for SVG elements
	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// State for dimensions and zoom
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
	const [currentZoomState, setCurrentZoomState] = useState<d3.ZoomTransform>(d3.zoomIdentity);

	// --- Update dimensions on resize ---
	useEffect(() => {
		const currentContainer = containerRef.current;
		if (!currentContainer) return;

		// Get initial dimensions
		let { width, height } = currentContainer.getBoundingClientRect();
		width = width > 0 ? width : 800;
		height = height > 0 ? height : 600;
		setDimensions({ width, height });

		// Set up ResizeObserver for responsive sizing
		const resizeObserver = new ResizeObserver(entries => {
			if (!entries || entries.length === 0) return;
			const { width: newWidth, height: newHeight } = entries[0].contentRect;
			if (newWidth > 0 && newHeight > 0) {
				setDimensions({ width: newWidth, height: newHeight });
			}
		});

		resizeObserver.observe(currentContainer);

		// Cleanup on unmount
		return () => {
			if (currentContainer) {
				resizeObserver.unobserve(currentContainer);
			}
			resizeObserver.disconnect();
		};
	}, []);

	// --- Calculate max radius for polar grid ---
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
			.scaleExtent([0.1, 8]) // Min/max zoom scale
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
		const boundsWidth = maxX - minX;
		const boundsHeight = maxY - minY;

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

		// Cleanup
		return () => {
			svg.on(".zoom", null);
			zoomBehavior.current = null;
		};

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
				const boundsWidth = maxX - minX;
				const boundsHeight = maxY - minY;

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

	// --- Organize nodes by path ---
	const nodesByPath = useMemo(() => {
		if (!layout) return new Map<string, LayoutNode[]>();

		const result = new Map<string, LayoutNode[]>();

		// Group nodes by career path
		layout.paths.forEach(path => {
			const pathNodes: LayoutNode[] = [];

			// Collect nodes for this path
			path.nodes.forEach(nodeId => {
				const node = layout.nodesById[nodeId];
				if (node) {
					pathNodes.push(node);
				}
			});

			result.set(path.id, pathNodes);
		});

		return result;
	}, [layout]);

	// --- Handle node selection ---
	const handleNodeClick = (nodeId: string) => {
		if (onNodeSelect) {
			onNodeSelect(nodeId);
		}
	};

	// --- Rendering parameters ---
	const nodeRadius = 7;
	const interchangeRadius = 9;
	const lineWidth = 5;

	// --- Render ---
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

				{/* Main content group with zoom transform */}
				<g ref={gRef} transform={currentZoomState.toString()}>
					{/* Render Polar Grid */}
					{layout && (
						<PolarGridBackground
							maxRadius={maxRadiusForGrid * 1.05}
							radiusSteps={Math.max(3, Math.round(maxRadiusForGrid / (layout.configUsed.radiusStep || 80)))}
							angleSteps={12}
							opacity={0.15}
							radiusColor="var(--foreground)"
							angleColor="var(--foreground)"
						/>
					)}

					{/* Render metro lines first (below stations) */}
					{layout?.paths.map(path => {
						const pathNodes = nodesByPath.get(path.id) || [];
						const isPathSelected = selectedNodeId ?
							pathNodes.some(node => node.id === selectedNodeId) :
							false;

						return (
							<MetroLine
								key={`line-${path.id}`}
								path={path}
								nodes={pathNodes}
								isSelected={isPathSelected}
								lineWidth={lineWidth}
								opacity={0.7}
							/>
						);
					})}

					{/* Render stations on top of lines */}
					{layout?.nodes.map(node => (
						<MetroStation
							key={`station-${node.id}`}
							node={node}
							isSelected={node.id === selectedNodeId}
							isCurrent={node.id === currentNodeId}
							isTarget={node.id === targetNodeId}
							onClick={handleNodeClick}
							baseRadius={nodeRadius}
							interchangeRadius={interchangeRadius}
						/>
					))}
				</g>
			</svg>
		</div>
	);
});

// Add display name for DevTools
MetroMap.displayName = 'MetroMap';

export default MetroMap;
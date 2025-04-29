// src/app/_components/metro/map/MetroMap.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import type { LayoutData, LayoutNode } from '../engine/types';
import MetroGrid from './MetroGrid';
import MetroLine from './MetroLine';
import MetroStation from './MetroStation';
import type { RouteMode } from '../engine/manhattanRoute';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface MetroMapProps {
	layout: LayoutData | null;
	selectedNodeId?: string | null;
	onNodeSelect?: (nodeId: string) => void;
	currentNodeId?: string | null;
	targetNodeId?: string | null;
	onSetTarget?: (nodeId: string) => void;
	onRemoveTarget?: (nodeId: string) => void;
	className?: string;
	showControls?: boolean;
	routeMode?: RouteMode;
}

// Define Ref type for imperative controls
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
	className = "",
	showControls = false,
	routeMode = 'manhattan'
}, ref) => {
	// Refs for elements
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const contentRef = useRef<SVGGElement>(null);

	// State for dimensions and basic zoom/pan
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [showGrid, setShowGrid] = useState(process.env.NODE_ENV === 'development');

	// --- Expose methods via ref ---
	useImperativeHandle(ref, () => ({
		zoomIn: () => {
			setTransform(prev => ({
				...prev,
				scale: Math.min(prev.scale * 1.2, 5) // Limit max zoom
			}));
		},
		zoomOut: () => {
			setTransform(prev => ({
				...prev,
				scale: Math.max(prev.scale / 1.2, 0.1) // Limit min zoom
			}));
		},
		zoomReset: () => {
			if (!layout || !containerRef.current) return;

			const { bounds } = layout;
			const { width, height } = dimensions;
			const { minX, maxX, minY, maxY } = bounds;

			const boundsWidth = maxX - minX;
			const boundsHeight = maxY - minY;

			if (boundsWidth <= 0 || boundsHeight <= 0) return;

			const padding = 50;
			const effectiveWidth = width - padding * 2;
			const effectiveHeight = height - padding * 2;

			// Calculate scale to fit content
			const scaleX = effectiveWidth / boundsWidth;
			const scaleY = effectiveHeight / boundsHeight;
			const scale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));

			// Calculate translation to center content
			const x = (width / 2) - ((minX + maxX) / 2) * scale;
			const y = (height / 2) - ((minY + maxY) / 2) * scale;

			setTransform({ x, y, scale });
		},
		centerOnNode: (nodeId: string) => {
			if (!layout?.nodesById || !layout.nodesById[nodeId]) return;

			const node = layout.nodesById[nodeId];
			const { width, height } = dimensions;
			const { scale } = transform;

			// Calculate translation to center on node
			const x = width / 2 - node.x * scale;
			const y = height / 2 - node.y * scale;

			setTransform(prev => ({ ...prev, x, y }));
		}
	}), [layout, dimensions, transform]);

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

	// --- Calculate initial zoom transform when layout changes ---
	useEffect(() => {
		if (!layout || !containerRef.current) return;

		const { bounds } = layout;
		const { width, height } = dimensions;
		const { minX, maxX, minY, maxY } = bounds;

		const boundsWidth = maxX - minX;
		const boundsHeight = maxY - minY;

		if (boundsWidth <= 0 || boundsHeight <= 0) return;

		const padding = 50;
		const effectiveWidth = width - padding * 2;
		const effectiveHeight = height - padding * 2;

		// Calculate scale to fit content in viewport
		const scaleX = effectiveWidth / boundsWidth;
		const scaleY = effectiveHeight / boundsHeight;
		const scale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));

		// Calculate translation to center content
		const x = (width / 2) - ((minX + maxX) / 2) * scale;
		const y = (height / 2) - ((minY + maxY) / 2) * scale;

		setTransform({ x, y, scale });
	}, [layout, dimensions]);

	// --- Pan/zoom handlers ---
	const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
		if (e.button !== 0) return; // Only left mouse button
		setIsDragging(true);
		setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
		e.currentTarget.style.cursor = 'grabbing';
	};

	const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
		if (!isDragging) return;
		const newX = e.clientX - dragStart.x;
		const newY = e.clientY - dragStart.y;
		setTransform(prev => ({ ...prev, x: newX, y: newY }));
	};

	const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
		setIsDragging(false);
		e.currentTarget.style.cursor = 'grab';
	};

	const handleMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
		if (isDragging) {
			setIsDragging(false);
			e.currentTarget.style.cursor = 'grab';
		}
	};

	const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
		e.preventDefault();

		// Determine zoom direction
		const delta = e.deltaY < 0 ? 1.1 : 0.9;
		const newScale = transform.scale * delta;

		// Limit scale range
		const scale = Math.max(0.1, Math.min(newScale, 5));

		// Zoom towards cursor position
		const rect = svgRef.current?.getBoundingClientRect();
		if (!rect) return;

		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Calculate new position to zoom toward cursor
		const x = mouseX - (mouseX - transform.x) * (scale / transform.scale);
		const y = mouseY - (mouseY - transform.y) * (scale / transform.scale);

		setTransform({ x, y, scale });
	};

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
		<div
			ref={containerRef}
			className={`w-full h-full overflow-hidden relative ${className}`}
		>
			<svg
				ref={svgRef}
				width={dimensions.width}
				height={dimensions.height}
				className="block"
				style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				onWheel={handleWheel}
			>
				<rect width="100%" height="100%" fill="none" pointerEvents="all" />

				{/* Main content group with transform */}
				<g
					ref={contentRef}
					transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
				>
					{/* Optional grid - shown under everything */}
					{showGrid && layout && (
						<MetroGrid
							layout={layout}
							showNodeIds={true}
							opacity={0.25}
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
								opacity={0.75}
								routeMode={routeMode}
								cornerRadius={0}
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
							onSetTarget={onSetTarget}
							onRemoveTarget={onRemoveTarget}
							baseRadius={nodeRadius}
							interchangeRadius={interchangeRadius}
						/>
					))}
				</g>
			</svg>

			{/* Controls */}
			{showControls && (
				<div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
					<Button
						variant="outline"
						size="icon"
						className="bg-background/80 backdrop-blur hover:bg-background/90"
						onClick={() => setShowGrid(prev => !prev)}
						title={showGrid ? "Hide Grid" : "Show Grid"}
					>
						<div className="w-4 h-4 grid grid-cols-2 gap-0.5">
							<div className={`w-full h-full ${showGrid ? 'bg-primary' : 'border border-foreground/40'}`}></div>
							<div className={`w-full h-full ${showGrid ? 'bg-primary' : 'border border-foreground/40'}`}></div>
							<div className={`w-full h-full ${showGrid ? 'bg-primary' : 'border border-foreground/40'}`}></div>
							<div className={`w-full h-full ${showGrid ? 'bg-primary' : 'border border-foreground/40'}`}></div>
						</div>
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="bg-background/80 backdrop-blur hover:bg-background/90"
						onClick={() => zoomIn()}
						title="Zoom In"
					>
						<ZoomIn className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="bg-background/80 backdrop-blur hover:bg-background/90"
						onClick={() => zoomOut()}
						title="Zoom Out"
					>
						<ZoomOut className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="bg-background/80 backdrop-blur hover:bg-background/90"
						onClick={() => zoomReset()}
						title="Reset View"
					>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
});

// Add display name for DevTools
MetroMap.displayName = 'MetroMap';

export default MetroMap;
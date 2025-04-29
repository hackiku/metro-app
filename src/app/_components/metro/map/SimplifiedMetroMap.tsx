// src/app/_components/metro/map/SimplifiedMetroMap.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { LayoutData, LayoutNode } from '../engine/types';
import MetroGrid from './MetroGrid';
import type { RouteMode } from '../engine/manhattanRoute';
import { generatePath } from '../engine/manhattanRoute';

interface MetroMapProps {
	layout: LayoutData | null;
	selectedNodeId?: string | null;
	onNodeSelect?: (nodeId: string) => void;
	currentNodeId?: string | null;
	targetNodeId?: string | null;
	className?: string;
	showDebugGrid?: boolean;
	routeMode?: RouteMode;
	cornerRadius?: number;
}

export default function SimplifiedMetroMap({
	layout,
	selectedNodeId,
	onNodeSelect,
	currentNodeId,
	targetNodeId,
	className = "",
	showDebugGrid = false,
	routeMode = 'manhattan',
	cornerRadius = 0
}: MetroMapProps) {
	// Refs for elements
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const contentRef = useRef<SVGGElement>(null);

	// State for dimensions and basic zoom/pan
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

	// --- Simplified pan/zoom handlers ---
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

	// --- Utility functions for public methods ---
	const zoomIn = () => {
		setTransform(prev => {
			const newScale = prev.scale * 1.2;
			return {
				...prev,
				scale: Math.min(newScale, 5)
			};
		});
	};

	const zoomOut = () => {
		setTransform(prev => {
			const newScale = prev.scale / 1.2;
			return {
				...prev,
				scale: Math.max(newScale, 0.1)
			};
		});
	};

	const zoomReset = () => {
		if (!layout) return;

		const { bounds } = layout;
		const { width, height } = dimensions;
		const { minX, maxX, minY, maxY } = bounds;

		const boundsWidth = maxX - minX;
		const boundsHeight = maxY - minY;

		const padding = 50;
		const effectiveWidth = width - padding * 2;
		const effectiveHeight = height - padding * 2;

		const scaleX = effectiveWidth / boundsWidth;
		const scaleY = effectiveHeight / boundsHeight;
		const scale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));

		const x = (width / 2) - ((minX + maxX) / 2) * scale;
		const y = (height / 2) - ((minY + maxY) / 2) * scale;

		setTransform({ x, y, scale });
	};

	const centerOnNode = (nodeId: string) => {
		if (!layout?.nodesById || !layout.nodesById[nodeId]) return;

		const node = layout.nodesById[nodeId];
		const { width, height } = dimensions;

		// Keep current scale but center on node
		const x = width / 2 - node.x * transform.scale;
		const y = height / 2 - node.y * transform.scale;

		setTransform(prev => ({ ...prev, x, y }));
	};

	// --- Rendering parameters ---
	const nodeRadius = 7;
	const interchangeRadius = 9;
	const lineWidth = 5;

	// --- Expose methods to parent component ---
	// You can add this back if needed using useImperativeHandle and forwardRef

	// --- Render ---
	return (
		<div
			ref={containerRef}
			className={`w-full h-full overflow-hidden ${className}`}
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
					{/* Optional Debug Grid */}
					{showDebugGrid && layout && (
						<MetroGrid
							layout={layout}
							showNodeIds={true}
							opacity={0.2}
						/>
					)}

					{/* Render metro lines first (below stations) */}
					{layout?.paths.map(path => {
						const pathNodes = nodesByPath.get(path.id) || [];
						const isPathSelected = selectedNodeId ?
							pathNodes.some(node => node.id === selectedNodeId) :
							false;

						if (pathNodes.length < 2) return null;

						// Generate path data
						const pathData = generatePath(
							pathNodes,
							routeMode,
							{
								cornerRadius,
								verticalFirst: true,
								minSegmentLength: 10,
								levelPriority: true
							}
						);

						return (
							<path
								key={`line-${path.id}`}
								d={pathData}
								stroke={path.color}
								strokeWidth={lineWidth * (isPathSelected ? 1.4 : 1)}
								strokeLinecap="round"
								strokeLinejoin="round"
								fill="none"
								opacity={isPathSelected ? 1 : 0.7}
								className="metro-line transition-all duration-300"
								data-path-id={path.id}
							/>
						);
					})}

					{/* Render stations on top of lines */}
					{layout?.nodes.map(node => {
						// Determine appropriate radius
						const radius = node.isInterchange ? interchangeRadius : nodeRadius;
						const isSelected = node.id === selectedNodeId;
						const isCurrent = node.id === currentNodeId;
						const isTarget = node.id === targetNodeId;

						// Apply selected/current/target adjustments
						const adjustedRadius = isSelected ? radius + 1 : radius;

						// Determine stroke colors and widths
						const strokeWidth = isSelected ? 3 : 1.5;
						let strokeColor = "var(--background)";

						if (isSelected) strokeColor = "var(--primary)";
						if (isCurrent) strokeColor = "#4f46e5"; // Indigo
						if (isTarget) strokeColor = "#f59e0b";  // Amber

						return (
							<g
								key={`station-${node.id}`}
								transform={`translate(${node.x}, ${node.y})`}
								onClick={() => handleNodeClick(node.id)}
								style={{ cursor: 'pointer' }}
								className={`metro-station ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''} ${isTarget ? 'target' : ''}`}
								data-node-id={node.id}
							>
								{/* Station Circle */}
								<circle
									r={adjustedRadius}
									fill={node.color}
									strokeWidth={strokeWidth}
									stroke={strokeColor}
									className={node.isInterchange ? 'interchange-node' : ''}
									style={{ transition: 'r 0.15s ease-out, stroke 0.15s ease-out' }}
								>
									<title>{`${node.name} (Level ${node.level})${node.isInterchange ? ' [Interchange]' : ''}`}</title>
								</circle>

								{/* Station Label */}
								<text
									y={-adjustedRadius - 5}
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

			{/* Simple zoom controls (optional) */}
			<div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
				<button
					className="p-2 bg-background/80 rounded-full shadow hover:bg-background"
					onClick={zoomIn}
				>
					+
				</button>
				<button
					className="p-2 bg-background/80 rounded-full shadow hover:bg-background"
					onClick={zoomOut}
				>
					-
				</button>
				<button
					className="p-2 bg-background/80 rounded-full shadow hover:bg-background"
					onClick={zoomReset}
				>
					↺
				</button>
			</div>
		</div>
	);
}
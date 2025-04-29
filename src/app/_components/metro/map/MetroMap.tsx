// src/app/_components/metro/map/MetroMap.tsx
"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { LayoutData } from '../engine/types';
import MetroGrid from './MetroGrid';
import MetroLine from './MetroLine';
import MetroStation from './MetroStation';

interface MetroMapProps {
	layout: LayoutData | null;
	selectedNodeId?: string | null;
	onNodeSelect?: (nodeId: string) => void;
	currentNodeId?: string | null;
	targetNodeId?: string | null;
	onSetTarget?: (nodeId: string) => void;
	onRemoveTarget?: (nodeId: string) => void;
	className?: string;
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
	className = ""
}, ref) => {
	// Refs for container elements
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	// State for viewport and interaction
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [showGrid, setShowGrid] = useState(process.env.NODE_ENV === 'development');

	// --- Basic zoom and pan functions ---
	const zoomIn = () => {
		setTransform(prev => ({
			...prev,
			scale: Math.min(prev.scale * 1.2, 5)
		}));
	};

	const zoomOut = () => {
		setTransform(prev => ({
			...prev,
			scale: Math.max(prev.scale / 1.2, 0.1)
		}));
	};

	const zoomReset = () => {
		if (!layout || !containerRef.current) return;

		const { bounds } = layout;
		const { width, height } = dimensions;
		const { minX, maxX, minY, maxY } = bounds;

		// Calculate scale to fit content
		const boundsWidth = maxX - minX;
		const boundsHeight = maxY - minY;

		if (boundsWidth <= 0 || boundsHeight <= 0) return;

		const padding = 50;
		const effectiveWidth = width - padding * 2;
		const effectiveHeight = height - padding * 2;

		const scaleX = effectiveWidth / boundsWidth;
		const scaleY = effectiveHeight / boundsHeight;
		const scale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));

		// Calculate translation to center content
		const x = (width / 2) - ((minX + maxX) / 2) * scale;
		const y = (height / 2) - ((minY + maxY) / 2) * scale;

		setTransform({ x, y, scale });
	};

	const centerOnNode = (nodeId: string) => {
		if (!layout?.nodesById || !layout.nodesById[nodeId]) return;

		const node = layout.nodesById[nodeId];
		const { width, height } = dimensions;
		const { scale } = transform;

		// Calculate translation to center on node
		const x = width / 2 - node.x * scale;
		const y = height / 2 - node.y * scale;

		setTransform(prev => ({ ...prev, x, y }));
	};

	// Expose imperative handle for external control
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnNode
	}), [layout, dimensions, transform]);

	// Update dimensions on resize
	useEffect(() => {
		const currentContainer = containerRef.current;
		if (!currentContainer) return;

		const updateDimensions = () => {
			const { width, height } = currentContainer.getBoundingClientRect();
			if (width > 0 && height > 0) {
				setDimensions({ width, height });
			}
		};

		// Initial size
		updateDimensions();

		// Listen for resize
		const resizeObserver = new ResizeObserver(updateDimensions);
		resizeObserver.observe(currentContainer);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	// Initialize transform when layout changes
	useEffect(() => {
		if (layout) {
			zoomReset();
		}
	}, [layout, dimensions]);

	// Basic pan handlers
	const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
		if (e.button !== 0) return;
		setIsDragging(true);
		setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
	};

	const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
		if (!isDragging) return;
		const newX = e.clientX - dragStart.x;
		const newY = e.clientY - dragStart.y;
		setTransform(prev => ({ ...prev, x: newX, y: newY }));
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleMouseLeave = () => {
		setIsDragging(false);
	};

	// Handle wheel zoom
	const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
		e.preventDefault();
		const delta = e.deltaY < 0 ? 1.1 : 0.9;
		const newScale = transform.scale * delta;
		const scale = Math.max(0.1, Math.min(newScale, 5));

		// Zoom toward cursor position
		const rect = svgRef.current?.getBoundingClientRect();
		if (!rect) return;

		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const x = mouseX - (mouseX - transform.x) * (scale / transform.scale);
		const y = mouseY - (mouseY - transform.y) * (scale / transform.scale);

		setTransform({ x, y, scale });
	};

	// If no layout, show placeholder
	if (!layout) {
		return (
			<div className={`w-full h-full flex items-center justify-center ${className}`}>
				<div className="text-muted-foreground">No map data available</div>
			</div>
		);
	}

	return (
		<div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
			<svg
				ref={svgRef}
				width={dimensions.width}
				height={dimensions.height}
				className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				onWheel={handleWheel}
			>
				{/* Main transform group */}
				<g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
					{/* Optional debug grid */}
					{showGrid && <MetroGrid layout={layout} />}

					{/* Path lines */}
					{layout.paths.map(path => {
						const pathNodes = layout.nodes.filter(node => node.careerPathId === path.id);
						return (
							<MetroLine
								key={path.id}
								path={path}
								nodes={pathNodes}
								lineWidth={4}
								opacity={0.8}
							/>
						);
					})}

					{/* Stations */}
					{layout.nodes.map(node => (
						<MetroStation
							key={node.id}
							node={node}
							isSelected={node.id === selectedNodeId}
							isCurrent={node.id === currentNodeId}
							isTarget={node.id === targetNodeId}
							onClick={onNodeSelect ? () => onNodeSelect(node.id) : undefined}
							onSetTarget={onSetTarget ? () => onSetTarget(node.id) : undefined}
							onRemoveTarget={onRemoveTarget ? () => onRemoveTarget(node.id) : undefined}
						/>
					))}
				</g>
			</svg>
		</div>
	);
});

MetroMap.displayName = 'MetroMap';

export default MetroMap;
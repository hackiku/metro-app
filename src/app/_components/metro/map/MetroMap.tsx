// src/app/_components/metro/map/MetroMap.tsx
"use client";

import React, { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import type { LayoutData, LayoutNode } from '../engine/types';
import PolarGrid from './PolarGrid';
import MetroLine from './MetroLine';
import MetroStation from './MetroStation';
import ZoomControls from '../ui/ZoomControls';
import { useMetroMapInteraction } from '../hooks/useMetroMapInteraction';

interface MetroMapProps {
	layout: LayoutData;
	selectedNodeId?: string | null;
	onNodeSelect?: (nodeId: string | null) => void;
	currentNodeId?: string | null;
	targetNodeId?: string | null;
	onSetTarget?: (nodeId: string) => void;
	onRemoveTarget?: (nodeId?: string) => void;
	showGrid?: boolean;
	onToggleGrid?: () => void;
	className?: string;
}

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
	showGrid = false,
	onToggleGrid,
	className = ""
}, ref) => {
	const containerRef = useRef<HTMLDivElement>(null);

	// Use our interaction hook for all zoom and drag functionality
	const [{ dimensions, transform, isDragging, svgRef }, {
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnNode,
		handleMouseDown,
		handleMouseMove,
		handleMouseUpOrLeave,
		handleBackgroundClick
	}] = useMetroMapInteraction({ layout, containerRef });

	// Group nodes by path for easier rendering
	const nodesByPath = useMemo(() => {
		const result = new Map<string, LayoutNode[]>();

		if (!layout) return result;

		layout.paths.forEach(path => {
			const pathNodes = path.nodes
				.map(nodeId => layout.nodesById[nodeId])
				.filter((node): node is LayoutNode => !!node);
			result.set(path.id, pathNodes);
		});

		return result;
	}, [layout]);

	// Calculate the maximum radius for the polar grid
	const maxRadius = useMemo(() => {
		if (!layout?.nodes.length) return 500;

		let maxDist = 0;
		layout.nodes.forEach(node => {
			const dist = Math.sqrt(node.x * node.x + node.y * node.y);
			maxDist = Math.max(maxDist, dist);
		});

		// Add some padding
		return Math.ceil(maxDist * 1.2 / 100) * 100;
	}, [layout]);

	// Expose methods via ref
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnNode
	}), [zoomIn, zoomOut, zoomReset, centerOnNode]);

	// Enhanced background click handler that also handles node deselection
	const handleBackgroundClickWithDeselect = (e: React.MouseEvent<SVGSVGElement>) => {
		handleBackgroundClick(e);

		// If the click target is the SVG background itself (or the container group)
		// and not initiated from a drag, deselect node
		if (!isDragging &&
			(e.target === svgRef.current || e.target === svgRef.current?.firstElementChild) &&
			onNodeSelect) {
			onNodeSelect(null);
		}
	};

	return (
		<div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
			{/* ZoomControls Component */}
			<div className="absolute left-4 top-4 z-10">
				<ZoomControls
					onZoomIn={zoomIn}
					onZoomOut={zoomOut}
					onZoomReset={zoomReset}
					showGrid={showGrid}
					onToggleGrid={onToggleGrid}
					currentZoom={transform.scale}
				/>
			</div>

			<svg
				ref={svgRef}
				width={dimensions.width}
				height={dimensions.height}
				className={`block w-full h-full bg-background`}
				style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUpOrLeave}
				onMouseLeave={handleMouseUpOrLeave}
				onClick={handleBackgroundClickWithDeselect}
			>
				{/* Main transform group */}
				<g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
					{/* PolarGrid - simpler with only one grid type */}
					{showGrid && layout.configUsed && (
						<PolarGrid
							config={layout.configUsed}
							maxRadius={maxRadius}
							showLabels={true}
							opacity={0.15}
						/>
					)}

					{/* Path lines */}
					{layout.paths.map(path => {
						const pathNodes = nodesByPath.get(path.id) || [];
						const isPathSelected = selectedNodeId ?
							pathNodes.some(node => node.id === selectedNodeId) :
							false;

						return (
							<MetroLine
								key={`line-${path.id}`}
								path={path}
								nodes={pathNodes}
								lineWidth={5}
								opacity={0.75}
							/>
						);
					})}

					{/* Stations */}
					{layout.nodes.map(node => (
						<MetroStation
							key={`station-${node.id}`}
							node={node}
							isSelected={node.id === selectedNodeId}
							isCurrent={node.id === currentNodeId}
							isTarget={node.id === targetNodeId}
							onClick={onNodeSelect ? () => onNodeSelect(node.id) : undefined}
							onSetTarget={onSetTarget}
							onRemoveTarget={onRemoveTarget}
						/>
					))}
				</g>
			</svg>
		</div>
	);
});

MetroMap.displayName = 'MetroMap';

export default MetroMap;
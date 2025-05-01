// src/app/_components/metro/map/MetroMap.tsx
"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import type { LayoutData, LayoutNode } from '../engine/types';
import MetroGrid from './MetroGrid';
import PolarGrid from './PolarGrid';
import MetroLine from './MetroLine';
import MetroStation from './MetroStation';

interface MetroMapProps {
	layout: LayoutData;
	selectedNodeId?: string | null;
	onNodeSelect?: (nodeId: string | null) => void;
	currentNodeId?: string | null;
	targetNodeId?: string | null;
	onSetTarget?: (nodeId: string) => void;
	onRemoveTarget?: (nodeId?: string) => void;
	showGrid?: boolean;
	gridType?: 'rectangular' | 'polar' | 'both';
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
	gridType = 'polar',
	className = ""
}, ref) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
	const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

	// Calculate the maximum radius used in the layout for the polar grid
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

	const zoom = (factor: number, center?: { x: number, y: number }) => {
		const newScale = transform.scale * factor;
		const scale = Math.max(0.1, Math.min(newScale, 8));

		let x = transform.x;
		let y = transform.y;

		if (center) {
			x = center.x - (center.x - transform.x) * (scale / transform.scale);
			y = center.y - (center.y - transform.y) * (scale / transform.scale);
		} else {
			const centerX = dimensions.width / 2;
			const centerY = dimensions.height / 2;
			x = centerX - (centerX - transform.x) * (scale / transform.scale);
			y = centerY - (centerY - transform.y) * (scale / transform.scale);
		}

		setTransform({ x, y, scale });
	}

	const zoomIn = () => zoom(1.2);
	const zoomOut = () => zoom(1 / 1.2);

	const zoomReset = () => {
		if (!layout || !containerRef.current) return;
		const { bounds } = layout;
		const { width, height } = dimensions;
		const { minX, maxX, minY, maxY } = bounds;
		const boundsWidth = maxX - minX;
		const boundsHeight = maxY - minY;

		if (boundsWidth <= 0 || boundsHeight <= 0) {
			setTransform({ x: width / 2, y: height / 2, scale: 1 });
			return;
		};

		const padding = 50;
		const effectiveWidth = Math.max(1, width - padding * 2);
		const effectiveHeight = Math.max(1, height - padding * 2);
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
		const currentScale = transform.scale;
		const x = width / 2 - node.x * currentScale;
		const y = height / 2 - node.y * currentScale;
		setTransform(prev => ({ ...prev, x, y }));
	};

	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnNode
	}), [layout, dimensions, transform]);

	useEffect(() => {
		const currentContainer = containerRef.current;
		if (!currentContainer) return;
		const updateDimensions = () => {
			const { width, height } = currentContainer.getBoundingClientRect();
			if (width > 0 && height > 0) {
				setDimensions({ width, height });
			}
		};
		const resizeObserver = new ResizeObserver(updateDimensions);
		resizeObserver.observe(currentContainer);
		updateDimensions();
		return () => { resizeObserver.disconnect(); };
	}, []);

	useEffect(() => {
		zoomReset();
	}, [layout, dimensions.width, dimensions.height]);

	const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
		// Allow panning only if not clicking directly on a station or button
		let targetElement = e.target as Element;
		// Traverse up if needed (e.g., clicking text inside station group)
		while (targetElement && targetElement !== svgRef.current) {
			if (targetElement.classList.contains('metro-station')) {
				return; // Don't start drag on station click
			}
			targetElement = targetElement.parentElement as Element;
		}

		// Only allow pan with main button
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

	const handleMouseUpOrLeave = () => {
		if (isDragging) { // Only reset if we were actually dragging
			setIsDragging(false);
		}
	};

	const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
		e.preventDefault();
		const rect = svgRef.current?.getBoundingClientRect();
		if (!rect) return;
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
		zoom(factor, { x: mouseX, y: mouseY });
	};

	const handleBackgroundClick = (e: React.MouseEvent<SVGSVGElement>) => {
		// If the click target is the SVG background itself (or the container group)
		// and not initiated from a drag, deselect node
		if (!isDragging &&
			(e.target === svgRef.current || e.target === svgRef.current?.firstElementChild) &&
			onNodeSelect) {
			onNodeSelect(null);
		}
		// Reset dragging state just in case mouseup didn't fire correctly
		if (isDragging) setIsDragging(false);
	}

	// Handle clicking on a station node
	const handleNodeClick = (nodeId: string) => {
		if (onNodeSelect) {
			onNodeClick(nodeId);
		}
	};

	// Handle setting a target node
	const handleSetTarget = (nodeId: string) => {
		if (onSetTarget) {
			onSetTarget(nodeId);
		}
	};

	// Handle removing a target
	const handleRemoveTarget = (nodeId?: string) => {
		if (onRemoveTarget) {
			onRemoveTarget(nodeId);
		}
	};

	return (
		<div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
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
				onWheel={handleWheel}
				onClick={handleBackgroundClick}
			>
				{/* Main transform group */}
				<g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
					{/* Optional debug grids */}
					{showGrid && (
						<>
							{(gridType === 'rectangular' || gridType === 'both') && (
								<MetroGrid layout={layout} opacity={0.1} />
							)}
							{(gridType === 'polar' || gridType === 'both') && layout.configUsed && (
								<PolarGrid
									config={layout.configUsed}
									maxRadius={maxRadius}
									showLabels={true}
								/>
							)}
						</>
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
								isSelected={isPathSelected}
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
							onSetTarget={onSetTarget ? handleSetTarget : undefined}
							onRemoveTarget={onRemoveTarget ? handleRemoveTarget : undefined}
						/>
					))}
				</g>
			</svg>
		</div>
	);
});

MetroMap.displayName = 'MetroMap';

export default MetroMap;
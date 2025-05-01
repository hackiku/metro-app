// src/app/_components/metro/konva/KonvaMetroMap.tsx
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { useMetroMap } from '~/contexts/MetroMapContext';
import { KonvaMetroLine } from './KonvaMetroLine';
import { KonvaMetroStation } from './KonvaMetroStation';
import { KonvaGrid } from './KonvaGrid';
import type { LayoutData } from '~/types/engine';
import KonvaZoomControls from '../ui/KonvaZoomControls';

interface KonvaMetroMapProps {
	layout: LayoutData;
	width?: number;
	height?: number;
	className?: string;
}

export default function KonvaMetroMap({
	layout,
	width = 800,
	height = 600,
	className = ''
}: KonvaMetroMapProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<any>(null);
	const [dimensions, setDimensions] = useState({ width, height });

	const {
		viewport,
		setViewport,
		zoomIn,
		zoomOut,
		resetView,
		selectedNodeId,
		setSelectedNodeId,
		currentNodeId,
		targetNodeId,
		showGrid,
		toggleGrid
	} = useMetroMap();

	// Handle container resize
	useEffect(() => {
		if (!containerRef.current) return;

		const updateSize = () => {
			if (containerRef.current) {
				const { clientWidth, clientHeight } = containerRef.current;
				setDimensions({
					width: clientWidth,
					height: clientHeight
				});
			}
		};

		const observer = new ResizeObserver(updateSize);
		observer.observe(containerRef.current);
		updateSize();

		return () => {
			if (containerRef.current) {
				observer.unobserve(containerRef.current);
			}
			observer.disconnect();
		};
	}, []);

	// Center the map on initial render
	useEffect(() => {
		if (!layout || !stageRef.current) return;

		const { bounds } = layout;
		const { width, height } = dimensions;
		const { minX, maxX, minY, maxY } = bounds;
		const boundsWidth = maxX - minX;
		const boundsHeight = maxY - minY;

		// Skip if layout bounds are invalid
		if (boundsWidth <= 0 || boundsHeight <= 0) return;

		const padding = 50;
		const effectiveWidth = Math.max(1, width - padding * 2);
		const effectiveHeight = Math.max(1, height - padding * 2);
		const scaleX = effectiveWidth / boundsWidth;
		const scaleY = effectiveHeight / boundsHeight;
		const scale = Math.max(0.1, Math.min(scaleX, scaleY, 1.5));

		const x = (width / 2) - ((minX + maxX) / 2) * scale;
		const y = (height / 2) - ((minY + maxY) / 2) * scale;

		setViewport({ x, y, scale });
	}, [layout, dimensions, setViewport]);

	// Handle wheel events for zooming
	const handleWheel = (e: any) => {
		e.evt.preventDefault();

		const stage = stageRef.current;
		if (!stage) return;

		const oldScale = viewport.scale;
		const pointer = stage.getPointerPosition();
		const mousePointTo = {
			x: (pointer.x - viewport.x) / oldScale,
			y: (pointer.y - viewport.y) / oldScale,
		};

		// Calculate new scale
		const newScale = e.evt.deltaY < 0
			? Math.min(oldScale * 1.1, 5)
			: Math.max(oldScale / 1.1, 0.1);

		// Calculate new position to zoom toward cursor
		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};

		setViewport({
			scale: newScale,
			x: newPos.x,
			y: newPos.y,
		});
	};

	// Add a class to the container for easier reference
	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.classList.add('konva-container');
		}
	}, []);

	// Render paths and stations from layout data
	const renderPaths = () => {
		return layout.paths.map(path => {
			const pathNodes = path.nodes
				.map(nodeId => layout.nodesById[nodeId])
				.filter(Boolean);

			return (
				<KonvaMetroLine
					key={`path-${path.id}`}
					path={path}
					nodes={pathNodes}
					isSelected={selectedNodeId ? pathNodes.some(node => node.id === selectedNodeId) : false}
				/>
			);
		});
	};

	const renderStations = () => {
		return layout.nodes.map(node => (
			<KonvaMetroStation
				key={`station-${node.id}`}
				node={node}
				isSelected={node.id === selectedNodeId}
				isCurrent={node.id === currentNodeId}
				isTarget={node.id === targetNodeId}
				onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
			/>
		));
	};

	return (
		<div
			ref={containerRef}
			className={`relative w-full h-full overflow-hidden ${className}`}
		>
			{/* Zoom Controls */}
			<div className="absolute left-4 top-4 z-10">
				<KonvaZoomControls />
			</div>

			<Stage
				ref={stageRef}
				width={dimensions.width}
				height={dimensions.height}
				onWheel={handleWheel}
				draggable
				onDragEnd={(e) => {
					setViewport(prev => ({
						...prev,
						x: e.currentTarget.x(),
						y: e.currentTarget.y()
					}));
				}}
			>
				<Layer>
					<Group
						x={viewport.x}
						y={viewport.y}
						scaleX={viewport.scale}
						scaleY={viewport.scale}
					>
						{/* Optional grid */}
						{showGrid && layout.configUsed && (
							<KonvaGrid
								config={layout.configUsed}
								bounds={layout.bounds}
								opacity={0.15}
							/>
						)}

						{/* Path lines */}
						{renderPaths()}

						{/* Station nodes */}
						{renderStations()}
					</Group>
				</Layer>
			</Stage>
		</div>
	);
}
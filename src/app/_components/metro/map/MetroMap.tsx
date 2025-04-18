// src/app/_components/metro/map/MetroMap.tsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useLayout } from '../hooks/useLayout';
import { useZoom } from '../hooks/useZoom';
import MetroLine from './MetroLine';
import MetroStation from './MetroStation';
import MetroConnection from './MetroConnection';
import StationOverlay from './components/StationOverlay';
import type { CareerPath } from '~/types/career';
import type { MetroNode } from '~/types/metro';

interface MetroMapProps {
	careerPaths: CareerPath[];
	transitions: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[];
	currentRoleId?: string | null;
	targetRoleId?: string | null;
	selectedRoleId?: string | null;
	onSelectRole?: (roleId: string) => void;
	onSetCurrentRole?: (roleId: string) => void;
	onSetTargetRole?: (roleId: string) => void;
	onViewDetails?: (roleId: string) => void;
	className?: string;
	debug?: boolean;
}

export interface MetroMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	zoomReset: () => void;
	centerOnRole: (roleId: string) => void;
}

const MetroMap = React.forwardRef<MetroMapRef, MetroMapProps>(({
	careerPaths,
	transitions,
	currentRoleId,
	targetRoleId,
	selectedRoleId,
	onSelectRole,
	onSetCurrentRole,
	onSetTargetRole,
	onViewDetails,
	className = "",
	debug = false
}, ref) => {
	// References
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	// State
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

	// Get layout data (optimized positions)
	const { lines, connections } = useLayout(careerPaths, transitions);

	// Create all nodes list for connections
	const allNodes = lines.flatMap(line => line.nodes);

	// Setup zoom
	const { transform, zoomIn, zoomOut, zoomReset, centerOn, zoomLevel } = useZoom(svgRef, {
		minZoom: 0.5,
		maxZoom: 8
	});

	// Create scales
	const [xScale, yScale] = useMemo(() => {
		// Find min/max values from all nodes
		const xExtent = d3.extent(allNodes, d => d.x) as [number, number];
		const yExtent = d3.extent(allNodes, d => d.y) as [number, number];

		// Add some padding
		const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
		const yPadding = (yExtent[1] - yExtent[0]) * 0.1;

		// Create scales
		const xScale = d3.scaleLinear()
			.domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
			.range([0, dimensions.width]);

		const yScale = d3.scaleLinear()
			.domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
			.range([0, dimensions.height]);

		return [xScale, yScale];
	}, [allNodes, dimensions]);

	// Update dimensions when container resizes
	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver(entries => {
			const { width, height } = entries[0].contentRect;
			setDimensions({ width, height });
		});

		resizeObserver.observe(containerRef.current);

		return () => resizeObserver.disconnect();
	}, []);

	// Function to center on a role
	const centerOnRole = (roleId: string) => {
		const node = allNodes.find(n => n.id === roleId);
		if (!node) return;

		centerOn(xScale(node.x), yScale(node.y));
	};

	// Expose controls via ref
	React.useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnRole
	}));

	// Get node positions for overlay
	const nodePositions = useMemo(() => {
		const positions = new Map();
		allNodes.forEach(node => {
			positions.set(node.id, {
				x: xScale(node.x),
				y: yScale(node.y),
				name: node.name
			});
		});
		return positions;
	}, [allNodes, xScale, yScale]);

	return (
		<div
			ref={containerRef}
			className={`w-full h-full overflow-hidden ${className}`}
		>
			<svg
				ref={svgRef}
				width="100%"
				height="100%"
				viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
				className="metro-map"
			>
				<g transform={transform.toString()}>
					{/* Draw connections first (bottom layer) */}
					{connections.map(connection => (
						<MetroConnection
							key={`${connection.fromId}-${connection.toId}`}
							connection={connection}
							nodes={allNodes}
							scales={{ xScale, yScale }}
							isHighlighted={
								selectedRoleId ?
									(connection.fromId === selectedRoleId || connection.toId === selectedRoleId) :
									false
							}
						/>
					))}

					{/* Draw lines next */}
					{lines.map(line => (
						<MetroLine
							key={line.id}
							line={line}
							scales={{ xScale, yScale }}
							isSelected={
								selectedRoleId ?
									line.nodes.some(n => n.id === selectedRoleId) :
									false
							}
						/>
					))}

					{/* Draw stations on top */}
					{lines.map(line =>
						line.nodes.map(node => (
							<MetroStation
								key={node.id}
								node={node}
								scales={{ xScale, yScale }}
								lineColor={line.color}
								isInterchange={node.isInterchange}
								isSelected={node.id === selectedRoleId}
								isCurrent={node.id === currentRoleId}
								isTarget={node.id === targetRoleId}
								onClick={onSelectRole}
							/>
						))
					)}
				</g>
			</svg>

			{/* Station menu overlay */}
			<StationOverlay
				selectedNodeId={selectedRoleId}
				nodePositions={nodePositions}
				careerPaths={careerPaths}
				currentRoleId={currentRoleId}
				targetRoleId={targetRoleId}
				onSetCurrent={onSetCurrentRole || (() => { })}
				onSetTarget={onSetTargetRole || (() => { })}
				onViewDetails={onViewDetails || (() => { })}
				svgRef={svgRef}
			/>

			{/* Debug information overlay */}
			{debug && (
				<div className="absolute bottom-4 left-4 bg-background/80 rounded p-2 text-xs text-muted-foreground">
					<div>Paths: {careerPaths.length}</div>
					<div>Roles: {careerPaths.reduce((sum, p) => sum + p.roles.length, 0)}</div>
					<div>Transitions: {transitions.length}</div>
					<div>Zoom: {Math.round(zoomLevel * 100)}%</div>
				</div>
			)}
		</div>
	);
});

export default MetroMap;
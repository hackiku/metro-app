"use client"

// src/app/_components/metro/map/AlgoMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useCareer } from '~/contexts/CareerContext';
import { useUser } from '~/contexts/UserContext';
import { MetroGeometry } from '../geometry/MetroGeometry';
import type { MetroNode, MetroPath, MetroConnection } from '../geometry/types';
import ZoomControls from '../ui/controls/ZoomControls';

interface AlgoMapProps {
	debug?: boolean;
}

export default function AlgoMap({ debug = false }: AlgoMapProps) {
	// Get data from contexts
	const { careerPaths, transitions, loading, error } = useCareer();
	const { user } = useUser();

	// State for visualization
	const [viewBox, setViewBox] = useState('0 0 300 600');
	const [metroPaths, setMetroPaths] = useState<MetroPath[]>([]);
	const [connections, setConnections] = useState<MetroConnection[]>([]);
	const [transform, setTransform] = useState('scale(1)');
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

	// Refs
	const svgRef = useRef<SVGSVGElement>(null);
	const geometryRef = useRef<MetroGeometry | null>(null);

	// Initialize geometry engine
	useEffect(() => {
		geometryRef.current = new MetroGeometry({
			levelSpacing: 180,
			pathSpacing: 140,
			interchangeRadius: 14,
			junctionOffset: 20,
			padding: 80
		});
	}, []);

	// Process career data when it changes
	useEffect(() => {
		if (!loading && careerPaths.length > 0 && geometryRef.current) {
			// Convert career data to metro visualization data
			const transformedData = transformCareerData(careerPaths, transitions);

			// Calculate layout
			const { paths, viewBox: newViewBox } = geometryRef.current.calculateLayout(transformedData.paths);

			// Update state
			setMetroPaths(paths);
			setConnections(transformedData.connections);
			setViewBox(newViewBox);
		}
	}, [careerPaths, transitions, loading]);

	// Transform career data to metro visualization format
	function transformCareerData(
		careerPaths: any[],
		transitions: any[]
	): { paths: MetroPath[], connections: MetroConnection[] } {
		const metroPaths: MetroPath[] = careerPaths.map(path => ({
			id: path.id,
			color: path.color,
			nodes: path.roles.map(role => ({
				id: role.id,
				level: role.level,
				pathIds: [path.id],
				position: { x: 0, y: 0 }, // Initial position, will be calculated by layout engine
				isInterchange: false // Will be determined during layout
			}))
		}));

		// Identify interchange nodes (roles that appear in multiple paths)
		const nodeMap = new Map<string, string[]>();

		metroPaths.forEach(path => {
			path.nodes.forEach(node => {
				if (!nodeMap.has(node.id)) {
					nodeMap.set(node.id, [path.id]);
				} else {
					nodeMap.get(node.id)?.push(path.id);
				}
			});
		});

		// Update pathIds for interchange nodes
		metroPaths.forEach(path => {
			path.nodes.forEach(node => {
				const pathIds = nodeMap.get(node.id);
				if (pathIds && pathIds.length > 1) {
					node.pathIds = pathIds;
				}
			});
		});

		// Transform transitions to connections
		const metroConnections: MetroConnection[] = transitions.map(t => ({
			fromId: t.fromRoleId,
			toId: t.toRoleId,
			isRecommended: t.isRecommended,
			pathId: getPathIdForRole(t.fromRoleId, metroPaths) || ''
		}));

		return { paths: metroPaths, connections: metroConnections };
	}

	// Helper to find path ID for a role
	function getPathIdForRole(roleId: string, paths: MetroPath[]): string | undefined {
		for (const path of paths) {
			if (path.nodes.some(node => node.id === roleId)) {
				return path.id;
			}
		}
		return undefined;
	}

	// Find a node by ID
	function findNodeById(id: string): { node: MetroNode, path: MetroPath } | undefined {
		for (const path of metroPaths) {
			const node = path.nodes.find(n => n.id === id);
			if (node) {
				return { node, path };
			}
		}
		return undefined;
	}

	// Handle node click
	function handleNodeClick(nodeId: string) {
		setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
	}

	// Zoom controls
	function handleZoomIn() {
		setTransform(prev => {
			const scale = parseFloat(prev.match(/scale\(([^)]+)\)/)?.[1] || '1');
			return `scale(${Math.min(scale * 1.2, 5)})`;
		});
	}

	function handleZoomOut() {
		setTransform(prev => {
			const scale = parseFloat(prev.match(/scale\(([^)]+)\)/)?.[1] || '1');
			return `scale(${Math.max(scale / 1.2, 0.5)})`;
		});
	}

	function handleZoomReset() {
		setTransform('scale(1)');
	}

	// Render loading or error state
	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="flex flex-col items-center">
					<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
					<p className="mt-4 text-muted-foreground">Loading map data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<p className="text-lg font-semibold text-destructive">{error}</p>
					<button
						className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
						onClick={() => window.location.reload()}
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="relative h-full w-full overflow-hidden">
			<svg
				ref={svgRef}
				className="h-full w-full"
				viewBox={viewBox}
				preserveAspectRatio="xMidYMid meet"
			>
				<g transform={transform}>
					{/* Debug grid */}
					{debug && (
						<>
							{/* Horizontal grid lines */}
							{Array.from({ length: 10 }).map((_, i) => (
								<line
									key={`h-${i}`}
									x1="0"
									y1={i * 100}
									x2="2000"
									y2={i * 100}
									stroke="rgba(100, 100, 100, 0.1)"
									strokeWidth="1"
									strokeDasharray="4 4"
								/>
							))}

							{/* Vertical grid lines */}
							{Array.from({ length: 20 }).map((_, i) => (
								<line
									key={`v-${i}`}
									x1={i * 100}
									y1="0"
									x2={i * 100}
									y2="1000"
									stroke="rgba(100, 100, 100, 0.1)"
									strokeWidth="1"
									strokeDasharray="4 4"
								/>
							))}
						</>
					)}

					{/* Metro paths (lines) */}
					{metroPaths.map(path => {
						if (!path.nodes.length || !geometryRef.current) return null;

						const pathData = geometryRef.current.generatePathData(path.nodes, true);
						return (
							<path
								key={`path-${path.id}`}
								d={pathData}
								stroke={path.color}
								strokeWidth="8"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								opacity={selectedNodeId ? 0.6 : 1}
								className="transition-opacity duration-300"
							/>
						);
					})}

					{/* Connections between nodes */}
					{connections.map(conn => {
						const fromNode = findNodeById(conn.fromId)?.node;
						const toNode = findNodeById(conn.toId)?.node;

						if (!fromNode || !toNode || !geometryRef.current) return null;

						const pathData = geometryRef.current.generateConnectionPath(fromNode, toNode);
						return (
							<path
								key={`conn-${conn.fromId}-${conn.toId}`}
								d={pathData}
								stroke={conn.isRecommended ? '#22c55e' : '#9ca3af'}
								strokeWidth="3"
								fill="none"
								strokeDasharray={conn.isRecommended ? 'none' : '5,5'}
								opacity={
									selectedNodeId && (selectedNodeId === conn.fromId || selectedNodeId === conn.toId)
										? 1
										: 0.5
								}
								className="transition-opacity duration-300"
							/>
						);
					})}

					{/* Nodes (stations) */}
					{metroPaths.map(path =>
						path.nodes.map(node => {
							const isSelected = node.id === selectedNodeId;
							const isUserCurrent = node.id === user?.currentRoleId;
							const isUserTarget = node.id === user?.targetRoleId;

							// Determine node style
							let fillColor = 'var(--background)';
							let strokeColor = path.color;
							let strokeWidth = 2;
							let nodeRadius = node.isInterchange ? 14 : 12;

							if (isSelected) {
								strokeWidth = 4;
								nodeRadius += 2;
							}

							if (isUserCurrent) {
								strokeColor = '#4f46e5'; // Indigo
								strokeWidth = 3;
							} else if (isUserTarget) {
								strokeColor = '#f59e0b'; // Amber
								strokeWidth = 3;
							}

							return (
								<g key={`node-${node.id}`} onClick={() => handleNodeClick(node.id)}>
									{/* Node shape */}
									{node.isInterchange ? (
										<rect
											x={node.position.x - nodeRadius}
											y={node.position.y - nodeRadius}
											width={nodeRadius * 2}
											height={nodeRadius * 2}
											rx={4}
											fill={fillColor}
											stroke={strokeColor}
											strokeWidth={strokeWidth}
											className="cursor-pointer transition-all duration-200"
										/>
									) : (
										<circle
											cx={node.position.x}
											cy={node.position.y}
											r={nodeRadius}
											fill={fillColor}
											stroke={strokeColor}
											strokeWidth={strokeWidth}
											className="cursor-pointer transition-all duration-200"
										/>
									)}

									{/* Node label - to be filled with actual role names */}
									{isSelected && (
										<text
											x={node.position.x}
											y={node.position.y - nodeRadius - 10}
											textAnchor="middle"
											fill="var(--foreground)"
											fontSize="14"
											fontWeight="500"
											className="pointer-events-none"
										>
											{node.id.substring(0, 8)}
										</text>
									)}

									{/* Role level */}
									<text
										x={node.position.x}
										y={node.position.y + nodeRadius + 20}
										textAnchor="middle"
										fill="var(--muted-foreground)"
										fontSize="12"
										className="pointer-events-none"
									>
										Level {node.level}
									</text>
								</g>
							);
						})
					)}
				</g>
			</svg>

			{/* Zoom controls */}
			<div className="absolute bottom-6 right-6 z-10">
				<ZoomControls
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					onReset={handleZoomReset}
				/>
			</div>

			{/* Debug info */}
			{debug && (
				<div className="absolute bottom-4 left-4 bg-background/80 p-2 text-xs text-muted-foreground rounded">
					<div>Paths: {metroPaths.length}</div>
					<div>Nodes: {metroPaths.reduce((sum, p) => sum + p.nodes.length, 0)}</div>
					<div>Connections: {connections.length}</div>
				</div>
			)}
		</div>
	);
}
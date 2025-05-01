// src/app/_components/metro/tests/TestGridLayout.tsx
"use client";

import React, { useState } from 'react';
import { generateGridLayout } from '../engine/gridLayoutEngine';
import MetroMap from '../map/MetroMap';
import MetroGrid from '../map/MetroGrid';
import { Button } from '~/components/ui/button';
import { Slider } from '~/components/ui/slider';
import type { CareerPath, Position, PositionDetail } from '~/types/compass';
import type { GridLayoutConfig } from '../engine/types';

// Mock data for testing
const TEST_CAREER_PATHS: CareerPath[] = [
	{
		id: "path-1",
		organization_id: "org-1",
		name: "Engineering",
		color: "#3B82F6", // blue-500
		created_at: new Date().toISOString()
	},
	{
		id: "path-2",
		organization_id: "org-1",
		name: "Design",
		color: "#EC4899", // pink-500
		created_at: new Date().toISOString()
	},
	{
		id: "path-3",
		organization_id: "org-1",
		name: "Product",
		color: "#10B981", // emerald-500
		created_at: new Date().toISOString()
	},
	{
		id: "path-4",
		organization_id: "org-1",
		name: "Management",
		color: "#F59E0B", // amber-500
		created_at: new Date().toISOString()
	}
];

// Generic positions that exist across paths
const TEST_POSITIONS: Position[] = [
	// Engineering positions
	{ id: "pos-e1", organization_id: "org-1", name: "Junior Engineer", created_at: new Date().toISOString() },
	{ id: "pos-e2", organization_id: "org-1", name: "Software Engineer", created_at: new Date().toISOString() },
	{ id: "pos-e3", organization_id: "org-1", name: "Senior Engineer", created_at: new Date().toISOString() },
	{ id: "pos-e4", organization_id: "org-1", name: "Staff Engineer", created_at: new Date().toISOString() },
	{ id: "pos-e5", organization_id: "org-1", name: "Principal Engineer", created_at: new Date().toISOString() },

	// Design positions
	{ id: "pos-d1", organization_id: "org-1", name: "Junior Designer", created_at: new Date().toISOString() },
	{ id: "pos-d2", organization_id: "org-1", name: "Designer", created_at: new Date().toISOString() },
	{ id: "pos-d3", organization_id: "org-1", name: "Senior Designer", created_at: new Date().toISOString() },
	{ id: "pos-d4", organization_id: "org-1", name: "Staff Designer", created_at: new Date().toISOString() },

	// Product positions
	{ id: "pos-p1", organization_id: "org-1", name: "Associate PM", created_at: new Date().toISOString() },
	{ id: "pos-p2", organization_id: "org-1", name: "Product Manager", created_at: new Date().toISOString() },
	{ id: "pos-p3", organization_id: "org-1", name: "Senior PM", created_at: new Date().toISOString() },

	// Management positions
	{ id: "pos-m1", organization_id: "org-1", name: "Team Lead", created_at: new Date().toISOString() },
	{ id: "pos-m2", organization_id: "org-1", name: "Engineering Manager", created_at: new Date().toISOString() },
	{ id: "pos-m3", organization_id: "org-1", name: "Director", created_at: new Date().toISOString() },
	{ id: "pos-m4", organization_id: "org-1", name: "VP", created_at: new Date().toISOString() },
	{ id: "pos-m5", organization_id: "org-1", name: "CTO", created_at: new Date().toISOString() },

	// Interchange positions (appear in multiple paths)
	{ id: "pos-i1", organization_id: "org-1", name: "Tech Lead", created_at: new Date().toISOString() },
	{ id: "pos-i2", organization_id: "org-1", name: "Product Designer", created_at: new Date().toISOString() },
	{ id: "pos-i3", organization_id: "org-1", name: "Engineering Director", created_at: new Date().toISOString() }
];

// Position details mapping positions to paths with levels
const generateTestPositionDetails = (): PositionDetail[] => {
	let id = 1;
	const details: PositionDetail[] = [];

	// Engineering Path
	details.push(
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-e1", career_path_id: "path-1", level: 1, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-e2", career_path_id: "path-1", level: 3, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-i1", career_path_id: "path-1", level: 4, created_at: new Date().toISOString() }, // Tech Lead (interchange)
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-e3", career_path_id: "path-1", level: 5, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-e4", career_path_id: "path-1", level: 7, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-e5", career_path_id: "path-1", level: 9, created_at: new Date().toISOString() }
	);

	// Design Path
	details.push(
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-d1", career_path_id: "path-2", level: 1, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-d2", career_path_id: "path-2", level: 3, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-i2", career_path_id: "path-2", level: 4, created_at: new Date().toISOString() }, // Product Designer (interchange)
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-d3", career_path_id: "path-2", level: 5, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-d4", career_path_id: "path-2", level: 7, created_at: new Date().toISOString() }
	);

	// Product Path
	details.push(
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-p1", career_path_id: "path-3", level: 2, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-i2", career_path_id: "path-3", level: 4, created_at: new Date().toISOString() }, // Product Designer (interchange)
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-p2", career_path_id: "path-3", level: 5, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-p3", career_path_id: "path-3", level: 7, created_at: new Date().toISOString() }
	);

	// Management Path
	details.push(
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-m1", career_path_id: "path-4", level: 3, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-i1", career_path_id: "path-4", level: 4, created_at: new Date().toISOString() }, // Tech Lead (interchange)
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-m2", career_path_id: "path-4", level: 5, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-i3", career_path_id: "path-4", level: 7, created_at: new Date().toISOString() }, // Engineering Director (interchange)
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-m3", career_path_id: "path-4", level: 7, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-m4", career_path_id: "path-4", level: 8, created_at: new Date().toISOString() },
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-m5", career_path_id: "path-4", level: 10, created_at: new Date().toISOString() }
	);

	// Engineering Director also in Engineering path
	details.push(
		{ id: `detail-${id++}`, organization_id: "org-1", position_id: "pos-i3", career_path_id: "path-1", level: 8, created_at: new Date().toISOString() }
	);

	return details;
};

const TEST_POSITION_DETAILS = generateTestPositionDetails();

export default function TestGridLayout() {
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [config, setConfig] = useState<GridLayoutConfig>({
		cellWidth: 120,
		cellHeight: 80,
		xPadding: 50,
		yPadding: 60,
		levelMultiplier: 1.2,
		domainSpread: 1.8,
		centerWeight: 0.7,
		routingMode: 'manhattan'
	});

	// Generate layout with current config
	const layout = generateGridLayout(
		TEST_CAREER_PATHS,
		TEST_POSITION_DETAILS,
		TEST_POSITIONS,
		config
	);

	// Handle node selection
	const handleNodeSelect = (nodeId: string) => {
		setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
	};

	// Event handlers for config changes
	const handleSliderChange = (name: keyof GridLayoutConfig, value: number[]) => {
		setConfig(prev => ({ ...prev, [name]: value[0] }));
	};

	const handleRouteChange = (mode: 'direct' | 'manhattan' | 'smooth') => {
		setConfig(prev => ({ ...prev, routingMode: mode }));
	};

	// Extract info about selected node
	const selectedNode = selectedNodeId ? layout.nodesById[selectedNodeId] : null;
	const selectedPosition = selectedNode
		? TEST_POSITIONS.find(p => p.id === selectedNode.positionId)
		: null;

	return (
		<div className="flex h-screen">
			{/* Main visualization area */}
			<div className="flex-1 h-full relative">
				{/* Replace PolarGridBackground with MetroGrid */}
				<div className="absolute inset-0">
					<MetroMap
						layout={layout}
						selectedNodeId={selectedNodeId}
						onNodeSelect={handleNodeSelect}
						className="bg-background"
					>
						{/* Add MetroGrid as a child component */}
						{layout && (
							<MetroGrid
								bounds={layout.bounds}
								cellSize={50}
								opacity={0.15}
								showAxis={true}
							/>
						)}
					</MetroMap>
				</div>
			</div>

			{/* Control panel */}
			<div className="w-80 h-full bg-card border-l border-border p-4 overflow-y-auto">
				<h2 className="text-xl font-bold mb-4">Dr. Manhattan Test Grid</h2>

				{/* Selected node info */}
				{selectedNode && (
					<div className="mb-6 p-3 border rounded-md bg-card">
						<h3 className="font-medium">Selected Node</h3>
						<p><span className="text-muted-foreground">Position:</span> {selectedPosition?.name}</p>
						<p><span className="text-muted-foreground">Level:</span> {selectedNode.level}</p>
						<p><span className="text-muted-foreground">Path:</span> {TEST_CAREER_PATHS.find(p => p.id === selectedNode.careerPathId)?.name}</p>
						<p><span className="text-muted-foreground">Coordinates:</span> ({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)})</p>
						{selectedNode.isInterchange && (
							<div className="mt-2">
								<p className="text-sm font-medium">Interchange with:</p>
								<ul className="text-sm">
									{selectedNode.relatedPaths?.filter(id => id !== selectedNode.careerPathId).map(pathId => (
										<li key={pathId} className="ml-2">• {TEST_CAREER_PATHS.find(p => p.id === pathId)?.name}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}

				<div className="space-y-6">
					{/* Layout controls */}
					<div>
						<h3 className="font-medium mb-2">Layout Configuration</h3>

						<div className="space-y-4">
							<div>
								<label className="text-sm text-muted-foreground">Cell Width: {config.cellWidth}</label>
								<Slider
									value={[config.cellWidth]}
									min={60}
									max={200}
									step={10}
									onValueChange={(val) => handleSliderChange('cellWidth', val)}
									className="my-2"
								/>
							</div>

							<div>
								<label className="text-sm text-muted-foreground">Cell Height: {config.cellHeight}</label>
								<Slider
									value={[config.cellHeight]}
									min={40}
									max={160}
									step={10}
									onValueChange={(val) => handleSliderChange('cellHeight', val)}
									className="my-2"
								/>
							</div>

							<div>
								<label className="text-sm text-muted-foreground">Level Multiplier: {config.levelMultiplier.toFixed(1)}</label>
								<Slider
									value={[config.levelMultiplier]}
									min={0.5}
									max={2.5}
									step={0.1}
									onValueChange={(val) => handleSliderChange('levelMultiplier', val)}
									className="my-2"
								/>
							</div>

							<div>
								<label className="text-sm text-muted-foreground">Domain Spread: {config.domainSpread.toFixed(1)}</label>
								<Slider
									value={[config.domainSpread]}
									min={1.0}
									max={3.0}
									step={0.1}
									onValueChange={(val) => handleSliderChange('domainSpread', val)}
									className="my-2"
								/>
							</div>

							<div>
								<label className="text-sm text-muted-foreground">Center Weight: {config.centerWeight.toFixed(1)}</label>
								<Slider
									value={[config.centerWeight]}
									min={0}
									max={1}
									step={0.1}
									onValueChange={(val) => handleSliderChange('centerWeight', val)}
									className="my-2"
								/>
							</div>
						</div>
					</div>

					{/* Routing mode selection */}
					<div>
						<h3 className="font-medium mb-2">Path Routing</h3>
						<div className="flex space-x-2">
							<Button
								size="sm"
								variant={config.routingMode === 'manhattan' ? 'default' : 'outline'}
								onClick={() => handleRouteChange('manhattan')}
							>
								Manhattan
							</Button>
							<Button
								size="sm"
								variant={config.routingMode === 'smooth' ? 'default' : 'outline'}
								onClick={() => handleRouteChange('smooth')}
							>
								Smooth
							</Button>
							<Button
								size="sm"
								variant={config.routingMode === 'direct' ? 'default' : 'outline'}
								onClick={() => handleRouteChange('direct')}
							>
								Direct
							</Button>
						</div>
					</div>

					{/* Stats */}
					<div className="text-sm">
						<h3 className="font-medium mb-1">Layout Stats</h3>
						<p>Nodes: {layout.nodes.length}</p>
						<p>Paths: {layout.paths.length}</p>
						<p>Interchanges: {layout.nodes.filter(n => n.isInterchange).length}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
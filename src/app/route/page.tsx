// src/app/route/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
// import { generateGridLayout } from '~/app/_components/metro/engine/gridLayout';
// import SimplifiedMetroMap from '~/app/_components/metro/map/SimplifiedMetroMap';
import { Button } from '~/components/ui/button';
import { Grid } from 'lucide-react';
// import type { RouteMode } from '~/app/_components/metro/engine/manhattanRoute';

// Sample data for quick testing
const SAMPLE_CAREER_PATHS = [
	{
		id: "path1",
		organization_id: "org1",
		name: "Engineering",
		color: "#4f46e5",
		created_at: new Date().toISOString()
	},
	{
		id: "path2",
		organization_id: "org1",
		name: "Design",
		color: "#f59e0b",
		created_at: new Date().toISOString()
	},
	{
		id: "path3",
		organization_id: "org1",
		name: "Product",
		color: "#10b981",
		created_at: new Date().toISOString()
	}
];

const SAMPLE_POSITIONS = [
	{ id: "pos1", organization_id: "org1", name: "Junior Engineer", base_description: "", created_at: "" },
	{ id: "pos2", organization_id: "org1", name: "Engineer", base_description: "", created_at: "" },
	{ id: "pos3", organization_id: "org1", name: "Senior Engineer", base_description: "", created_at: "" },
	{ id: "pos4", organization_id: "org1", name: "Junior Designer", base_description: "", created_at: "" },
	{ id: "pos5", organization_id: "org1", name: "Designer", base_description: "", created_at: "" },
	{ id: "pos6", organization_id: "org1", name: "Senior Designer", base_description: "", created_at: "" },
	{ id: "pos7", organization_id: "org1", name: "Product Manager", base_description: "", created_at: "" },
	{ id: "pos8", organization_id: "org1", name: "Senior Product Manager", base_description: "", created_at: "" }
];

// Create position details with some interchanges
const SAMPLE_POSITION_DETAILS = [
	// Engineering path
	{ id: "d1", organization_id: "org1", position_id: "pos1", career_path_id: "path1", level: 1, sequence_in_path: 1, created_at: "" },
	{ id: "d2", organization_id: "org1", position_id: "pos2", career_path_id: "path1", level: 2, sequence_in_path: 2, created_at: "" },
	{ id: "d3", organization_id: "org1", position_id: "pos3", career_path_id: "path1", level: 3, sequence_in_path: 3, created_at: "" },

	// Design path
	{ id: "d4", organization_id: "org1", position_id: "pos4", career_path_id: "path2", level: 1, sequence_in_path: 1, created_at: "" },
	{ id: "d5", organization_id: "org1", position_id: "pos5", career_path_id: "path2", level: 2, sequence_in_path: 2, created_at: "" },
	{ id: "d6", organization_id: "org1", position_id: "pos6", career_path_id: "path2", level: 3, sequence_in_path: 3, created_at: "" },

	// Product path
	{ id: "d7", organization_id: "org1", position_id: "pos7", career_path_id: "path3", level: 2, sequence_in_path: 1, created_at: "" },
	{ id: "d8", organization_id: "org1", position_id: "pos8", career_path_id: "path3", level: 3, sequence_in_path: 2, created_at: "" },

	// Interchanges
	{ id: "d9", organization_id: "org1", position_id: "pos7", career_path_id: "path1", level: 2, sequence_in_path: 2.5, created_at: "" },
	{ id: "d10", organization_id: "org1", position_id: "pos2", career_path_id: "path3", level: 1, sequence_in_path: 0.5, created_at: "" }
];

export default function TestSimplifiedPage() {
	const [layout, setLayout] = useState(null);
	const [showDebugGrid, setShowDebugGrid] = useState(true);
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	// const [routeMode, setRouteMode] = useState<RouteMode>('manhattan');


	return (
		<div className="relative h-screen w-full bg-black">
			<div className="absolute inset-0">
				test 
			</div>
		</div>
	);
}
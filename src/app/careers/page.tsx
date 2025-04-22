// src/app/metro/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Providers } from "~/contexts/Providers";
import CareerCompass from "~/app/_components/metro/CareerCompass";
import { useCareer } from "~/contexts/CareerContext";
import { useUser } from "~/contexts/UserContext";
import { generateMetroLayout } from "~/app/_components/metro/engine/layoutEngine";

function MetroContent() {
	// Get data from contexts
	const { careerPaths, positions, positionPaths, transitions, loading, error, getRoleById, getTransitionsForRole } = useCareer();
	const { user, calculateSkillGaps, setCurrentRole, setTargetRole } = useUser();

	// Local UI state
	const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);

	// Basic layout configuration
	const [layoutConfig, setLayoutConfig] = useState({
		centerRadius: 150,
		radiusStep: 120,
		maxRadius: 800,
		startAngle: 0,
		angleSpread: 360,
		minNodeDistance: 60,
		padding: 100
	});

	// Generate visualization data using the engine
	const visualizationData = useMemo(() => {
		if (loading || !careerPaths.length) {
			return { lines: [], nodes: {}, connections: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } };
		}

		console.log("Generating layout with:", { careerPaths, positions, positionPaths, transitions });

		// Generate simple test data for now to troubleshoot rendering
		if (process.env.NODE_ENV === 'development') {
			// Create test data in polar coordinates
			const testLines = careerPaths.map((path, pathIndex) => {
				const nodeCount = Math.min(5, Math.floor(Math.random() * 3) + 3); // 3-5 nodes per line
				const angleStep = (Math.PI * 2) / (careerPaths.length);
				const baseAngle = pathIndex * angleStep;

				// Create nodes in a radial line
				const nodes = Array.from({ length: nodeCount }).map((_, i) => {
					const radius = 100 + i * 100; // Increasing radius
					const angle = baseAngle;
					const nodeId = `node-${pathIndex}-${i}`;

					return {
						id: nodeId,
						name: `Level ${i + 1}`,
						x: Math.cos(angle) * radius,
						y: Math.sin(angle) * radius,
						level: i + 1,
						isInterchange: false
					};
				});

				return {
					id: path.id,
					name: path.name,
					color: path.color || `hsl(${pathIndex * 60}, 70%, 50%)`,
					nodes
				};
			});

			// Build a nodes lookup map
			const testNodes = {};
			testLines.forEach(line => {
				line.nodes.forEach(node => {
					testNodes[node.id] = node;
				});
			});

			// Create some connections
			const testConnections = [];
			testLines.forEach(line => {
				for (let i = 0; i < line.nodes.length - 1; i++) {
					testConnections.push({
						fromId: line.nodes[i].id,
						toId: line.nodes[i + 1].id,
						isRecommended: true
					});
				}
			});

			return {
				lines: testLines,
				nodes: testNodes,
				connections: testConnections,
				bounds: { minX: -300, maxX: 300, minY: -300, maxY: 300 }
			};
		}

		// Will implement real data transformation and layout generation once 
		// we get the basic rendering working
		return { lines: [], nodes: {}, connections: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } };
	}, [careerPaths, positions, positionPaths, transitions, loading, layoutConfig]);

	// Log data for debugging
	useEffect(() => {
		if (visualizationData.lines.length > 0) {
			console.log("Visualization data:", visualizationData);
		}
	}, [visualizationData]);

	// Handle role selection and details
	const handleSelectRole = (roleId: string) => {
		setSelectedRoleId(roleId);
	};

	const handleOpenDetails = () => {
		setDetailsOpen(true);
	};

	const handleCloseDetails = () => {
		setDetailsOpen(false);
	};

	return (
		<CareerCompass
			visualizationData={visualizationData}
			careerPaths={careerPaths}
			user={user}
			loading={loading}
			error={error}

			selectedRoleId={selectedRoleId}
			detailsOpen={detailsOpen}
			onSelectRole={handleSelectRole}
			onOpenDetails={handleOpenDetails}
			onCloseDetails={handleCloseDetails}

			getRoleById={getRoleById}
			getTransitionsForRole={getTransitionsForRole}
			calculateSkillGaps={calculateSkillGaps}
			setCurrentRole={setCurrentRole}
			setTargetRole={setTargetRole}

			debug={true}
		/>
	);
}

export default function MetroPage() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="relative h-full">
			{isClient && (
				<Providers>
					<MetroContent />
				</Providers>
			)}
		</div>
	);
}
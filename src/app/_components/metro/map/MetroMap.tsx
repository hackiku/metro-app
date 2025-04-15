"use client"

// src/app/_components/metro/map/MetroMap.tsx
import { useEffect, useRef, useState } from "react";
import type { CareerPath, Role } from "../types";
import { calculateLayout } from "../services/layoutService";
import PathLine from "./PathLine";
import RoleNode from "./RoleNode";
import TransitionConnection from "./TransitionConnection";
import HelperGrid from "./HelperGrid";

interface MetroMapProps {
	careerPaths: CareerPath[];
	transitions?: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[];
	currentRoleId?: string;
	targetRoleId?: string;
	selectedRoleId?: string;
	onSelectRole?: (roleId: string) => void;
	className?: string;
	debug?: boolean; // Add debug flag to show/hide grid
}

export default function MetroMap({
	careerPaths,
	transitions = [],
	currentRoleId,
	targetRoleId,
	selectedRoleId,
	onSelectRole,
	className = "",
	debug = true // Enable by default for development
}: MetroMapProps) {
	const [layoutPaths, setLayoutPaths] = useState<CareerPath[]>([]);
	const [viewBox, setViewBox] = useState("0 0 1000 600");
	const [viewportBounds, setViewportBounds] = useState({
		minX: 0,
		minY: 0,
		maxX: 1000,
		maxY: 600
	});
	const svgRef = useRef<SVGSVGElement>(null);

	// Calculate layout when career paths change
	useEffect(() => {
		if (careerPaths.length > 0) {
			const processedPaths = calculateLayout(careerPaths);
			setLayoutPaths(processedPaths);

			// Determine viewBox based on role positions
			const allRoles = processedPaths.flatMap(path => path.roles);
			if (allRoles.length > 0) {
				// Calculate bounds with padding
				const padding = 60; // Increased padding for grid labels
				const minX = Math.min(...allRoles.map(role => role.x || 0)) - padding;
				const minY = Math.min(...allRoles.map(role => role.y || 0)) - padding;
				const maxX = Math.max(...allRoles.map(role => role.x || 0)) + padding;
				const maxY = Math.max(...allRoles.map(role => role.y || 0)) + padding;

				setViewBox(`${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
				setViewportBounds({ minX, minY, maxX, maxY });
			}
		}
	}, [careerPaths]);

	// Create a role lookup map for transitions
	const roleMap = new Map<string, { role: Role; path: CareerPath }>();
	layoutPaths.forEach(path => {
		path.roles.forEach(role => {
			roleMap.set(role.id, { role, path });
		});
	});

	// Handle role click
	const handleRoleClick = (roleId: string) => {
		onSelectRole?.(roleId);
	};

	return (
		<div className={`relative w-full h-full overflow-hidden border border-muted ${className}`}>
			<svg
				ref={svgRef}
				className="w-full h-full"
				viewBox={viewBox}
				preserveAspectRatio="xMidYMid meet"
			>
				{/* Helper Grid for development */}
				{debug && (
					<HelperGrid
						minX={viewportBounds.minX}
						minY={viewportBounds.minY}
						maxX={viewportBounds.maxX}
						maxY={viewportBounds.maxY}
						gridSize={50}
						showLabels={true}
					/>
				)}

				{/* Render path lines first (background layer) */}
				{layoutPaths.map(path => (
					<PathLine
						key={path.id}
						path={path}
					/>
				))}

				{/* Render transitions between roles */}
				{transitions.map(transition => {
					const fromRoleInfo = roleMap.get(transition.fromRoleId);
					const toRoleInfo = roleMap.get(transition.toRoleId);

					if (!fromRoleInfo || !toRoleInfo) return null;

					return (
						<TransitionConnection
							key={`${transition.fromRoleId}-${transition.toRoleId}`}
							fromRole={fromRoleInfo.role}
							toRole={toRoleInfo.role}
							isRecommended={transition.isRecommended}
							isHighlighted={selectedRoleId === transition.fromRoleId || selectedRoleId === transition.toRoleId}
						/>
					);
				})}

				{/* Render role nodes (foreground layer) */}
				{layoutPaths.map(path =>
					path.roles.map(role => {
						// Check if this role is an interchange (appears in multiple paths)
						const isInterchange = layoutPaths.some(
							p => p.id !== path.id && p.roles.some(r => r.id === role.id)
						);

						return (
							<RoleNode
								key={`${path.id}-${role.id}`}
								role={role}
								pathColor={path.color}
								isSelected={role.id === selectedRoleId}
								isCurrent={role.id === currentRoleId}
								isTarget={role.id === targetRoleId}
								isInterchange={isInterchange}
								onClick={() => handleRoleClick(role.id)}
							/>
						);
					})
				)}

				{/* Debugging coordinates display */}
				{debug && selectedRoleId && (
					<g className="coordinates-display">
						{(() => {
							const selectedRole = layoutPaths.flatMap(p => p.roles).find(r => r.id === selectedRoleId);
							if (!selectedRole) return null;

							return (
								<text
									x={selectedRole.x}
									y={selectedRole.y + 30}
									textAnchor="middle"
									fill="var(--muted-foreground)"
									fontSize="10"
									className="pointer-events-none"
								>
									({Math.round(selectedRole.x)}, {Math.round(selectedRole.y)})
								</text>
							);
						})()}
					</g>
				)}
			</svg>

			{/* Debug controls overlay */}
			{debug && (
				<div className="absolute bottom-4 left-4 bg-muted/80 rounded p-2 text-xs text-muted-foreground">
					<div>Paths: {layoutPaths.length}</div>
					<div>Roles: {layoutPaths.reduce((sum, path) => sum + path.roles.length, 0)}</div>
					<div>Transitions: {transitions.length}</div>
				</div>
			)}
		</div>
	);
}
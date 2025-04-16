"use client"

// src/app/_components/metro/map/MetroMap.tsx
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import type { CareerPath, Role } from "../types";
import { calculateGridPositions, calculateViewBounds } from "../core/gridSystem";
import { useMapInteraction } from "../core/useMapInteraction";
import PathLine from "./PathLine";
import { HelperGrid } from "./HelperGrid";

// Import new components
import { Station } from "./components/Station";
import { ConnectionPath } from "./components/ConnectionPath";

export interface MetroMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	zoomReset: () => void;
	centerOnRole: (roleId: string) => void;
}

interface MetroMapProps {
	careerPaths: CareerPath[];
	transitions?: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[];
	currentRoleId?: string | null;
	targetRoleId?: string | null;
	selectedRoleId?: string | null;
	onSelectRole?: (roleId: string) => void;
	onSetCurrentRole?: (roleId: string) => void;
	onSetTargetRole?: (roleId: string) => void;
	className?: string;
	debug?: boolean;
}

export const MetroMap = forwardRef<MetroMapRef, MetroMapProps>(function MetroMap({
	careerPaths,
	transitions = [],
	currentRoleId,
	targetRoleId,
	selectedRoleId,
	onSelectRole,
	onSetCurrentRole,
	onSetTargetRole,
	className = "",
	debug = false
}, ref) {
	// State
	const [layoutPaths, setLayoutPaths] = useState<CareerPath[]>([]);
	const [viewBox, setViewBox] = useState("0 0 1000 600");
	const [viewBounds, setViewBounds] = useState({
		minX: 0,
		minY: 0,
		maxX: 1000,
		maxY: 600
	});

	// Refs
	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<SVGGElement>(null);

	// Use our map interaction hook
	const {
		zoom,
		transformValue,
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnPoint,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleMouseLeave,
		handleWheel
	} = useMapInteraction({ initialZoom: 1 });

	// Calculate layout when career paths change
	useEffect(() => {
		if (careerPaths.length > 0) {
			// Use our grid system to position the roles
			const processedPaths = calculateGridPositions(careerPaths);
			setLayoutPaths(processedPaths);

			// Calculate view bounds
			const allRoles = processedPaths.flatMap(path => path.roles);
			if (allRoles.length > 0) {
				const bounds = calculateViewBounds(allRoles, 80);
				setViewBox(`${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`);
				setViewBounds(bounds);
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

	// Simple handleRoleClick that doesn't affect zoom/pan
	const handleRoleClick = (role: Role) => {
		// Do nothing - let the menu handle actions
	};

	// Handle "View Details" action from the station menu
	const handleViewDetails = (role: Role) => {
		if (onSelectRole) {
			onSelectRole(role.id);
		}
	};

	// Handle setting current role
	const handleSetCurrentRole = (role: Role) => {
		if (onSetCurrentRole) {
			onSetCurrentRole(role.id);
		}
	};

	// Handle setting target role
	const handleSetTargetRole = (role: Role) => {
		if (onSetTargetRole) {
			onSetTargetRole(role.id);
		}
	};

	// Center on a specific role
	const centerOnRole = (roleId: string) => {
		// Find the role
		const roleInfo = roleMap.get(roleId);
		if (!roleInfo) return;

		const { role } = roleInfo;

		// Get viewBox values
		const viewBoxValues = viewBox.split(' ').map(Number);
		const viewBoxWidth = viewBoxValues[2];
		const viewBoxHeight = viewBoxValues[3];

		// Use the centerOnPoint function from our hook
		centerOnPoint(role.x, role.y, viewBoxWidth, viewBoxHeight);
	};

	// Expose methods via ref
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnRole
	}));

	return (
		<div className={`w-full h-full overflow-hidden ${className}`}>
			<svg
				ref={svgRef}
				className="w-full h-full cursor-grab"
				viewBox={viewBox}
				preserveAspectRatio="xMidYMid meet"
				onMouseDown={handleMouseDown}
				onMouseMove={(e) => {
					if (svgRef.current) {
						const svgWidth = svgRef.current.clientWidth;
						const svgHeight = svgRef.current.clientHeight;

						const viewBoxValues = viewBox.split(' ').map(Number);
						const viewBoxWidth = viewBoxValues[2];
						const viewBoxHeight = viewBoxValues[3];

						handleMouseMove(e, viewBoxWidth, viewBoxHeight, svgWidth, svgHeight);
					}
				}}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				onWheel={handleWheel}
			>
				<g
					ref={containerRef}
					transform={transformValue}
				>
					{/* Debug grid */}
					{debug && (
						<HelperGrid
							minX={viewBounds.minX}
							minY={viewBounds.minY}
							maxX={viewBounds.maxX}
							maxY={viewBounds.maxY}
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

					{/* Render connections between roles */}
					{transitions.map(transition => {
						const fromRoleInfo = roleMap.get(transition.fromRoleId);
						const toRoleInfo = roleMap.get(transition.toRoleId);

						if (!fromRoleInfo || !toRoleInfo) return null;

						// Use our new ConnectionPath component
						return (
							<ConnectionPath
								key={`${transition.fromRoleId}-${transition.toRoleId}`}
								fromX={fromRoleInfo.role.x}
								fromY={fromRoleInfo.role.y}
								toX={toRoleInfo.role.x}
								toY={toRoleInfo.role.y}
								color={fromRoleInfo.path.color}
								isRecommended={transition.isRecommended}
								isHighlighted={selectedRoleId === transition.fromRoleId || selectedRoleId === transition.toRoleId}
							/>
						);
					})}

					{/* Render role nodes (foreground layer) */}
					{layoutPaths.map(path =>
						path.roles.map(role => {
							// Determine if this is an interchange
							const isInterchange = layoutPaths.some(
								p => p.id !== path.id && p.roles.some(r => r.id === role.id)
							);

							// Use our new Station component with separate handlers for different actions
							return (
								<Station
									key={`${path.id}-${role.id}`}
									station={role}
									x={role.x}
									y={role.y}
									color={path.color}
									isSelected={role.id === selectedRoleId}
									isCurrent={role.id === currentRoleId}
									isTarget={role.id === targetRoleId}
									isInterchange={isInterchange}
									onClick={handleRoleClick}
									onSetCurrent={handleSetCurrentRole}
									onSetTarget={handleSetTargetRole}
									onViewDetails={handleViewDetails}
								/>
							);
						})
					)}

					{/* Debug info for selected role */}
					{debug && selectedRoleId && (
						(() => {
							const role = layoutPaths.flatMap(p => p.roles).find(r => r.id === selectedRoleId);
							if (!role) return null;

							return (
								<text
									x={role.x}
									y={role.y + 35}
									textAnchor="middle"
									fill="var(--muted-foreground)"
									fontSize="10"
									className="pointer-events-none"
								>
									({Math.round(role.x)}, {Math.round(role.y)})
								</text>
							);
						})()
					)}
				</g>
			</svg>

			{/* Debug info overlay */}
			{debug && (
				<div className="absolute bottom-4 left-4 bg-background/80 rounded p-2 text-xs text-muted-foreground">
					<div>Paths: {layoutPaths.length}</div>
					<div>Roles: {layoutPaths.reduce((sum, p) => sum + p.roles.length, 0)}</div>
					<div>Zoom: {(zoom * 100).toFixed(0)}%</div>
				</div>
			)}
		</div>
	);
});

export default MetroMap;
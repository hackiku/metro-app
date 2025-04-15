"use client"

// src/app/_components/metro/map/MetroMap.tsx
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import type { CareerPath, Role } from "../types";
import { calculateGridPositions, calculateViewBounds } from "../core/gridSystem";
import { generatePathLine } from "../core/pathRenderer";
import { findRoleById } from "../core/helpers";
import { HelperGrid } from "./HelperGrid";

// Import our new components instead of the old ones
import { Station } from "./components/Station";
import { ConnectionPath } from "./components/ConnectionPath";
import PathLine from "./PathLine"; // Keep the old PathLine for now

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
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });

	// Refs
	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<SVGGElement>(null);
	const isDragging = useRef(false);
	const dragStart = useRef({ x: 0, y: 0 });

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

	// Handle role click
	const handleRoleClick = (role: Role) => {
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

	// Zoom functions
	const zoomIn = () => {
		setZoom(prev => Math.min(prev * 1.2, 5));
	};

	const zoomOut = () => {
		setZoom(prev => Math.max(prev / 1.2, 0.5));
	};

	const zoomReset = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	};

	const centerOnRole = (roleId: string) => {
		// Find the role
		const roleInfo = roleMap.get(roleId);
		if (!roleInfo) return;

		const { role } = roleInfo;

		// Calculate center of viewBox
		const viewBoxValues = viewBox.split(' ').map(Number);
		const viewBoxWidth = viewBoxValues[2];
		const viewBoxHeight = viewBoxValues[3];

		// Calculate new pan to center the role
		const centerX = viewBoxValues[0] + viewBoxWidth / 2;
		const centerY = viewBoxValues[1] + viewBoxHeight / 2;

		setPan({
			x: centerX - role.x,
			y: centerY - role.y
		});

		// Zoom in slightly
		setZoom(1.5);
	};

	// Expose methods via ref
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnRole
	}));

	// Mouse drag handlers for panning
	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.button !== 0) return; // Only left mouse button

		isDragging.current = true;
		dragStart.current = { x: e.clientX, y: e.clientY };

		// Change cursor
		if (svgRef.current) {
			svgRef.current.style.cursor = 'grabbing';
		}
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging.current) return;

		// Calculate distance moved
		const dx = e.clientX - dragStart.current.x;
		const dy = e.clientY - dragStart.current.y;

		// Update drag start position
		dragStart.current = { x: e.clientX, y: e.clientY };

		// Update pan based on zoom level and view box dimensions
		const viewBoxValues = viewBox.split(' ').map(Number);
		const viewBoxWidth = viewBoxValues[2];
		const viewBoxHeight = viewBoxValues[3];

		// Calculate pan factor based on SVG dimensions
		const svgWidth = svgRef.current?.clientWidth || 1000;
		const svgHeight = svgRef.current?.clientHeight || 600;

		const factorX = viewBoxWidth / svgWidth;
		const factorY = viewBoxHeight / svgHeight;

		// Update pan state
		setPan(prev => ({
			x: prev.x + (dx * factorX) / zoom,
			y: prev.y + (dy * factorY) / zoom
		}));
	};

	const handleMouseUp = () => {
		isDragging.current = false;

		// Reset cursor
		if (svgRef.current) {
			svgRef.current.style.cursor = 'grab';
		}
	};

	const handleMouseLeave = () => {
		isDragging.current = false;

		// Reset cursor
		if (svgRef.current) {
			svgRef.current.style.cursor = 'grab';
		}
	};

	// Calculate transform for zoom and pan
	const transformValue = `scale(${zoom}) translate(${pan.x}, ${pan.y})`;

	return (
		<div className={`w-full h-full overflow-hidden ${className}`}>
			<svg
				ref={svgRef}
				className="w-full h-full cursor-grab"
				viewBox={viewBox}
				preserveAspectRatio="xMidYMid meet"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
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

							// Use our new Station component
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
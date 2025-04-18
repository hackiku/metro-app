// src/app/_components/metro/map/MetroMap.tsx
"use client"

import React, { useRef, useEffect, useState } from 'react';
import { useMetroMap } from '../hooks/useMetroMap';
import StationOverlay from './components/StationOverlay';
import type { CareerPath } from '~/types/career';
import type { Point } from '~/types/metro';

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

export const MetroMap = React.forwardRef<MetroMapRef, MetroMapProps>(function MetroMap({
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
}, ref) {
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	// Track node positions for menu positioning
	const [nodePositions, setNodePositions] = useState<Map<string, Point>>(new Map());

	// Use our custom hook to handle D3 integration
	const {
		attachToContainer,
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnRole,
		zoomLevel,
		getPositions,
		updateSpecialRoles
	} = useMetroMap({
		careerPaths,
		transitions,
		currentRoleId,
		targetRoleId,
		selectedRoleId,
		onSelectRole,
		onSetCurrentRole,
		onSetTargetRole,
		onViewDetails,
		debug
	});

	// Update special roles when they change
	useEffect(() => {
		updateSpecialRoles(currentRoleId, targetRoleId);
	}, [currentRoleId, targetRoleId, updateSpecialRoles]);

	// Update node positions when data changes
	useEffect(() => {
		// Get positions from the renderer after it's updated
		const positions = getPositions();
		if (positions && positions.size > 0) {
			setNodePositions(positions);
		}
	}, [careerPaths, getPositions]);

	// Set SVG ref in the callback for positioning
	const handleContainerRef = (el: HTMLDivElement | null) => {
		if (el) {
			containerRef.current = el;
			attachToContainer(el);

			// Find the SVG element created by D3
			setTimeout(() => {
				const svg = el.querySelector('svg');
				if (svg) {
					svgRef.current = svg as SVGSVGElement;
				}
			}, 100);
		}
	};

	// Expose zoom controls through ref
	React.useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnRole
	}));

	return (
		<div className={`w-full h-full overflow-hidden ${className}`}>
			{/* This div will hold the D3-rendered SVG */}
			<div
				ref={handleContainerRef}
				className="w-full h-full"
				data-testid="metro-map-container"
			/>

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
// src/app/_components/metro/map/MetroMap.tsx
"use client"

import React, { useRef, useEffect } from 'react';
import { useMetroMap } from '../hooks/useMetroMap';
import { useCareer } from '~/contexts/CareerContext';
import type { CareerPath, Role } from '~/types/career';

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

	// Use our custom hook to handle D3 integration
	const {
		attachToContainer,
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnRole,
		zoomLevel
	} = useMetroMap({
		careerPaths,
		transitions,
		currentRoleId,
		targetRoleId,
		selectedRoleId,
		onSelectRole,
		onSetCurrentRole,
		onSetTargetRole,
		onViewDetails
	});

	// Expose zoom controls through ref
	React.useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		zoomReset,
		centerOnRole
	}));

	// Attach D3 renderer when container is available
	useEffect(() => {
		if (containerRef.current) {
			attachToContainer(containerRef.current);
		}
	}, [containerRef, attachToContainer]);

	return (
		<div className={`w-full h-full overflow-hidden ${className}`}>
			{/* This div will hold the D3-rendered SVG */}
			<div
				ref={containerRef}
				className="w-full h-full"
				data-testid="metro-map-container"
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
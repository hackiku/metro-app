"use client"

// src/app/_components/metro/map/MetroMap.tsx
import { useEffect, useRef, useState } from "react";
import type { CareerPath, Role } from "../types";
import { calculateLayout } from "../services/layoutService";
import PathLine from "./PathLine";
import RoleNode from "./RoleNode";
import TransitionConnection from "./TransitionConnection";

interface MetroMapProps {
	careerPaths: CareerPath[];
	transitions?: { fromRoleId: string; toRoleId: string; isRecommended: boolean }[];
	currentRoleId?: string;
	targetRoleId?: string;
	selectedRoleId?: string;
	onSelectRole?: (roleId: string) => void;
	className?: string;
}

export default function MetroMap({
	careerPaths,
	transitions = [],
	currentRoleId,
	targetRoleId,
	selectedRoleId,
	onSelectRole,
	className = ""
}: MetroMapProps) {
	const [layoutPaths, setLayoutPaths] = useState<CareerPath[]>([]);
	const [viewBox, setViewBox] = useState("0 0 1000 600");
	const svgRef = useRef<SVGSVGElement>(null);

	// Calculate layout when career paths change
	useEffect(() => {
		if (careerPaths.length > 0) {
			const processedPaths = calculateLayout(careerPaths);
			setLayoutPaths(processedPaths);

			// Determine viewBox based on role positions
			const allRoles = processedPaths.flatMap(path => path.roles);
			if (allRoles.length > 0) {
				const minX = Math.min(...allRoles.map(role => role.x || 0)) - 50;
				const minY = Math.min(...allRoles.map(role => role.y || 0)) - 50;
				const maxX = Math.max(...allRoles.map(role => role.x || 0)) + 50;
				const maxY = Math.max(...allRoles.map(role => role.y || 0)) + 50;

				setViewBox(`${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
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
		<div className={`w-full h-full overflow-hidden ${className}`}>
			<svg
				ref={svgRef}
				className="w-full h-full"
				viewBox={viewBox}
				preserveAspectRatio="xMidYMid meet"
			>
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
						/>
					);
				})}

				{/* Render role nodes (foreground layer) */}
				{layoutPaths.map(path =>
					path.roles.map(role => (
						<RoleNode
							key={role.id}
							role={role}
							pathColor={path.color}
							isSelected={role.id === selectedRoleId}
							isCurrent={role.id === currentRoleId}
							isTarget={role.id === targetRoleId}
							onClick={() => handleRoleClick(role.id)}
						/>
					))
				)}
			</svg>
		</div>
	);
}
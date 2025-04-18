// src/app/_components/metro/map/components/StationOverlay.tsx
"use client"

import { useState, useEffect, useRef } from "react";
import { StationMenu } from "./StationMenu";
import type { Role } from "~/types/career";
import type { Point } from "~/types/metro";

interface StationOverlayProps {
	selectedNodeId: string | null;
	nodePositions: Map<string, Point>;
	careerPaths: any[];
	currentRoleId?: string | null;
	targetRoleId?: string | null;
	onSetCurrent: (roleId: string) => void;
	onSetTarget: (roleId: string) => void;
	onViewDetails: (roleId: string) => void;
	svgRef: React.RefObject<SVGSVGElement>;
}

export default function StationOverlay({
	selectedNodeId,
	nodePositions,
	careerPaths,
	currentRoleId,
	targetRoleId,
	onSetCurrent,
	onSetTarget,
	onViewDetails,
	svgRef
}: StationOverlayProps) {
	// Menu state
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [pathColor, setPathColor] = useState<string>("#888");

	// Find role and path information when selection changes
	useEffect(() => {
		if (!selectedNodeId) {
			setMenuOpen(false);
			setSelectedRole(null);
			return;
		}

		// Find the selected role from careerPaths
		for (const path of careerPaths) {
			const role = path.roles.find((r: any) => r.id === selectedNodeId);
			if (role) {
				setSelectedRole(role);
				setPathColor(path.color);

				// Get position from D3 node positions
				const position = nodePositions.get(selectedNodeId);
				if (position && svgRef.current) {
					// Convert from SVG coordinates to screen coordinates
					const svgRect = svgRef.current.getBoundingClientRect();
					const ctm = svgRef.current.getScreenCTM();

					if (ctm) {
						const svgPoint = svgRef.current.createSVGPoint();
						svgPoint.x = position.x;
						svgPoint.y = position.y;

						const screenPoint = svgPoint.matrixTransform(ctm);
						setMenuPosition({
							x: screenPoint.x - svgRect.left,
							y: screenPoint.y - svgRect.top
						});

						// Open menu when selection changes
						setMenuOpen(true);
					}
				}
				break;
			}
		}
	}, [selectedNodeId, careerPaths, nodePositions, svgRef]);

	// Handle setting current role
	const handleSetCurrent = (role: Role) => {
		onSetCurrent(role.id);
		setMenuOpen(false);
	};

	// Handle setting target role
	const handleSetTarget = (role: Role) => {
		onSetTarget(role.id);
		setMenuOpen(false);
	};

	// Handle viewing details
	const handleViewDetails = (role: Role) => {
		onViewDetails(role.id);
		setMenuOpen(false);
	};

	// Don't render anything if no role is selected
	if (!selectedRole) return null;

	return (
		<div
			className="absolute pointer-events-none"
			style={{
				left: `${menuPosition.x}px`,
				top: `${menuPosition.y}px`,
				transform: 'translate(-50%, -50%)',
				zIndex: 50
			}}
		>
			{/* This div is positioned relatively to make the menu positioning work */}
			<div className="relative">
				<StationMenu
					station={selectedRole}
					isCurrentStation={selectedRole.id === currentRoleId}
					isTargetStation={selectedRole.id === targetRoleId}
					onSetCurrent={handleSetCurrent}
					onSetTarget={handleSetTarget}
					onViewDetails={handleViewDetails}
					open={menuOpen}
					onOpenChange={setMenuOpen}
					pathColor={pathColor}
				/>
			</div>
		</div>
	);
}
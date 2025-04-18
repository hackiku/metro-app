// src/app/_components/metro/CareerCompass.tsx
"use client"

import { useState, useRef } from "react";
import MetroMap from "./map/MetroMap";
import type { MetroMapRef } from "./map/MetroMap";
// import { MetroMap as OldMetroMap } from "./arch/map/MetroMap"; // Old implementation
import RoleDetails from "./ui/details/RoleDetails";
import PlayerCard from "./ui/player/PlayerCard";
import ZoomControls from "./ui/controls/ZoomControls";

// Import contexts
import { useCareer } from "~/contexts/CareerContext";
import { useUser } from "~/contexts/UserContext";
import { useMetroVisualization } from "~/contexts/MetroVisualizationContext";

export default function CareerCompass() {
	// Get data and state from contexts
	const { careerPaths, transitions, loading, error, getRoleById, getTransitionsForRole } = useCareer();
	const { user, calculateSkillGaps, setCurrentRole, setTargetRole } = useUser();
	const { viewState, selectRole, mapRef } = useMetroVisualization();

	// UI state for details modal
	const [detailsOpen, setDetailsOpen] = useState(false);

	// Reference to the new D3-based map
	const d3MapRef = useRef<MetroMapRef>(null);

	// Get selected role and path from current state
	const selectedRole = viewState.selectedRoleId ? getRoleById(viewState.selectedRoleId) : null;
	const selectedPath = selectedRole ? careerPaths.find(p => p.id === selectedRole.careerPathId) : null;

	// Handle role selection - just select the role but don't open details yet
	const handleSelectRole = (roleId: string) => {
		selectRole(roleId);
		// Don't open details immediately - let the user choose from menu

		// Center map on selected role
		if (d3MapRef.current) {
			d3MapRef.current.centerOnRole(roleId);
		}
	};

	// Handle view details request from menu
	const handleViewDetails = (roleId: string) => {
		selectRole(roleId);
		setDetailsOpen(true);
	};

	// Format transitions for the map component
	const transitionConnections = transitions.map(t => ({
		fromRoleId: t.fromRoleId,
		toRoleId: t.toRoleId,
		isRecommended: t.isRecommended
	}));

	return (
		<div className="relative h-full w-full bg-background">
			{loading ? (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex flex-col items-center">
						<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
						<p className="mt-4 text-muted-foreground">Loading career map...</p>
					</div>
				</div>
			) : error ? (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center">
						<p className="text-lg font-semibold text-destructive">{error}</p>
						<button
							className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
							onClick={() => window.location.reload()}
						>
							Retry
						</button>
					</div>
				</div>
			) : (
				<>
					{/* D3-based Metro map visualization */}
					<div className="absolute inset-0">
						<MetroMap
							ref={d3MapRef}
							careerPaths={careerPaths}
							transitions={transitionConnections}
							currentRoleId={user?.currentRoleId}
							targetRoleId={user?.targetRoleId}
							selectedRoleId={viewState.selectedRoleId}
							onSelectRole={handleSelectRole}
							onSetCurrentRole={setCurrentRole}
							onSetTargetRole={setTargetRole}
							onViewDetails={handleViewDetails}
							debug={true} // Set to false in production
						/>
					</div>

					{/* Player info card */}
					{user && (
						<div className="absolute top-4 left-4 z-10">
							<PlayerCard
								user={user}
								currentRole={getRoleById(user.currentRoleId)}
							/>
						</div>
					)}

					{/* Zoom controls */}
					<div className="absolute bottom-6 right-6 z-10">
						<ZoomControls
							onZoomIn={() => d3MapRef.current?.zoomIn()}
							onZoomOut={() => d3MapRef.current?.zoomOut()}
							onReset={() => d3MapRef.current?.zoomReset()}
						/>
					</div>

					{/* Role details modal */}
					{selectedRole && (
						<RoleDetails
							role={selectedRole}
							pathColor={selectedPath?.color || '#888'}
							skillGaps={calculateSkillGaps(selectedRole.id)}
							transitions={getTransitionsForRole(selectedRole.id)}
							open={detailsOpen}
							onOpenChange={setDetailsOpen}
							isCurrentRole={selectedRole.id === user?.currentRoleId}
							isTargetRole={selectedRole.id === user?.targetRoleId}
						/>
					)}
				</>
			)}
		</div>
	);
}
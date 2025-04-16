"use client"

// src/app/_components/metro/CareerCompass.tsx

import { useEffect, useState, useRef } from "react";
import type { CareerPath, Role, Transition, UserProfile, SkillGap } from "./types";
import { fetchCareerPaths, fetchDemoUserProfile, fetchTransitions } from "./services/dataService";
import { MetroMap } from "./map/MetroMap";
import type { MetroMapRef } from "./map/MetroMap";
import RoleDetails from "./ui/details/RoleDetails";
import PlayerCard from "./ui/player/PlayerCard";
import ZoomControls from "./ui/controls/ZoomControls";

export default function CareerCompass() {
	// Data state
	const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
	const [transitions, setTransitions] = useState<Transition[]>([]);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

	// UI state
	const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Reference to the map component for controlling zoom/pan
	const mapRef = useRef<MetroMapRef>(null);

	// Selected role data
	const selectedRole = selectedRoleId
		? careerPaths.flatMap(p => p.roles).find(r => r.id === selectedRoleId)
		: null;

	const selectedPath = selectedRole
		? careerPaths.find(p => p.id === selectedRole.careerPathId)
		: null;

	// Load data
	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true);
				setError(null);

				// Fetch all required data in parallel
				const [pathsData, transitionsData, userProfileData] = await Promise.all([
					fetchCareerPaths(),
					fetchTransitions(),
					fetchDemoUserProfile()
				]);

				setCareerPaths(pathsData);
				setTransitions(transitionsData);
				setUserProfile(userProfileData);

				// If user has current role, select it initially
				if (userProfileData?.currentRoleId) {
					setSelectedRoleId(userProfileData.currentRoleId);
				}
			} catch (err) {
				console.error("Error loading career data:", err);
				setError("Failed to load career data. Please try again later.");
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, []);

	// Handle role selection
	const handleSelectRole = (roleId: string) => {
		setSelectedRoleId(roleId);
		setDetailsOpen(true);

		// Center map on selected role
		if (mapRef.current) {
			mapRef.current.centerOnRole(roleId);
		}
	};

	// Set a role as current
	const handleSetCurrentRole = (roleId: string) => {
		// In a real app, you would update this in the backend
		setUserProfile(prev => prev ? { ...prev, currentRoleId: roleId } : null);
	};

	// Set a role as target
	const handleSetTargetRole = (roleId: string) => {
		// In a real app, you would update this in the backend
		setUserProfile(prev => prev ? { ...prev, targetRoleId: roleId } : null);
	};

	// Calculate skill gaps for selected role
	const calculateSkillGaps = (role: Role): SkillGap[] => {
		if (!userProfile || !role) return [];

		return role.requiredSkills.map(requiredSkill => {
			const userSkill = userProfile.skills.find(
				s => s.skillId === requiredSkill.skillId
			);

			const currentLevel = userSkill?.currentLevel || 0;
			const gap = requiredSkill.requiredLevel - currentLevel;

			return {
				skillId: requiredSkill.skillId,
				skillName: requiredSkill.skillName,
				currentLevel,
				requiredLevel: requiredSkill.requiredLevel,
				gap: Math.max(0, gap)
			};
		});
	};

	// Find transitions for the selected role
	const getTransitionsForRole = (roleId: string | null) => {
		if (!roleId) return [];
		return transitions.filter(t => t.fromRoleId === roleId || t.toRoleId === roleId);
	};

	// Zoom controls
	const handleZoomIn = () => {
		mapRef.current?.zoomIn();
	};

	const handleZoomOut = () => {
		mapRef.current?.zoomOut();
	};

	const handleZoomReset = () => {
		mapRef.current?.zoomReset();
	};

	// Get transition data in format needed by MetroMap
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
					{/* New Metro map visualization with grid */}
					<div className="absolute inset-0">
						<MetroMap
							ref={mapRef}
							careerPaths={careerPaths}
							transitions={transitionConnections}
							currentRoleId={userProfile?.currentRoleId}
							targetRoleId={userProfile?.targetRoleId}
							selectedRoleId={selectedRoleId}
							onSelectRole={handleSelectRole}
							onSetCurrentRole={handleSetCurrentRole}
							onSetTargetRole={handleSetTargetRole}
							debug={true} // Set to false in production
						/>
					</div>

					{/* Player info card */}
					{userProfile && (
						<div className="absolute top-4 left-4 z-10">
							<PlayerCard
								user={userProfile}
								currentRole={careerPaths
									.flatMap(p => p.roles)
									.find(r => r.id === userProfile.currentRoleId)}
							/>
						</div>
					)}

					{/* Zoom controls */}
							{/* Simplified Zoom controls - just the reset button */}
							<div className="absolute bottom-6 right-6 z-10">
								<ZoomControls
									onReset={() => mapRef.current?.zoomReset()}
								/>
							</div>

					{/* Role details modal */}
					{selectedRole && (
						<RoleDetails
							role={selectedRole}
							pathColor={selectedPath?.color || '#888'}
							skillGaps={calculateSkillGaps(selectedRole)}
							transitions={getTransitionsForRole(selectedRole.id)}
							open={detailsOpen}
							onOpenChange={setDetailsOpen}
							isCurrentRole={selectedRole.id === userProfile?.currentRoleId}
							isTargetRole={selectedRole.id === userProfile?.targetRoleId}
						/>
					)}
				</>
			)}
		</div>
	);
}
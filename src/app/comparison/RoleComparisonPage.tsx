// src/app/comparison/RoleComparisonPage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChartBig, ChevronDown } from "lucide-react";
import { useUser } from "~/contexts/UserContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import { Skeleton } from "~/components/ui/skeleton";
import { SkillComparisonChart } from "./SkillComparisonChart";
import { WorkEnvironmentCard } from "./WorkEnvironmentCard";
import { TransitionTimelineCard } from "./TransitionTimelineCard";
import { api } from "~/trpc/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"; // For target selection
import { useOrganization } from "~/contexts/OrganizationContext"; // Need org ID for positions

export function RoleComparisonPage() {
	// Get data from contexts
	const { currentUser, currentPosition, loading: userLoading } = useUser(); // Get current position directly
	const { userCompetences, isLoading: userCompetencesLoading } = useCompetences();
	const { currentOrganization } = useOrganization();

	// State for the selected target position ID
	const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

	// Fetch all available position details for the org to populate the selector
	const availablePositionsQuery = api.position.getAllDetails.useQuery(
		{ organizationId: currentOrganization?.id! },
		{
			enabled: !!currentOrganization?.id,
			staleTime: 1000 * 60 * 15 // Cache for 15 mins
		}
	);

	// Fetch details for the *selected* target position
	const targetPositionQuery = api.position.getPositionDetailById.useQuery(
		{ id: selectedTargetId! },
		{
			enabled: !!selectedTargetId,
			staleTime: 1000 * 60 * 5
		}
	);

	// Fetch required competences for the *selected* target position
	const targetCompetencesQuery = api.position.getPositionCompetences.useQuery(
		{ positionDetailId: selectedTargetId! },
		{
			enabled: !!selectedTargetId,
			staleTime: 1000 * 60 * 10
		}
	);

	// Determine overall loading state
	const isLoading =
		userLoading || // Waiting for user and their current position
		userCompetencesLoading || // Waiting for user's competences
		availablePositionsQuery.isLoading || // Waiting for list of roles to select from
		(!!selectedTargetId && targetPositionQuery.isLoading) || // Waiting for selected target details
		(!!selectedTargetId && targetCompetencesQuery.isLoading); // Waiting for selected target competences

	// Check if we have the essential data pieces
	const currentPositionDetail = currentPosition; // Alias for clarity
	const targetPositionDetail = targetPositionQuery.data;
	const hasRequiredData = !!currentPositionDetail && !!targetPositionDetail && !!userCompetences && !!targetCompetencesQuery.data;

	// Get role names for display
	const currentRoleName = currentPositionDetail?.position?.name ?? "Your Role";
	const targetRoleName = targetPositionDetail?.position?.name ?? "Target Role";
	const pageSubtitle = `See what's needed to transition from ${currentRoleName} to ${targetRoleName}`;

	// Handle target selection change
	const handleTargetChange = (value: string) => {
		setSelectedTargetId(value);
	};

	// --- Loading / Error / No Selection States ---
	if (userLoading || availablePositionsQuery.isLoading) {
		// Initial loading for user/positions list
		return <ComparisonSkeleton title="Loading Comparison..." />;
	}

	if (!currentPositionDetail) {
		return <div className="p-6 text-center text-muted-foreground">Please ensure your current position is set in your profile.</div>;
	}

	if (availablePositionsQuery.error) {
		return <div className="p-4 text-red-600">Error loading available positions: {availablePositionsQuery.error.message}</div>;
	}

	if (!selectedTargetId && availablePositionsQuery.data && availablePositionsQuery.data.length > 0) {
		// Prompt user to select a target if none is selected yet
		return (
			<div className="animate-fade-in space-y-6">
				<ComparisonHeaderSkeleton currentRoleName={currentRoleName} />
				<div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
					<h2 className="text-xl font-semibold">Select a Target Role</h2>
					<p className="text-muted-foreground">Choose a role from the dropdown to compare it with your current position.</p>
					<Select onValueChange={handleTargetChange}>
						<SelectTrigger className="w-[280px]">
							<SelectValue placeholder="Select target role..." />
						</SelectTrigger>
						<SelectContent>
							{availablePositionsQuery.data
								.filter(pos => pos.id !== currentPositionDetail.id) // Don't compare to self
								.map((pos) => (
									<SelectItem key={pos.id} value={pos.id}>
										{pos.positions?.name} (Level {pos.level}) - {pos.career_paths?.name}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>
			</div>
		);
	}

	// Loading state AFTER a target is selected
	if (isLoading || !hasRequiredData) {
		if (targetPositionQuery.error) {
			return <div className="p-4 text-red-600">Error loading target role details: {targetPositionQuery.error.message}</div>;
		}
		if (targetCompetencesQuery.error) {
			return <div className="p-4 text-red-600">Error loading target skills: {targetCompetencesQuery.error.message}</div>;
		}
		return <ComparisonSkeleton title={`Comparing ${currentRoleName} vs ${targetPositionDetail?.position?.name ?? '...'}`} />;
	}

	// --- Render actual content ---
	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Left Title Part */}
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<BarChartBig className="h-6 w-6" />
					</div>
					<div>
						<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
							Compare Roles
						</h1>
						<p className="text-muted-foreground">{pageSubtitle}</p>
					</div>
				</div>
				{/* Right Target Selector */}
				<div className="w-full sm:w-auto">
					<label htmlFor="target-role-select" className="mb-1 block text-xs font-medium text-muted-foreground">Compare with:</label>
					<Select value={selectedTargetId ?? undefined} onValueChange={handleTargetChange}>
						<SelectTrigger id="target-role-select" className="w-full sm:w-[280px]">
							<SelectValue placeholder="Select target role..." />
						</SelectTrigger>
						<SelectContent>
							{availablePositionsQuery.data
								?.filter(pos => pos.id !== currentPositionDetail.id) // Don't compare to self
								.map((pos) => (
									<SelectItem key={pos.id} value={pos.id}>
										{pos.positions?.name} (Lvl {pos.level}) {/* Shortened Level */}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>
			</div>


			{/* Main Content Grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Column (Skill Comparison) */}
				<div className="lg:col-span-2">
					<SkillComparisonChart
						currentPositionDetail={currentPositionDetail}
						targetPositionDetail={targetPositionDetail}
						userCompetences={userCompetences}
						targetPositionCompetences={targetCompetencesQuery.data}
					/>
				</div>

				{/* Right Column (Work Environment) */}
				<div>
					<WorkEnvironmentCard
						currentPositionDetail={currentPositionDetail}
						targetPositionDetail={targetPositionDetail}
					/>
				</div>
			</div>

			{/* Full Width Timeline Card */}
			<div className="mt-6">
				<TransitionTimelineCard
					currentPositionDetail={currentPositionDetail}
					targetPositionDetail={targetPositionDetail}
				/>
			</div>
		</div>
	);
}


// --- Helper Skeleton Component ---
function ComparisonSkeleton({ title }: { title: string }) {
	return (
		<div className="animate-pulse space-y-6">
			<div className="flex items-start gap-4">
				<Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
				<div className="flex-1">
					<Skeleton className="h-8 w-1/2 mb-2" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			</div>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Skeleton className="h-96 w-full rounded-lg" />
				</div>
				<div className="space-y-6">
					<Skeleton className="h-64 w-full rounded-lg" />
				</div>
			</div>
			<Skeleton className="h-48 w-full rounded-lg" />
		</div>
	);
}

// --- Helper Header Skeleton Component (for when target is not selected) ---
function ComparisonHeaderSkeleton({ currentRoleName }: { currentRoleName: string }) {
	return (
		<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-4">
				<Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
				<div className="flex-1">
					<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
						Compare Roles
					</h1>
					<p className="text-muted-foreground">Select a target role to compare with {currentRoleName}</p>
				</div>
			</div>
			<div className="w-full sm:w-auto">
				<Skeleton className="h-10 w-full sm:w-[280px]" />
			</div>
		</div>
	);
}
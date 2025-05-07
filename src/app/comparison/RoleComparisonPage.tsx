// src/app/comparison/RoleComparisonPage.tsx
"use client";

import { useState, useEffect } from "react";
import { BarChartBig } from "lucide-react";
import { useUser } from "~/contexts/UserContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import { Skeleton } from "~/components/ui/skeleton";
import { SkillComparisonChart } from "./SkillComparisonChart";
import { WorkEnvironmentCard } from "./WorkEnvironmentCard";
import { TransitionTimelineCard } from "./TransitionTimelineCard";
import { useCareerPlan } from "~/contexts/CareerPlanContext";
import { api } from "~/trpc/react";

export function RoleComparisonPage() {
	// Get data from contexts
	const { currentUser, currentPosition, loading: userLoading } = useUser();
	const { userCompetences, isLoading: userCompetencesLoading } = useCompetences();
	const { activePlan, isLoading: planLoading } = useCareerPlan();

	// Use target position from active career plan
	const targetPositionId = activePlan?.target_position_details?.id;

	// Get target position details and competences
	const { data: targetPosition, isLoading: targetPositionLoading } =
		api.position.getPositionDetailById.useQuery(
			{ id: targetPositionId! },
			{ enabled: !!targetPositionId }
		);

	const { data: targetCompetences, isLoading: targetCompetencesLoading } =
		api.position.getPositionCompetences.useQuery(
			{ positionDetailId: targetPositionId! },
			{ enabled: !!targetPositionId }
		);

	// Determine overall loading state
	const isLoading = userLoading || userCompetencesLoading ||
		planLoading || targetPositionLoading || targetCompetencesLoading;

	// Check if we have the necessary data
	const hasData = !!currentPosition && !!targetPosition;

	// Get role names for display
	const currentRoleName = currentPosition?.position?.name ?? "Current Role";
	const targetRoleName = targetPosition?.positions?.name ?? "Target Role";
	const pageSubtitle = targetPosition
		? `Compare your current role to ${targetRoleName}`
		: "Select a career plan to see role comparison";

	// --- Loading / Error / No Selection States ---
	if (isLoading) {
		return <ComparisonSkeleton title="Loading Comparison..." />;
	}

	if (!currentPosition) {
		return <div className="p-6 text-center text-muted-foreground">Please ensure your current position is set in your profile.</div>;
	}

	if (!targetPosition) {
		return (
			<div className="animate-fade-in space-y-6">
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<BarChartBig className="h-6 w-6" />
						</div>
						<div>
							<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
								Compare Roles
							</h1>
							<p className="text-muted-foreground">Please create a career plan to see role comparison</p>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
					<h2 className="text-xl font-semibold">No Target Role Selected</h2>
					<p className="text-muted-foreground">Create a career plan first by visiting the Route Plan page.</p>
				</div>
			</div>
		);
	}

	// --- Render actual content ---
	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-8 flex items-start gap-4">
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

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Column (Skill Comparison) */}
				<div className="lg:col-span-2">
					<SkillComparisonChart
						currentPositionDetail={currentPosition}
						targetPositionDetail={targetPosition}
						userCompetences={userCompetences}
						targetPositionCompetences={targetCompetences}
					/>
				</div>

				{/* Right Column (Work Environment) */}
				<div>
					<WorkEnvironmentCard
						currentPositionDetail={currentPosition}
						targetPositionDetail={targetPosition}
					/>
				</div>
			</div>

			{/* Full Width Timeline Card */}
			<div className="mt-6">
				<TransitionTimelineCard
					currentPositionDetail={currentPosition}
					targetPositionDetail={targetPosition}
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
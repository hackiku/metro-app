// src/app/comparison/RoleComparisonPage.tsx
"use client";

import { useEffect, useState } from "react";
import { BarChartBig } from "lucide-react";
import { useUser } from "~/contexts/UserContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import { Skeleton } from "~/components/ui/skeleton";
import { SkillComparisonChart } from "./SkillComparisonChart";
import { WorkEnvironmentCard } from "./WorkEnvironmentCard";
import { TransitionTimelineCard } from "./TransitionTimelineCard";
import { usePositionRecommendations } from "~/hooks/usePositionRecommendations";

export function RoleComparisonPage() {
	// Get data from contexts
	const { currentUser } = useUser();
	const { userCompetences } = useCompetences();

	// Initialize the custom hook directly
	const {
		currentPosition,
		recommendations,
		isLoading
	} = usePositionRecommendations();

	// Improvement: Cache recommendations in state so we don't lose them
	const [firstRecommendation, setFirstRecommendation] = useState<any>(null);

	// Update the recommendations when they change
	useEffect(() => {
		if (recommendations && recommendations.length > 0) {
			// We assume recommendations[0].position_detail exists based on hook implementation
			if (recommendations[0].position_detail) {
				setFirstRecommendation(recommendations[0].position_detail);
			}
		}
	}, [recommendations]);

	// Enhanced logging for debugging
	useEffect(() => {
		console.log("🔍 Current User:", currentUser);
		console.log("🔍 Current Position:", currentPosition);
		console.log("🔍 User Competences:", userCompetences);
		console.log("🔍 Recommendations:", recommendations);
		console.log("🔍 First Recommendation:", firstRecommendation);
		console.log("🔍 Loading State:", isLoading);
	}, [currentUser, currentPosition, userCompetences, recommendations, firstRecommendation, isLoading]);

	// Get role names for display
	const currentRoleName = currentPosition?.position?.name || "Current Role";
	const targetRoleName = firstRecommendation?.position?.name || "Target Role";

	// Create subtitle
	const pageSubtitle = `See what's needed for this career transition`;

	// Only show loading state if data is still being fetched
	const showLoading = isLoading;

	// Force render after a timeout
	const [forceShow, setForceShow] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => {
			setForceShow(true);
		}, 3000);
		return () => clearTimeout(timer);
	}, []);

	// Show loading skeleton while data is being fetched
	if (showLoading && !forceShow) {
		return (
			<div className="animate-fade-in">
				<div className="mb-8 flex items-start gap-4">
					<Skeleton className="h-12 w-12 rounded-lg" />
					<div>
						<Skeleton className="h-8 w-64 mb-2" />
						<Skeleton className="h-4 w-48" />
					</div>
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<Skeleton className="h-96 w-full" />
					</div>
					<div>
						<Skeleton className="h-64 w-full" />
					</div>
				</div>
				<div className="mt-6">
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		);
	}

	// Check if we have the required data
	const hasRequiredData = currentPosition && (firstRecommendation || (recommendations && recommendations.length > 0));

	// If data is missing but we've waited, show a message
	if (!hasRequiredData && forceShow) {
		return (
			<div className="p-8 space-y-6">
				<div className="mb-8 flex items-start gap-4">
					<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<BarChartBig className="h-6 w-6" />
					</div>
					<div>
						<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
							Role Comparison
						</h1>
						<p className="text-muted-foreground">
							Compare your current role with potential next steps
						</p>
					</div>
				</div>

				<div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
					<h2 className="text-lg font-semibold mb-2">Data Not Available</h2>
					<p className="mb-2">We couldn't load the necessary data for this comparison. This could be because:</p>
					<ul className="list-disc pl-5 mb-3 space-y-1">
						{!currentUser && <li>You are not currently logged in</li>}
						{!currentPosition && <li>Your profile doesn't have a current position assigned</li>}
						{(!recommendations || recommendations.length === 0) && <li>No career recommendations are available for your profile</li>}
						<li>There was an error loading the data from the server</li>
					</ul>
					<p>You can try refreshing the page or navigating to another section and coming back.</p>
				</div>
			</div>
		);
	}

	// Get the target position from recommendations
	const targetPosition = firstRecommendation ||
		(recommendations && recommendations.length > 0 ?
			recommendations[0].position_detail : null);

	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-8 flex items-start gap-4">
				<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<BarChartBig className="h-6 w-6" />
				</div>
				<div>
					<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
						Compare: {currentRoleName} vs. {targetRoleName}
					</h1>
					<p className="text-muted-foreground">{pageSubtitle}</p>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Column (Skill Comparison) */}
				<div className="lg:col-span-2">
					<SkillComparisonChart
						currentPosition={currentPosition}
						targetPosition={targetPosition}
						userCompetences={userCompetences || []}
					/>
				</div>

				{/* Right Column (Work Environment) */}
				<div>
					<WorkEnvironmentCard
						currentPosition={currentPosition}
						targetPosition={targetPosition}
					/>
				</div>
			</div>

			{/* Full Width Timeline Card */}
			<div className="mt-6">
				<TransitionTimelineCard
					currentPosition={currentPosition}
					targetPosition={targetPosition}
				/>
			</div>
		</div>
	);
}
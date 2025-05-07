// src/app/destinations/DestinationsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Compass, BarChart, RefreshCw } from "lucide-react";
import { recommendedDestinationsData } from "./data";
import { DestinationCard } from "./DestinationCard";
import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import { useCareerPlan } from "~/contexts/CareerPlanContext";
import { usePositionRecommendations } from "~/hooks/usePositionRecommendations";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { ContextDataDisplay } from "./components/ContextDataDisplay";

export function DestinationsPage() {
	const { currentUser } = useUser();
	const { currentOrganization } = useOrganization();
	const { userCompetences, isLoading: competencesLoading } = useCompetences();
	const { plans, activePlan, isLoading: plansLoading } = useCareerPlan();
	const {
		recommendations,
		isLoading: recommendationsLoading,
		currentPosition
	} = usePositionRecommendations();

	const [showDemoData, setShowDemoData] = useState(true);

	// Let's log some debug info in development
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('Current User:', currentUser);
			console.log('User Position:', currentPosition);
			console.log('User Competences:', userCompetences);
			console.log('Career Plans:', plans);
			console.log('Active Plan:', activePlan);
			console.log('Recommendations:', recommendations);
		}
	}, [currentUser, currentPosition, userCompetences, plans, activePlan, recommendations]);

	// This text could be dynamic based on competences
	const whyTheseMatchesText = userCompetences.length > 0
		? `Based on your ${userCompetences[0]?.competence.name || ''} skills${userCompetences.length > 1 ? `, ${userCompetences[1]?.competence.name || ''}` : ''}, and other strengths in your profile, our AI has identified these roles as potential good fits for your next career move.`
		: "Based on your profile, our AI has identified these roles as potential good fits for your next career move.";

	const isLoading = competencesLoading || plansLoading || recommendationsLoading;
	const destinations = showDemoData ? recommendedDestinationsData : recommendations;

	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-8 flex items-start justify-between">
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Compass className="h-6 w-6" />
					</div>
					<div>
						<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
							Recommended Destinations
						</h1>
						<p className="text-muted-foreground">
							AI-matched career paths based on your profile and skills
						</p>
					</div>
				</div>

				{/* Toggle between demo/real data */}
				{process.env.NODE_ENV === 'development' && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowDemoData(!showDemoData)}
						className="flex items-center gap-2"
					>
						{showDemoData ? (
							<>
								<BarChart className="h-4 w-4" />
								Using Demo Data
							</>
						) : (
							<>
								<RefreshCw className="h-4 w-4" />
								Using Real Data
							</>
						)}
					</Button>
				)}
			</div>

			{/* Development Context Data Display */}
			{process.env.NODE_ENV === 'development' && (
				<ContextDataDisplay
					user={currentUser}
					organization={currentOrganization}
					userCompetences={userCompetences}
					currentPosition={currentPosition}
					plans={plans}
					activePlan={activePlan}
					recommendations={recommendations}
				/>
			)}

			{/* Current Role */}
			<div className="mb-6 rounded-lg border bg-card p-4 text-card-foreground">
				<h2 className="mb-2 text-base font-medium">Your Current Role</h2>
				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-3 w-64" />
					</div>
				) : currentPosition ? (
					<div>
						<p className="font-medium">{currentPosition.position?.name}</p>
						<p className="text-sm text-muted-foreground">
							{currentPosition.career_path?.name} • Level {currentPosition.level}
						</p>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						No current position set. Please update your profile.
					</p>
				)}
			</div>

			{/* Competence Overview (if we have competence data) */}
			{userCompetences.length > 0 && (
				<div className="mb-6">
					<h2 className="mb-2 text-lg font-semibold text-foreground">
						Your Top Skills
					</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
						{userCompetences.slice(0, 5).map((uc) => (
							<div key={uc.id} className="rounded-lg border bg-card p-3">
								<h3 className="text-sm font-medium truncate">{uc.competence.name}</h3>
								<div className="mt-2 h-2 w-full rounded-full bg-muted">
									<div
										className="h-2 rounded-full bg-primary"
										style={{ width: `${uc.current_level * 20}%` }}
									/>
								</div>
								<p className="mt-1 text-xs text-muted-foreground text-right">
									Level {uc.current_level}/5
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* "Why these matches?" Section */}
			<div className="mb-8">
				<h2 className="mb-2 text-xl font-semibold text-foreground">
					Why these matches?
				</h2>
				<p className="text-muted-foreground">
					{whyTheseMatchesText}
				</p>
			</div>

			{/* Destinations Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-64 w-full" />
					))}
				</div>
			) : destinations.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{destinations.map((destination) => (
						<DestinationCard key={destination.id} destination={destination} />
					))}
				</div>
			) : (
				<div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
					<div className="max-w-md">
						<Compass className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
						<h3 className="text-xl font-semibold text-foreground">No Recommendations Yet</h3>
						<p className="text-muted-foreground">
							We're still analyzing your profile. Check back soon for personalized career destinations.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
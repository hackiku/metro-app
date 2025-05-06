// src/app/destinations/DestinationsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Compass, BarChart } from "lucide-react";
import { recommendedDestinationsData, RecommendedDestination } from "./data";
import { DestinationCard } from "./DestinationCard";
import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export function DestinationsPage() {
	const { currentUser } = useUser();
	const { currentOrganization } = useOrganization();
	const [showDemoData, setShowDemoData] = useState(true);
	const [destinations, setDestinations] = useState<RecommendedDestination[]>([]);

	// Get user's position details
	const userPositionQuery = api.user.getUserPositionDetails.useQuery(
		{ userId: currentUser?.id! },
		{ enabled: !!currentUser?.id }
	);

	// Let's log some debug info in development
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('Current User:', currentUser);
			console.log('User Position:', userPositionQuery.data);
		}
	}, [currentUser, userPositionQuery.data]);

	// Load demo data or real data
	useEffect(() => {
		if (showDemoData) {
			setDestinations(recommendedDestinationsData);
		} else {
			// Here we'd query for real position recommendations based on user competences
			// This would be implemented in a later iteration
			setDestinations([]);
		}
	}, [showDemoData]);

	// This text could also be dynamic based on AI analysis
	const whyTheseMatchesText = "Based on your strong analytical skills, eagerness to learn, and interest in strategy, our AI has identified these roles as potential good fits for your next career move.";

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
						<BarChart className="h-4 w-4" />
						{showDemoData ? 'Using Demo Data' : 'Using Real Data'}
					</Button>
				)}
			</div>

			{/* Current Role */}
			<div className="mb-6 rounded-lg border bg-card p-4 text-card-foreground">
				<h2 className="mb-2 text-base font-medium">Your Current Role</h2>
				{userPositionQuery.isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-3 w-64" />
					</div>
				) : userPositionQuery.data ? (
					<div>
						<p className="font-medium">{userPositionQuery.data.position?.name}</p>
						<p className="text-sm text-muted-foreground">
							{userPositionQuery.data.career_path?.name} • Level {userPositionQuery.data.level}
						</p>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						No current position set. Please update your profile.
					</p>
				)}
			</div>

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
			{destinations.length > 0 ? (
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
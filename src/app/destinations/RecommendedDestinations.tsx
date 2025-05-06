// src/app/destinations/RecommendedDestinations.tsx
"use client";

import { Compass, ArrowRight } from "lucide-react";
import { recommendedDestinationsData } from "./data";
import { DestinationCard } from "./DestinationCard";
// Assuming you might want to use UserContext later for personalization
// import { useUser } from "~/contexts/UserContext"; 

export function RecommendedDestinationsPage() {
	// const { currentUser } = useUser(); // Example if you need user data

	// Mocked data for now, eventually this could come from API based on user profile
	const destinations = recommendedDestinationsData;

	// This text could also be dynamic based on AI analysis
	const whyTheseMatchesText = "Based on your strong analytical skills, eagerness to learn, and interest in strategy, our AI has identified these roles as potential good fits for your next career move.";

	return (
		<div className="animate-fade-in"> {/* animate-fade-in from original main tag */}
			{/* Page Header */}
			<div className="mb-8 flex items-start gap-4">
				<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Compass className="h-6 w-6" /> {/* Adjusted size to match example */}
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

			{/* "Why these matches?" Section */}
			<div className="mb-8"> {/* Increased bottom margin to match image spacing */}
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
					<Compass className="mb-4 h-16 w-16 text-muted-foreground/50" />
					<h3 className="text-xl font-semibold text-foreground">No Recommendations Yet</h3>
					<p className="text-muted-foreground">
						We're still analyzing your profile. Check back soon for personalized career destinations.
					</p>
				</div>
			)}
		</div>
	);
}
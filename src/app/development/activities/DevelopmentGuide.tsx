// src/app/development/activities/DevelopmentGuide.tsx
"use client"

// Define the type directly in this file
// This should reflect the data structure available in the parent component (`page.tsx`)
// Note: userRating might be optional or have a default if not always present
export interface Competence {
	id: string;
	name: string;
	description: string;
	category?: string; // Keep optional as it might depend on context/fetch
	userRating?: number; // Keep optional
}

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { BookOpen } from "lucide-react";

interface DevelopmentGuideProps {
	// Use the locally defined type, allowing competence to be potentially undefined
	competence: Competence | undefined;
}

export default function DevelopmentGuide({ competence }: DevelopmentGuideProps) {
	// Guard clause if competence is not found or provided
	if (!competence) {
		// Optionally render a placeholder or specific message
		return (
			<Card className="bg-white p-6 shadow-md dark:bg-neutral-800">
				<p className="text-neutral-500 dark:text-neutral-400">Select a competence to see the guide.</p>
			</Card>
		);
	}

	// Use a default rating if undefined for display purposes
	const displayRating = competence.userRating ?? 0;

	return (
		<Card className="bg-white shadow-md dark:bg-neutral-800">
			<div className="border-b border-neutral-200 p-6 dark:border-neutral-700">
				<h2 className="text-xl font-semibold">{competence.name}</h2>
				<p className="mt-2 text-neutral-600 dark:text-neutral-300">
					{competence.description}
				</p>
			</div>

			<div className="p-6">
				{/* Only show progress if userRating is available */}
				{competence.userRating !== undefined && (
					<div className="mb-6">
						<div className="mb-2 flex items-center justify-between">
							<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Your proficiency</span>
							<span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{displayRating}%</span>
						</div>
						<Progress
							value={displayRating}
							className="h-2 w-full [&>*]:bg-blue-600" // Example: Customize progress bar color
							aria-label={`Proficiency in ${competence.name}: ${displayRating}%`}
						/>
					</div>
				)}

				<div className="space-y-4">
					<div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
						<h3 className="mb-2 font-medium text-blue-800 dark:text-blue-300">Development Tips</h3>
						<p className="text-sm text-blue-700 dark:text-blue-300"> {/* Adjusted text color slightly */}
							Select learning activities below that align with your development goals. Follow the 70-20-10 approach:
							70% on-the-job learning, 20% social learning, and 10% formal training.
						</p>
					</div>

					{/* Consider making this button functional or linking somewhere */}
					<Button variant="outline" className="w-full" disabled> {/* Disabled if no action */}
						<BookOpen className="mr-2 h-4 w-4" />
						Download Full Development Guide (Coming Soon)
					</Button>
				</div>
			</div>
		</Card>
	);
}
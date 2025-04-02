// src/app/development/CompetenceSelect.tsx
"use client"

// Define the Competence type directly in this file
// REMOVED the import from "./data"
export interface Competence {
	id: string;
	name: string;
	description: string; // Keep even if not directly rendered, as it's part of the expected data
	category?: string; // Optional as it might not always be present
	userRating?: number; // Optional
}

import { Brain, Target, Users, Zap, Star } from "lucide-react"; // Assuming Zap was intended somewhere or can be removed if unused
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils"; // Import cn for combining class names conditionally

// Define Props interface using the local Competence type
interface CompetenceSelectProps {
	competences: Competence[];
	selectedId: string | null; // Allow null for when nothing is selected
	onSelect: (id: string) => void;
}

export default function CompetenceSelect({
	competences,
	selectedId,
	onSelect
}: CompetenceSelectProps) {

	// Helper function to get icon based on category - logic remains the same
	const getIcon = (category?: string) => {
		switch (category) {
			case "Cognitive":
				return <Brain className="h-4 w-4" />;
			case "Execution":
				return <Target className="h-4 w-4" />;
			case "Interpersonal":
				return <Users className="h-4 w-4" />;
			default:
				return <Star className="h-4 w-4" />; // Default icon
		}
	};

	// Empty state logic remains the same
	if (!competences || competences.length === 0) {
		return (
			<div className="rounded-lg border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
				<p className="text-neutral-500 dark:text-neutral-400">
					No competences available.
					{/* Consider a more generic message if it's not always filtered by job family */}
				</p>
			</div>
		);
	}

	// Map over competences - rendering logic remains largely the same
	return (
		<div className="space-y-3">
			{competences.map(competence => {
				const isSelected = selectedId === competence.id;
				// Use a default rating of 0 if undefined
				const displayRating = competence.userRating ?? 0;

				return (
					<div
						key={competence.id}
						role="button" // Improve accessibility
						tabIndex={0} // Make it focusable
						className={cn(
							"cursor-pointer rounded-lg border p-3 transition-colors duration-150 ease-in-out hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:hover:bg-neutral-700/50",
							isSelected
								? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/30' // Enhanced selected state
								: 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800' // Standard state
						)}
						onClick={() => onSelect(competence.id)}
						onKeyDown={(e) => { // Allow selection with Enter/Space
							if (e.key === 'Enter' || e.key === ' ') {
								onSelect(competence.id);
							}
						}}
						aria-pressed={isSelected} // Indicate selection state for screen readers
					>
						<div className="flex items-center gap-3">
							{/* Icon rendering logic remains the same */}
							<div className={cn(
								"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", // Added flex-shrink-0
								isSelected
									? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
									: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400' // Adjusted dark mode background
							)}>
								{getIcon(competence.category)}
							</div>
							{/* Text content structure remains the same */}
							<div className="flex-1 overflow-hidden"> {/* Added overflow-hidden */}
								<h3 className="truncate font-medium text-neutral-800 dark:text-neutral-100"> {/* Added truncate */}
									{competence.name}
								</h3>
								<div className="mt-1 flex items-center justify-between">
									<span className="text-xs text-neutral-500 dark:text-neutral-400">
										{competence.category || "General"}
									</span>
									<span className={`text-xs font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-700 dark:text-neutral-200'}`}>
										{displayRating}%
									</span>
								</div>
								{/* Progress bar rendering remains the same */}
								<Progress
									value={displayRating}
									className="mt-1 h-1 [&>*]:bg-indigo-500" // Example color customization
									aria-label={`Proficiency in ${competence.name}: ${displayRating}%`}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
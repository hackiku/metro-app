// src/app/development/CompetenceSelect.tsx
"use client"

// Keep the Competence interface assuming category exists
export interface Competence {
	id: string;
	name: string;
	description: string;
	category?: string; // Keep category as optional
	userRating?: number; // Keep userRating as optional
}

import { Brain, Target, Users, Star } from "lucide-react"; // Removed Zap as it wasn't used
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

// Props interface remains the same
interface CompetenceSelectProps {
	competences: Competence[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}

export default function CompetenceSelect({
	competences,
	selectedId,
	onSelect
}: CompetenceSelectProps) {

	// getIcon function remains the same, relying on competence.category
	const getIcon = (category?: string) => {
		switch (category) {
			case "Cognitive":
				return <Brain className="h-4 w-4" />;
			case "Execution":
				return <Target className="h-4 w-4" />;
			case "Interpersonal":
				return <Users className="h-4 w-4" />;
			default:
				return <Star className="h-4 w-4" />; // Default icon if category is missing or unknown
		}
	};

	// Empty state check remains, but message adjusted slightly for clarity
	if (!competences || competences.length === 0) {
		return (
			// This component shouldn't render the empty state itself if the parent handles it,
			// but keeping it as a fallback. The parent now handles the primary empty/loading states.
			<div className="rounded-lg border border-neutral-700 bg-neutral-800 p-6 text-center">
				<p className="text-neutral-400">
					No competences to display.
				</p>
			</div>
		);
	}

	// Rendering logic remains mostly the same, using category and userRating
	return (
		<div className="space-y-3">
			{competences.map(competence => {
				const isSelected = selectedId === competence.id;
				const displayRating = competence.userRating ?? 0; // Handle potentially undefined rating

				return (
					<div
						key={competence.id}
						role="button"
						tabIndex={0}
						// Adjusted styles to better match dark theme screenshot
						className={cn(
							"cursor-pointer rounded-lg border p-3 transition-colors duration-150 ease-in-out hover:bg-neutral-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800", // Added dark mode focus offset
							isSelected
								? 'border-indigo-500 bg-neutral-700 dark:border-indigo-600 dark:bg-neutral-700' // Adjusted selected background
								: 'border-neutral-700 bg-neutral-800 dark:border-neutral-700 dark:bg-neutral-800' // Standard background
						)}
						onClick={() => onSelect(competence.id)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								onSelect(competence.id);
							}
						}}
						aria-pressed={isSelected}
					>
						<div className="flex items-center gap-3">
							<div className={cn(
								"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
								isSelected
									? 'bg-indigo-900 text-indigo-300' // Adjusted selected icon colors
									: 'bg-neutral-700 text-neutral-400' // Adjusted standard icon colors
							)}>
								{getIcon(competence.category)}
							</div>
							<div className="flex-1 overflow-hidden">
								<h3 className="truncate font-medium text-neutral-100">
									{competence.name}
								</h3>
								<div className="mt-1 flex items-center justify-between">
									{/* Display category if it exists */}
									{competence.category && (
										<span className="text-xs text-neutral-400">
											{competence.category}
										</span>
									)}
									<span className={`text-xs font-medium ${isSelected ? 'text-indigo-300' : 'text-neutral-300'}`}>
										{displayRating}%
									</span>
								</div>
								<Progress
									value={displayRating}
									// Adjusted progress bar style for dark mode
									className="mt-1 h-1 bg-neutral-600 [&>*]:bg-indigo-500"
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
// src/app/job-family/JobFamilyGrid.tsx
"use client"

import Link from "next/link"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Briefcase, ChevronRight } from "lucide-react"
// Assuming JobFamily type is correctly imported/defined in './page'
import { type JobFamily } from "./page"
import { useEffect, useState } from "react"
import { supabase } from "~/server/db/supabase"
import { cn } from "~/lib/utils" // Import cn for utility

interface JobFamilyGridProps {
	jobFamilies: JobFamily[]
}

// Interface for the raw data fetched from competences table
interface SupabaseCompetence {
	id: string;
	name: string;
}

// Interface for the raw data fetched from job_family_competences table
interface SupabaseJobFamilyCompetence {
	job_family_id: string;
	competence_id: string;
	importance_level: number | null; // Assuming importance_level might be nullable
}

export function JobFamilyGrid({ jobFamilies }: JobFamilyGridProps) {
	// State holds the mapping from job family ID to an array of competence names
	const [familyCompetences, setFamilyCompetences] = useState<Record<string, string[]>>({})
	const [isLoading, setIsLoading] = useState(true)

	// Fetch competences for each job family
	useEffect(() => {
		// Prevent fetching if jobFamilies array is empty or not yet loaded
		if (!jobFamilies || jobFamilies.length === 0) {
			setIsLoading(false); // Ensure loading stops if there's nothing to process
			setFamilyCompetences({}); // Reset competences map
			return;
		}

		async function fetchCompetences() {
			try {
				setIsLoading(true)
				setFamilyCompetences({}); // Reset map before fetching

				// 1. Get all competences to have a name lookup
				const { data: competencesData, error: competencesError } = await supabase
					.from('competences')
					.select('id, name')
					.returns<SupabaseCompetence[]>(); // Add type hint

				if (competencesError) {
					console.error("Error fetching competences:", competencesError)
					// Consider setting an error state here
					return // Stop execution if fetching competences failed
				}
				if (!competencesData) {
					console.warn("No competence data received.")
					return; // Stop if no data
				}

				// Create a lookup map for competence names (ID -> Name)
				const competencesMap = new Map<string, string>()
				competencesData.forEach((comp) => {
					// Ensure both id and name exist before setting
					if (comp.id && comp.name) {
						competencesMap.set(comp.id, comp.name)
					}
				});

				// 2. Fetch the job_family_competences relationships for the current families
				const familyIds = jobFamilies.map(f => f.id);
				const { data: relationshipsData, error: relationshipsError } = await supabase
					.from('job_family_competences')
					.select('job_family_id, competence_id, importance_level')
					.in('job_family_id', familyIds)
					.order('importance_level', { ascending: false }) // Order by importance
					.returns<SupabaseJobFamilyCompetence[]>(); // Add type hint

				if (relationshipsError) {
					console.error("Error fetching competence relationships:", relationshipsError)
					// Consider setting an error state
					return // Stop execution if fetching relationships failed
				}
				if (!relationshipsData) {
					console.warn("No relationship data received.");
					// Keep existing (empty) familyCompetences state
					return;
				}

				// 3. Group competence names by job family ID
				const competencesByFamily: Record<string, string[]> = {}
				// Initialize arrays for all families being processed to avoid the error source
				familyIds.forEach(id => {
					competencesByFamily[id] = [];
				});

				relationshipsData.forEach(item => {
					const competenceName = competencesMap.get(item.competence_id);
					const familyId = item.job_family_id;

					// Skip if competence name wasn't found in the map or if familyId is missing
					if (!competenceName || !familyId) {
						console.warn(`Skipping relationship for family ${familyId} / competence ${item.competence_id} due to missing name or ID.`);
						return;
					}

					// --- FIX START ---
					// Get the array for the current family ID.
					// We initialized all relevant keys above, but checking again adds robustness.
					const competenceList = competencesByFamily[familyId];

					// Check if list exists (it should, but good practice) and push
					if (competenceList) {
						competenceList.push(competenceName);
					} else {
						// This case should ideally not happen due to pre-initialization
						console.warn(`Competence list for family ID ${familyId} was unexpectedly missing.`);
						// competencesByFamily[familyId] = [competenceName]; // Option to initialize here if needed
					}
					// --- FIX END ---
				});

				setFamilyCompetences(competencesByFamily);

			} catch (error) {
				console.error("Error processing job family competences:", error);
				setFamilyCompetences({}); // Reset on error
			} finally {
				setIsLoading(false);
			}
		}

		fetchCompetences();
	}, [jobFamilies]); // Dependency array includes jobFamilies

	// Department color styles function remains the same
	const getDepartmentColor = (department: string): string => {
		// Use lowercase for comparison for robustness
		const deptLower = department?.toLowerCase() ?? '';
		switch (deptLower) {
			// Assuming "People&" might mean "People & something" or just "People"
			case "people&":
			case "people": // Add potential variations
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
			case "product & technology":
			case "product and technology":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
			case "commercial":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
			default:
				return "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"; // Slightly adjusted default dark
		}
	};

	// Fallback competences - Keep as is if needed during loading
	const FALLBACK_COMPETENCES: Record<string, string[]> = {
		"business-partnering": ["Forming Judgment", "Problem Analysis", "Organisation Sensitivity"],
		"business-analysis": ["Problem Analysis", "Forming Judgment", "Planning & Organising"],
		// ... other fallbacks
	};

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{/* Handle loading state for the whole grid */}
			{isLoading && jobFamilies.length === 0 && (
				Array.from({ length: 6 }).map((_, i) => (
					<Card key={i} className="h-48 animate-pulse bg-muted p-6"></Card>
				))
			)}

			{/* Render families once not loading OR if families exist */}
			{!isLoading && jobFamilies.length === 0 ? (
				// Empty state if no families match filters after loading
				<div className="col-span-full p-8 text-center">
					<p className="text-lg font-medium">No job families found</p>
					<p className="text-muted-foreground">
						Try adjusting your search or filter criteria.
					</p>
				</div>
			) : (
				// Map over families (even during loading if families array is populated)
				jobFamilies.map((family) => {
					// Determine competences: Use fetched if available and not loading, otherwise try fallback
					// Ensure family.id exists before using it as a key
					const familyKey = family?.id ?? '';
					const fetchedCompetences = familyCompetences[familyKey];
					const useFetched = !isLoading && fetchedCompetences && fetchedCompetences.length > 0;

					const competencesToDisplay = useFetched
						? fetchedCompetences
						// Refined fallback logic: Use specific ID or normalized name
						: (FALLBACK_COMPETENCES[familyKey] || FALLBACK_COMPETENCES[family.name?.toLowerCase().replace(/\s+/g, '-') ?? ''] || []);

					return (
						<Link href={`/job-family/${familyKey}`} key={familyKey} className="block h-full"> {/* Ensure link takes full height */}
							<Card className="group flex h-full cursor-pointer flex-col justify-between p-4 transition-all hover:shadow-lg dark:bg-neutral-800"> {/* Adjusted padding, flex, dark bg */}
								<div> {/* Top content container */}
									<div className="mb-2 flex items-center justify-between">
										<Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
										{family.department && (
											<Badge
												variant="outline"
												className={cn("ml-2 whitespace-nowrap", getDepartmentColor(family.department))} // Added whitespace-nowrap
											>
												{family.department}
											</Badge>
										)}
									</div>

									<h2 className="mb-1 text-lg font-semibold group-hover:text-primary dark:text-neutral-100">{family.name || "Unnamed Family"}</h2>

									<p className="mb-4 mt-1 text-sm text-muted-foreground line-clamp-2">
										{family.description || "No description available."}
									</p>

									{/* Display Competences - Limit to 2 + count */}
									{competencesToDisplay.length > 0 && (
										<div className="mb-4 flex flex-wrap gap-1"> {/* Reduced gap */}
											{competencesToDisplay.slice(0, 2).map((competence) => (
												<Badge key={competence} variant="secondary" className="text-xs"> {/* Smaller text */}
													{competence}
												</Badge>
											))}
											{competencesToDisplay.length > 2 && (
												<Badge variant="secondary" className="text-xs">
													+{competencesToDisplay.length - 2} more
												</Badge>
											)}
										</div>
									)}
								</div>

								{/* Bottom "View details" link */}
								<div className="mt-auto flex items-center justify-end pt-2 text-sm text-primary"> {/* mt-auto pushes to bottom */}
									View details
									<ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
								</div>
							</Card>
						</Link>
					);
				})
			)}
		</div>
	);
}
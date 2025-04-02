// ~/app/competences/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "~/server/db/supabase"
import { Button } from "~/components/ui/button"
import { ChevronLeft, Brain, Users, Target, Briefcase } from "lucide-react"
import Link from "next/link"
import { CompetenceHeader } from "./CompetenceHeader"
import { DevelopmentGuide } from "./DevelopmentGuide"
import { RelatedJobs } from "./RelatedJobs"

// Type definitions
interface Competence {
	id: string // Assuming id is always a string from the DB
	name: string
	description: string
	category?: string
	userRating?: number
}

// Explicitly type the expected data from Supabase for competence
// Adjust if your actual schema differs (e.g., if columns can be null)
interface SupabaseCompetence {
	id: string;
	name: string;
	description: string;
	// Add other fields selected by '*' if needed for typing
}

interface JobFamily {
	id: string
	name: string
	description: string
	department: string
}

// Explicitly type the relationship data
interface JobFamilyCompetence {
	job_family_id: string;
}

export default function CompetenceDetailPage() {
	const params = useParams()
	const router = useRouter()
	// Ensure id is treated as string, handle potential array/undefined from params
	const id = typeof params?.id === 'string' ? params.id : undefined;

	const [competence, setCompetence] = useState<Competence | null>(null)
	const [relatedJobs, setRelatedJobs] = useState<JobFamily[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Fetch competence details
	useEffect(() => {
		async function fetchCompetenceDetails() {
			// Check if id is valid before fetching
			if (!id) {
				console.error("No competence ID found in URL params.");
				setIsLoading(false); // Stop loading if no ID
				// Optionally redirect or show an error message specific to missing ID
				return;
			}

			setIsLoading(true);

			try {
				// Fetch competence data - explicitly type the expected return data
				const { data: competenceData, error: competenceError } = await supabase
					.from('competences')
					.select('*') // Consider selecting only necessary columns
					.eq('id', id)
					.single<SupabaseCompetence>(); // Use .single<Type>() for better type safety

				// --- FIX STARTS HERE ---
				// Check for errors *or* if data is null/undefined after the query
				if (competenceError || !competenceData) {
					console.error("Error fetching competence or competence not found:", competenceError);
					// Set loading to false before returning
					setIsLoading(false);
					return;
				}
				// --- FIX ENDS HERE ---

				// Now, competenceData is guaranteed to be non-null, and competenceData.id is a string

				// Add random category and rating for demo purposes
				const enhancedCompetence: Competence = { // Explicitly type enhancedCompetence
					...competenceData,
					userRating: Math.floor(Math.random() * 40) + 40, // Random rating 40-80%
					category: assignRandomCategory(competenceData.id) // competenceData.id is now safe
				};

				setCompetence(enhancedCompetence);

				// Fetch job families that require this competence
				const { data: relationshipsData, error: relationsError } = await supabase
					.from('job_family_competences')
					.select('job_family_id')
					.eq('competence_id', id)
					.returns<JobFamilyCompetence[]>(); // Add return type hint

				if (relationsError) {
					console.error("Error fetching relationships:", relationsError);
				} else if (relationshipsData?.length) {
					const jobFamilyIds = relationshipsData.map(rel => rel.job_family_id);

					const { data: jobFamiliesData, error: jobFamiliesError } = await supabase
						.from('job_families')
						.select('*') // Consider selecting only necessary columns
						.in('id', jobFamilyIds)
						.returns<JobFamily[]>(); // Add return type hint

					if (jobFamiliesError) {
						console.error("Error fetching job families:", jobFamiliesError);
					} else {
						setRelatedJobs(jobFamiliesData || []); // Use empty array fallback
					}
				}
			} catch (error) {
				console.error("Error in data fetching:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchCompetenceDetails();
	}, [id]); // Depend only on the derived 'id' string

	// Helper function to assign random categories
	// Signature remains (id: string) because we now ensure a valid string is passed
	function assignRandomCategory(id: string): string {
		// Use a deterministic approach based on ID to ensure consistency
		// The check below is technically redundant now if we always pass a valid string,
		// but it doesn't hurt as a safeguard against empty strings.
		if (!id) { // Handles empty string case
			return "General";
		}

		const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const categories = ["Cognitive", "Interpersonal", "Execution"];
		// Basic modulo for distribution. Ensure categories array is not empty.
		return categories.length > 0 ? categories[hash % categories.length]! : "General";
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<div className="flex items-center gap-2">
					{/* Use disabled attribute directly for clarity */}
					<Button variant="ghost" size="sm" disabled>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back
					</Button>
				</div>

				{/* Placeholder elements */}
				<div className="h-10 w-1/3 animate-pulse rounded-lg bg-muted" />
				<div className="h-6 w-1/4 animate-pulse rounded-lg bg-muted" />
				<div className="mt-6 h-32 animate-pulse rounded-lg bg-muted" />
				<div className="mt-6 grid gap-6 md:grid-cols-2">
					<div className="h-64 animate-pulse rounded-lg bg-muted" />
					<div className="h-64 animate-pulse rounded-lg bg-muted" />
				</div>
			</div>
		);
	}

	// Handle not found (competence is null after loading is false)
	if (!competence) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center">
				<Briefcase className="mb-4 h-12 w-12 text-muted-foreground" /> {/* Use foreground color for icon */}
				<h1 className="mb-2 text-2xl font-bold">Competence Not Found</h1>
				<p className="mb-6 text-muted-foreground">
					The competence you're looking for might not exist or couldn't be loaded.
				</p>
				<Button asChild>
					<Link href="/competences">View All Competences</Link>
				</Button>
			</div>
		);
	}

	// Competence found, render details
	return (
		<div className="space-y-8 p-6">
			{/* Back button */}
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" onClick={() => router.back()}>
					<ChevronLeft className="mr-1 h-4 w-4" />
					Back {/* Consider more specific text like "Back to Competences" if appropriate */}
				</Button>
			</div>

			{/* Header */}
			<CompetenceHeader competence={competence} />

			{/* Main content in a 2-column grid on larger screens */}
			<div className="grid gap-8 md:grid-cols-2">
				{/* Left column */}
				<DevelopmentGuide competence={competence} />

				{/* Right column */}
				<RelatedJobs
					competence={competence}
					relatedJobs={relatedJobs}
				/>
			</div>
		</div>
	);
}
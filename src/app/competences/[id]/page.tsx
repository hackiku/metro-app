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
	id: string
	name: string
	description: string
	category?: string
	userRating?: number
}

interface JobFamily {
	id: string
	name: string
	description: string
	department: string
}

export default function CompetenceDetailPage() {
	const params = useParams()
	const router = useRouter()
	const id = params?.id as string

	const [competence, setCompetence] = useState<Competence | null>(null)
	const [relatedJobs, setRelatedJobs] = useState<JobFamily[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Fetch competence details
	useEffect(() => {
		async function fetchCompetenceDetails() {
			if (!id) return

			setIsLoading(true)

			try {
				// Fetch competence data
				const { data: competenceData, error: competenceError } = await supabase
					.from('competences')
					.select('*')
					.eq('id', id)
					.single()

				if (competenceError) {
					console.error("Error fetching competence:", competenceError)
					return
				}

				// Add random category and rating for demo purposes
				// In a real app, these would come from the user's profile/assessment
				const enhancedCompetence = {
					...competenceData,
					userRating: Math.floor(Math.random() * 40) + 40, // Random rating between 40-80%
					category: assignRandomCategory(competenceData.id) // Assign a random category
				};

				setCompetence(enhancedCompetence)

				// Fetch job families that require this competence
				const { data: relationshipsData, error: relationsError } = await supabase
					.from('job_family_competences')
					.select('job_family_id')
					.eq('competence_id', id)

				if (relationsError) {
					console.error("Error fetching relationships:", relationsError)
				} else if (relationshipsData?.length) {
					// Get the job family details
					const jobFamilyIds = relationshipsData.map(rel => rel.job_family_id)

					const { data: jobFamiliesData, error: jobFamiliesError } = await supabase
						.from('job_families')
						.select('*')
						.in('id', jobFamilyIds)

					if (jobFamiliesError) {
						console.error("Error fetching job families:", jobFamiliesError)
					} else {
						setRelatedJobs(jobFamiliesData || [])
					}
				}
			} catch (error) {
				console.error("Error in data fetching:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchCompetenceDetails()
	}, [id])

	// Helper function to assign random categories
	function assignRandomCategory(id: string): string {
		// Use a deterministic approach based on ID to ensure consistency
		const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const categories = ["Cognitive", "Interpersonal", "Execution"];
		return categories[hash % categories.length];
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" disabled>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back
					</Button>
				</div>

				<div className="h-10 w-1/3 animate-pulse rounded-lg bg-muted" />
				<div className="h-6 w-1/4 animate-pulse rounded-lg bg-muted" />

				<div className="mt-6 h-32 animate-pulse rounded-lg bg-muted" />

				<div className="mt-6 grid gap-6 md:grid-cols-2">
					<div className="h-64 animate-pulse rounded-lg bg-muted" />
					<div className="h-64 animate-pulse rounded-lg bg-muted" />
				</div>
			</div>
		)
	}

	// Handle not found
	if (!competence) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center">
				<Briefcase className="mb-4 h-12 w-12 text-muted" />
				<h1 className="mb-2 text-2xl font-bold">Competence Not Found</h1>
				<p className="mb-6 text-muted-foreground">
					The competence you're looking for doesn't exist or has been removed.
				</p>
				<Button asChild>
					<Link href="/competences">
						View All Competences
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-8 p-6">
			{/* Back button */}
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" onClick={() => router.back()}>
					<ChevronLeft className="mr-1 h-4 w-4" />
					Back to Competences
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
	)
}
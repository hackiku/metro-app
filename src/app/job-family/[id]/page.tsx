// src/app/job-family/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "~/server/db/supabase"
import { Button } from "~/components/ui/button"
import { ChevronLeft, Briefcase } from "lucide-react"
import Link from "next/link"

// Import local components
import { JobFamilyHeader } from "./JobFamilyHeader"
import { CompetencesSection } from "./CompetencesSection"
import { CareerProgressionSection } from "./CareerProgressionSection"
import { KeyResponsibilitiesSection } from "./KeyResponsibilities"
import { RelatedFamiliesSection } from "./RelatedFamiliesSection"

// Type definitions
interface JobFamily {
	id: string
	name: string
	description: string
	department: string
}

interface Competence {
	id: string
	name: string
	description: string
	category?: string
}

export default function JobFamilyDetailPage() {
	const params = useParams()
	const router = useRouter()
	const id = params?.id as string

	const [jobFamily, setJobFamily] = useState<JobFamily | null>(null)
	const [competences, setCompetences] = useState<Competence[]>([])
	const [relatedFamilies, setRelatedFamilies] = useState<JobFamily[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Fetch job family details
	useEffect(() => {
		async function fetchJobFamilyDetails() {
			if (!id) return

			setIsLoading(true)

			try {
				// Fetch job family data
				const { data: familyData, error: familyError } = await supabase
					.from('job_families')
					.select('*')
					.eq('id', id)
					.single()

				if (familyError) {
					console.error("Error fetching job family:", familyError)
					return
				}

				setJobFamily(familyData)

				// Fetch competences for this job family
				const { data: competenceRelations, error: relationsError } = await supabase
					.from('job_family_competences')
					.select('competence_id, importance_level')
					.eq('job_family_id', id)
					.order('importance_level', { ascending: false })

				if (relationsError) {
					console.error("Error fetching competence relations:", relationsError)
				} else if (competenceRelations?.length) {
					// Get the actual competence details
					const competenceIds = competenceRelations.map(rel => rel.competence_id)

					const { data: competencesData, error: competencesError } = await supabase
						.from('competences')
						.select('*')
						.in('id', competenceIds)

					if (competencesError) {
						console.error("Error fetching competences:", competencesError)
					} else {
						setCompetences(competencesData || [])
					}
				}

				// Fetch related job families (same department)
				if (familyData) {
					const { data: relatedData, error: relatedError } = await supabase
						.from('job_families')
						.select('*')
						.eq('department', familyData.department)
						.neq('id', id)
						.limit(3)

					if (relatedError) {
						console.error("Error fetching related families:", relatedError)
					} else {
						setRelatedFamilies(relatedData || [])
					}
				}
			} catch (error) {
				console.error("Error in data fetching:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchJobFamilyDetails()
	}, [id])

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

				<div className="mt-6 space-y-2">
					<div className="h-6 w-1/5 animate-pulse rounded-lg bg-muted" />
					<div className="flex gap-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="h-8 w-24 animate-pulse rounded-full bg-muted" />
						))}
					</div>
				</div>
			</div>
		)
	}

	// Handle not found
	if (!jobFamily) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center">
				<Briefcase className="mb-4 h-12 w-12 text-muted" />
				<h1 className="mb-2 text-2xl font-bold">Job Family Not Found</h1>
				<p className="mb-6 text-muted-foreground">
					The job family you're looking for doesn't exist or has been removed.
				</p>
				<Button asChild>
					<Link href="/job-family">
						View All Job Families
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
					Back to Job Families
				</Button>
			</div>

			{/* Header with image */}
			<JobFamilyHeader
				name={jobFamily.name}
				description={jobFamily.description}
				department={jobFamily.department}
			/>

			{/* Main content in a 2-column grid on larger screens */}
			<div className="grid gap-8 md:grid-cols-2">
				{/* Left column */}
				<div className="space-y-8">
					<KeyResponsibilitiesSection />
					<CompetencesSection competences={competences} />
				</div>

				{/* Right column */}
				<div className="space-y-8">
					<CareerProgressionSection jobFamilyName={jobFamily.name} />
					<RelatedFamiliesSection
						relatedFamilies={relatedFamilies}
						relationshipType="department"
					/>
				</div>
			</div>
		</div>
	)
}
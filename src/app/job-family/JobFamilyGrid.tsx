// src/app/job-family/JobFamilyGrid.tsx
"use client"

import Link from "next/link"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Briefcase, ChevronRight } from "lucide-react"
import { type JobFamily } from "./page"
import { useEffect, useState } from "react"
import { supabase } from "~/server/db/supabase"

interface JobFamilyGridProps {
	jobFamilies: JobFamily[]
}

interface Competence {
	id: string
	name: string
}

export function JobFamilyGrid({ jobFamilies }: JobFamilyGridProps) {
	const [familyCompetences, setFamilyCompetences] = useState<Record<string, string[]>>({})
	const [isLoading, setIsLoading] = useState(true)

	// Fetch competences for each job family
	useEffect(() => {
		async function fetchCompetences() {
			if (jobFamilies.length === 0) return

			try {
				setIsLoading(true)

				// First, get all competences to have a name lookup
				const { data: competencesData, error: competencesError } = await supabase
					.from('competences')
					.select('id, name')

				if (competencesError) {
					console.error("Error fetching competences:", competencesError)
					return
				}

				// Create a lookup map for competence names
				const competencesMap = new Map<string, string>()
				competencesData?.forEach((comp: Competence) => {
					competencesMap.set(comp.id, comp.name)
				})

				// Now fetch the job_family_competences relationships
				const { data: relationshipsData, error: relationshipsError } = await supabase
					.from('job_family_competences')
					.select('job_family_id, competence_id, importance_level')
					.in('job_family_id', jobFamilies.map(f => f.id))
					.order('importance_level', { ascending: false })

				if (relationshipsError) {
					console.error("Error fetching competence relationships:", relationshipsError)
					return
				}

				// Group competences by job family
				const competencesByFamily: Record<string, string[]> = {}

				relationshipsData?.forEach(item => {
					const competenceName = competencesMap.get(item.competence_id)
					if (!competenceName) return

					if (!competencesByFamily[item.job_family_id]) {
						competencesByFamily[item.job_family_id] = []
					}

					competencesByFamily[item.job_family_id].push(competenceName)
				})

				setFamilyCompetences(competencesByFamily)
			} catch (error) {
				console.error("Error in competences fetch:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchCompetences()
	}, [jobFamilies])

	// Department color styles
	const getDepartmentColor = (department: string): string => {
		switch (department) {
			case "People&":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
			case "Product & Technology":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
			case "Commercial":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
			default:
				return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
		}
	}

	// Fallback competences if needed
	const FALLBACK_COMPETENCES: Record<string, string[]> = {
		"business-partnering": ["Forming Judgment", "Problem Analysis", "Organisation Sensitivity"],
		"business-analysis": ["Problem Analysis", "Forming Judgment", "Planning & Organising"],
		"product-management": ["Adaptability", "Innovative Power", "Result-Orientedness"],
		"buying": ["Decisiveness", "Problem Analysis", "Cooperation"],
		"commercial-partnering": ["Problem Analysis", "Innovative Power", "Persuasiveness"],
		"commercial-expertise": ["Insight", "Focus on Quality", "Cooperation"]
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{jobFamilies.length > 0 ? (
				jobFamilies.map((family) => {
					// Use database competences if available, otherwise fallback
					const competences = isLoading || !familyCompetences[family.id]
						? (FALLBACK_COMPETENCES[family.id.includes('-') ? family.id : family.name.toLowerCase().replace(/\s+/g, '-')] || [])
						: familyCompetences[family.id];

					return (
						<Link href={`/job-family/${family.id}`} key={family.id}>
							<Card className="group h-full cursor-pointer p-6 transition-all hover:shadow-md">
								<div className="mb-2 flex justify-between">
									<Briefcase className="h-5 w-5 text-primary" />
									<Badge
										variant="outline"
										className={getDepartmentColor(family.department)}
									>
										{family.department}
									</Badge>
								</div>

								<h2 className="text-lg font-semibold group-hover:text-primary">{family.name}</h2>

								<p className="mb-4 mt-2 text-sm text-muted-foreground line-clamp-2">
									{family.description}
								</p>

								{competences.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{competences.slice(0, 2).map((competence) => (
											<Badge key={competence} variant="secondary">
												{competence}
											</Badge>
										))}
										{competences.length > 2 && (
											<Badge variant="secondary">
												+{competences.length - 2} more
											</Badge>
										)}
									</div>
								)}

								<div className="mt-4 flex items-center justify-end text-sm text-primary">
									View details
									<ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
								</div>
							</Card>
						</Link>
					);
				})
			) : (
				<div className="col-span-full p-8 text-center">
					<p className="text-lg font-medium">No job families found</p>
					<p className="text-muted-foreground">
						Try adjusting your search or filter criteria
					</p>
				</div>
			)}
		</div>
	)
}
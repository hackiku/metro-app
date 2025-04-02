// src/app/job-family/[id]/RelatedFamiliesSection.tsx
"use client"

import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { ChevronRight, Briefcase, ArrowRight } from "lucide-react"
import Link from "next/link"

interface JobFamily {
	id: string
	name: string
	description: string
	department: string
}

interface RelatedFamiliesSectionProps {
	relatedFamilies: JobFamily[]
	relationshipType?: "department" | "career-path" | "skills"
}

export function RelatedFamiliesSection({
	relatedFamilies,
	relationshipType = "department"
}: RelatedFamiliesSectionProps) {
	// Get relationship description
	const getRelationshipDescription = () => {
		switch (relationshipType) {
			case "department":
				return "Other job families in the same department"
			case "career-path":
				return "Common career transitions from this job family"
			case "skills":
				return "Job families with similar competence requirements"
			default:
				return "Related job families you might be interested in"
		}
	}

	if (relatedFamilies.length === 0) {
		return null
	}

	return (
		<div>
			<h2 className="mb-2 text-xl font-semibold">Related Job Families</h2>
			<p className="mb-4 text-sm text-muted-foreground">
				{getRelationshipDescription()}
			</p>

			<div className="grid gap-4 md:grid-cols-3">
				{relatedFamilies.map((family) => (
					<Link href={`/job-family/${family.id}`} key={family.id}>
						<Card className="group h-full cursor-pointer p-5 transition-all hover:shadow-md">
							<div className="mb-2 flex items-start justify-between">
								<h3 className="font-medium group-hover:text-primary">{family.name}</h3>
								<Badge
									variant="outline"
									className="text-xs"
								>
									{family.department}
								</Badge>
							</div>

							<p className="mb-3 text-sm text-muted-foreground line-clamp-2">
								{family.description}
							</p>

							<div className="mt-auto flex items-center justify-end text-xs text-primary">
								View details
								<ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
							</div>
						</Card>
					</Link>
				))}
			</div>

			<div className="mt-4 flex justify-center">
				<Link
					href="/job-family"
					className="flex items-center text-sm text-muted-foreground hover:text-primary"
				>
					View all job families
					<ArrowRight className="ml-1 h-3 w-3" />
				</Link>
			</div>
		</div>
	)
}
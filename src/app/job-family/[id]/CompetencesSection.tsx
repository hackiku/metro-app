// src/app/job-family/[id]/CompetencesSection.tsx
"use client"

import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Book, Brain, Users, Target } from "lucide-react"
import Link from "next/link"

interface Competence {
	id: string
	name: string
	description?: string
	category?: string
}

interface CompetencesSectionProps {
	competences: Competence[]
}

export function CompetencesSection({ competences }: CompetencesSectionProps) {
	// Group competences by category if available
	const groupedCompetences: Record<string, Competence[]> = {}

	competences.forEach(comp => {
		const category = comp.category || "General"
		if (!groupedCompetences[category]) {
			groupedCompetences[category] = []
		}
		groupedCompetences[category].push(comp)
	})

	// Get icon for competence category
	const getCategoryIcon = (category: string) => {
		switch (category.toLowerCase()) {
			case "cognitive":
				return <Brain className="h-4 w-4" />
			case "interpersonal":
				return <Users className="h-4 w-4" />
			case "execution":
				return <Target className="h-4 w-4" />
			default:
				return <Book className="h-4 w-4" />
		}
	}

	return (
		<Card className="p-6">
			<h2 className="text-xl font-semibold">Required Competences</h2>
			<p className="text-sm text-muted-foreground">
				Key skills and competences required for success in this role
			</p>

			{competences.length > 0 ? (
				<div className="mt-4 space-y-6">
					{Object.entries(groupedCompetences).length > 1 ? (
						// Display by category if multiple categories exist
						Object.entries(groupedCompetences).map(([category, comps]) => (
							<div key={category}>
								<h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
									{getCategoryIcon(category)}
									{category}
								</h3>
								<div className="flex flex-wrap gap-2">
									{comps.map(comp => (
										<Link
											href={`/competence/${comp.id}`}
											key={comp.id}
											className="group"
										>
											<Badge
												variant="secondary"
												className="px-3 py-1 text-sm transition-colors group-hover:bg-primary/10 group-hover:text-primary"
											>
												{comp.name}
											</Badge>
										</Link>
									))}
								</div>
							</div>
						))
					) : (
						// Simple display if no categories or just one
						<div className="flex flex-wrap gap-2">
							{competences.map(comp => (
								<Link
									href={`/competence/${comp.id}`}
									key={comp.id}
									className="group"
								>
									<Badge
										variant="secondary"
										className="px-3 py-1 text-sm transition-colors group-hover:bg-primary/10 group-hover:text-primary"
									>
										{comp.name}
									</Badge>
								</Link>
							))}
						</div>
					)}

					<div className="pt-2 text-xs text-muted-foreground">
						Click on any competence to see its development activities and learning resources
					</div>
				</div>
			) : (
				<div className="mt-4 flex items-center justify-center rounded-md bg-muted/50 p-6 text-center">
					<p className="text-muted-foreground">No competences found for this job family.</p>
				</div>
			)}
		</Card>
	)
}
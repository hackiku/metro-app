// ~/app/competences/CompetenceGrid.tsx
"use client"

import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { Brain, Users, Target, BookOpen, ArrowUpRight, Briefcase } from "lucide-react"
import Link from "next/link"
import { type Competence } from "./page"

interface CompetenceGridProps {
	competences: Competence[]
	isLoading: boolean
}

export function CompetenceGrid({ competences, isLoading }: CompetenceGridProps) {
	// Get icon based on category
	const getCategoryIcon = (category?: string) => {
		switch (category?.toLowerCase()) {
			case "cognitive":
				return <Brain className="h-5 w-5" />
			case "interpersonal":
				return <Users className="h-5 w-5" />
			case "execution":
				return <Target className="h-5 w-5" />
			default:
				return <Briefcase className="h-5 w-5" />
		}
	}

	// Get sample job families based on competence (would come from database in real app)
	const getRelatedJobFamilies = (competenceId: string) => {
		const families = {
			'problem-analysis': ["Business Analysis", "Business Partnering", "Product Management"],
			'cooperation': ["Business Analysis", "Commercial Expertise", "Commercial Partnering"],
			'result-orientedness': ["Business Analysis", "Product Management", "Commercial Expertise"],
			'planning-organising': ["Business Analysis", "Business Partnering", "Commercial Partnering"],
			'persuasiveness': ["Business Partnering", "Commercial Partnering", "Buying"],
			'innovative-power': ["Product Management", "Business Analysis", "Commercial Expertise"],
			'forming-judgment': ["Business Partnering", "Business Analysis", "Buying"]
		} as Record<string, string[]>;

		// For demo purposes, use a deterministic but random-looking approach
		const hash = competenceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const allFamilies = [
			"Business Analysis", "Business Partnering", "Product Management",
			"Commercial Expertise", "Commercial Partnering", "Buying"
		];

		// Either use predefined families or generate some based on the ID
		return families[competenceId] || [
			allFamilies[hash % 6],
			allFamilies[(hash + 2) % 6],
			allFamilies[(hash + 4) % 6]
		];
	};

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="h-72 animate-pulse rounded-lg bg-muted" />
				))}
			</div>
		);
	}

	if (competences.length === 0) {
		return (
			<div className="flex items-center justify-center rounded-lg border p-8 text-center">
				<div>
					<h3 className="text-lg font-medium">No competences found</h3>
					<p className="mt-2 text-muted-foreground">
						Try adjusting your search criteria or selecting a different category.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{competences.map((competence) => (
				<Card key={competence.id} className="flex flex-col">
					<div className="flex items-start justify-between border-b p-4">
						<div className="flex items-center">
							<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
								{getCategoryIcon(competence.category)}
							</div>
							<div>
								<h3 className="font-medium">{competence.name}</h3>
								<p className="text-sm text-muted-foreground">{competence.category}</p>
							</div>
						</div>
						<Link href={`/competences/${competence.id}`}>
							<Button variant="ghost" size="sm" className="rounded-full">
								<ArrowUpRight className="h-4 w-4" />
							</Button>
						</Link>
					</div>

					<div className="flex-1 p-4">
						<p className="mb-4 text-sm text-muted-foreground line-clamp-3">
							{competence.description}
						</p>

						<div className="mb-1 flex items-center justify-between">
							<span className="text-sm font-medium">Your proficiency</span>
							<span className="text-sm font-medium">{competence.userRating}%</span>
						</div>
						<Progress
							value={competence.userRating}
							className="mb-4 h-2"
						/>

						<div className="space-y-1 text-sm text-muted-foreground">
							<div className="flex flex-wrap gap-1">
								<span className="text-xs font-medium">Related job families:</span>
								<div className="flex flex-wrap gap-1">
									{getRelatedJobFamilies(competence.id).map((family, index) => (
										<span
											key={index}
											className="text-xs font-medium text-primary"
										>
											{family}{index < getRelatedJobFamilies(competence.id).length - 1 ? ", " : ""}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="border-t p-4">
						<Button variant="outline" className="w-full" asChild>
							<Link href={`/competences/${competence.id}`}>
								<BookOpen className="mr-2 h-4 w-4" />
								View Development Guide
							</Link>
						</Button>
					</div>
				</Card>
			))}
		</div>
	)
}
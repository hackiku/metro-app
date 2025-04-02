// ~/app/competences/[id]/CompetenceHeader.tsx
"use client"

import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Button } from "~/components/ui/button"
import { Brain, Users, Target, Briefcase, ArrowRight, LineChart } from "lucide-react"

interface Competence {
	id: string
	name: string
	description: string
	category?: string
	userRating?: number
}

interface CompetenceHeaderProps {
	competence: Competence
}

export function CompetenceHeader({ competence }: CompetenceHeaderProps) {
	// Get icon based on category
	const getCategoryIcon = (category?: string) => {
		switch (category?.toLowerCase()) {
			case "cognitive":
				return <Brain className="h-6 w-6" />
			case "interpersonal":
				return <Users className="h-6 w-6" />
			case "execution":
				return <Target className="h-6 w-6" />
			default:
				return <Briefcase className="h-6 w-6" />
		}
	}

	// Get rating level description
	const getRatingDescription = (rating?: number) => {
		if (!rating) return "Not assessed";

		if (rating >= 80) return "Expert";
		if (rating >= 65) return "Proficient";
		if (rating >= 50) return "Intermediate";
		if (rating >= 30) return "Basic";
		return "Beginner";
	}

	// Get example behaviors based on competence category
	const getExampleBehaviors = (competence: Competence) => {
		// In a real app, these would come from a database
		const cognitiveExamples = [
			"Methodically breaks complex problems into manageable parts",
			"Identifies patterns and connections between different data points",
			"Considers multiple solutions before making decisions"
		];

		const interpersonalExamples = [
			"Actively listens and responds constructively to others' ideas",
			"Builds consensus among team members with different perspectives",
			"Communicates complex information clearly to various audiences"
		];

		const executionExamples = [
			"Sets clear, specific and measurable goals for projects",
			"Prioritizes tasks effectively to meet deadlines",
			"Adjusts approaches when faced with obstacles"
		];

		// Return examples based on category
		switch (competence.category?.toLowerCase()) {
			case "cognitive":
				return cognitiveExamples;
			case "interpersonal":
				return interpersonalExamples;
			case "execution":
				return executionExamples;
			default:
				// Generate generic examples
				return [
					`Demonstrates effective ${competence.name} in various situations`,
					`Applies ${competence.name} principles appropriately to work challenges`,
					`Continuously improves ${competence.name} through practice and feedback`
				];
		}
	}

	return (
		<Card className="p-6">
			<div className="grid gap-6 md:grid-cols-3">
				<div className="md:col-span-2">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
							{getCategoryIcon(competence.category)}
						</div>
						<div>
							<h1 className="text-2xl font-bold">{competence.name}</h1>
							<Badge variant="outline" className="mt-1">
								{competence.category || "General"}
							</Badge>
						</div>
					</div>

					<p className="mt-4 text-muted-foreground">
						{competence.description}
					</p>

					<div className="mt-6">
						<h3 className="text-sm font-medium">Example behaviors:</h3>
						<ul className="mt-2 space-y-2">
							{getExampleBehaviors(competence).map((behavior, index) => (
								<li key={index} className="flex items-start">
									<div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
									<span className="text-sm text-muted-foreground">{behavior}</span>
								</li>
							))}
						</ul>
					</div>

					<div className="mt-6 flex flex-wrap gap-3">
						<Button>
							Start Assessment
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
						<Button variant="outline">
							Add to Development Plan
						</Button>
					</div>
				</div>

				<div className="flex flex-col justify-center">
					<div className="rounded-lg border p-4">
						<h3 className="text-sm font-medium">Your proficiency</h3>

						<div className="mt-6 flex h-40 items-center justify-center">
							<div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-primary/10">
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="text-3xl font-bold">{competence.userRating}%</span>
								</div>
								<div className="absolute bottom-[-2rem] text-center text-sm">
									<span className="font-medium text-primary">{getRatingDescription(competence.userRating)}</span>
								</div>
							</div>
						</div>

						<div className="mt-8 text-center">
							<Button variant="ghost" size="sm" className="text-muted-foreground">
								<LineChart className="mr-1 h-4 w-4" />
								View Progress History
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Card>
	)
}
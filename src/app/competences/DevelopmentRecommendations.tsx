// ~/app/competences/DevelopmentRecommendations.tsx
"use client"

import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Award, Briefcase, Lightbulb, Brain, Users, Target } from "lucide-react"
import Link from "next/link"
import { type Competence } from "./page"

interface DevelopmentRecommendationsProps {
	competences: Competence[]
	isLoading: boolean
}

// Development activity types
const ACTIVITY_TYPES = ["On the Job", "Social", "Formal"];

export function DevelopmentRecommendations({ competences, isLoading }: DevelopmentRecommendationsProps) {
	// Get the competences with lowest ratings (growth areas)
	const growthAreas = [...competences]
		.sort((a, b) => (a.userRating || 0) - (b.userRating || 0))
		.slice(0, 3);

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

	// Generate development activities based on competence (would come from database in real app)
	const getDevelopmentActivities = (competence: Competence) => {
		// Some example activities based on competence category
		const cognitiveActivities = [
			{ type: "On the Job", description: "Lead a complex problem-solving workshop" },
			{ type: "Social", description: "Shadow senior analysts during problem investigation" },
			{ type: "Formal", description: "Complete Advanced Analytics training" }
		];

		const interpersonalActivities = [
			{ type: "On the Job", description: "Lead a cross-functional project team" },
			{ type: "Social", description: "Participate in team-building activities" },
			{ type: "Formal", description: "Take a course on collaborative leadership" }
		];

		const executionActivities = [
			{ type: "On the Job", description: "Set and track measurable goals for a project" },
			{ type: "Social", description: "Join a high-performance team for knowledge sharing" },
			{ type: "Formal", description: "Complete project management certification" }
		];

		// Return activities based on category
		switch (competence.category?.toLowerCase()) {
			case "cognitive":
				return cognitiveActivities;
			case "interpersonal":
				return interpersonalActivities;
			case "execution":
				return executionActivities;
			default:
				// Create random but deterministic activities if no category
				const hash = competence.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
				return [
					{
						type: ACTIVITY_TYPES[hash % 3],
						description: `Activity for improving ${competence.name}`
					},
					{
						type: ACTIVITY_TYPES[(hash + 1) % 3],
						description: `Practice ${competence.name} in different contexts`
					},
					{
						type: ACTIVITY_TYPES[(hash + 2) % 3],
						description: `Learn advanced techniques for ${competence.name}`
					}
				];
		}
	};

	return (
		<Card className="p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Recommended Development Activities</h2>
				<Button variant="outline" size="sm">
					View All
				</Button>
			</div>

			{isLoading ? (
				<div className="mt-6 space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
					))}
				</div>
			) : growthAreas.length > 0 ? (
				<div className="mt-6 space-y-4">
					{growthAreas.map((competence) => (
						<Card key={competence.id} className="p-4">
							<div className="mb-4 flex items-center justify-between">
								<div className="flex items-center">
									<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
										{getCategoryIcon(competence.category)}
									</div>
									<Link href={`/competences/${competence.id}`} className="hover:text-primary">
										<h3 className="font-medium">{competence.name}</h3>
									</Link>
								</div>
								<div className="flex items-center">
									<Award className="mr-1 h-4 w-4 text-amber-500" />
									<span className="text-sm">{competence.userRating}%</span>
								</div>
							</div>

							<div className="space-y-2">
								{getDevelopmentActivities(competence).map((activity, index) => (
									<div key={index} className="flex items-start">
										<Lightbulb className="mr-2 mt-0.5 h-4 w-4 text-primary" />
										<div>
											<span className="font-medium">{activity.type}:</span>
											<span className="ml-1 text-muted-foreground">{activity.description}</span>
										</div>
									</div>
								))}
							</div>

							<div className="mt-3 text-right">
								<Button variant="ghost" size="sm" asChild>
									<Link href={`/competences/${competence.id}`}>
										View more activities
									</Link>
								</Button>
							</div>
						</Card>
					))}
				</div>
			) : (
				<div className="mt-6 flex items-center justify-center rounded-lg border p-6 text-center">
					<div>
						<p className="text-muted-foreground">
							Complete your competence assessment to get personalized recommendations.
						</p>
					</div>
				</div>
			)}
		</Card>
	)
}
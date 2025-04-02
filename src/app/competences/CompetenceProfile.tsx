// ~/app/competences/CompetenceProfile.tsx
"use client"

import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Activity, ClipboardList, TrendingUp, Calendar } from "lucide-react"
import { type Competence } from "./page"

interface CompetenceProfileProps {
	competences: Competence[]
	isLoading: boolean
}

export function CompetenceProfile({ competences, isLoading }: CompetenceProfileProps) {
	// Calculate overall score (average of all competence ratings)
	const overallScore = competences.length > 0
		? Math.round(competences.reduce((acc, comp) => acc + (comp.userRating || 0), 0) / competences.length)
		: 0;

	// Find strongest competence
	const strongestCompetence = [...competences].sort((a, b) =>
		(b.userRating || 0) - (a.userRating || 0)
	)[0];

	// Find competence needing most improvement
	const growthCompetence = [...competences].sort((a, b) =>
		(a.userRating || 0) - (b.userRating || 0)
	)[0];

	return (
		<Card className="p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Your Competence Profile</h2>
				<Button variant="outline" size="sm">
					View Full Assessment
				</Button>
			</div>

			<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{isLoading ? (
					// Loading skeletons
					Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
					))
				) : (
					// Actual content
					<>
						<Card className="p-4">
							<div className="flex items-start">
								<Activity className="mr-2 h-5 w-5 text-primary" />
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">Overall Score</h3>
									<div className="mt-1 flex items-end">
										<span className="text-2xl font-bold">{overallScore}%</span>
										<span className="ml-2 text-xs text-emerald-500">+4% from last year</span>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-start">
								<TrendingUp className="mr-2 h-5 w-5 text-primary" />
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">Strongest Area</h3>
									<div className="mt-1">
										<span className="text-lg font-bold">{strongestCompetence?.name || "N/A"}</span>
										<p className="text-xs text-muted-foreground">
											{strongestCompetence ? `${strongestCompetence.userRating}% proficiency` : "No data available"}
										</p>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-start">
								<ClipboardList className="mr-2 h-5 w-5 text-primary" />
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">Growth Area</h3>
									<div className="mt-1">
										<span className="text-lg font-bold">{growthCompetence?.name || "N/A"}</span>
										<p className="text-xs text-muted-foreground">
											{growthCompetence ? `${growthCompetence.userRating}% proficiency` : "No data available"}
										</p>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-start">
								<Calendar className="mr-2 h-5 w-5 text-primary" />
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">Assessment Status</h3>
									<div className="mt-1">
										<span className="text-lg font-bold">Up to date</span>
										<p className="text-xs text-muted-foreground">Last updated 2 months ago</p>
									</div>
								</div>
							</div>
						</Card>
					</>
				)}
			</div>
		</Card>
	)
}
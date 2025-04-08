// src/app/_components/metro/development/JourneyCard.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Briefcase, Users, BookOpen } from "lucide-react"
import type { DevelopmentJourney } from "../types/development"

interface JourneyCardProps {
	journey: DevelopmentJourney
	className?: string
}

export function JourneyCard({ journey, className = "" }: JourneyCardProps) {
	// Group development steps by type (70/20/10 model)
	const onTheJobActivities = journey.developmentSteps.filter(step =>
		step.type === "onTheJob"
	)
	const socialLearningActivities = journey.developmentSteps.filter(step =>
		step.type === "socialLearning"
	)
	const formalLearningActivities = journey.developmentSteps.filter(step =>
		step.type === "formalLearning"
	)

	// If no development steps are available, show demo data
	const hasRealData = journey.developmentSteps.length > 0

	// Default development steps if none provided
	const defaultOnTheJob = [
		{
			id: "demo-1",
			name: "Take ownership of small, project-based initiatives",
			description: "Lead small projects within your current team to develop project management skills",
			type: "onTheJob" as const,
			durationWeeks: 12
		},
		{
			id: "demo-2",
			name: "Lead retrospectives or sprint planning",
			description: "Analyze delivery gaps and improve team processes",
			type: "onTheJob" as const,
			durationWeeks: 4
		}
	]

	const defaultSocialLearning = [
		{
			id: "demo-3",
			name: "Find a mentor within the Project Management job family",
			description: "Learn from experienced project managers through regular mentoring sessions",
			type: "socialLearning" as const,
			durationWeeks: 24
		},
		{
			id: "demo-4",
			name: "Join intervision groups with project managers",
			description: "Participate in peer learning to develop project management skills",
			type: "socialLearning" as const,
			durationWeeks: 12
		}
	]

	const defaultFormalLearning = [
		{
			id: "demo-5",
			name: "Attend 'project-based working' training",
			description: "Learn structured project management approaches and methodologies",
			type: "formalLearning" as const,
			durationWeeks: 2
		}
	]

	// Use real data or fallback to demo data
	const displayOnTheJob = onTheJobActivities.length > 0 ? onTheJobActivities : defaultOnTheJob
	const displaySocialLearning = socialLearningActivities.length > 0 ? socialLearningActivities : defaultSocialLearning
	const displayFormalLearning = formalLearningActivities.length > 0 ? formalLearningActivities : defaultFormalLearning

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Development Activities</CardTitle>
				{!hasRealData && (
					<p className="text-sm text-muted-foreground">
						Example development activities based on the 70/20/10 model
					</p>
				)}

				{/* Competency gaps */}
				{journey.competencyGaps.length > 0 && (
					<div className="mt-4">
						<h4 className="mb-2 text-sm font-medium">Key Skills to Develop</h4>
						<div className="flex flex-wrap gap-2">
							{journey.competencyGaps.map(gap => (
								<Badge key={gap.skillId} variant="secondary">
									{gap.skillName} ({gap.currentLevel} → {gap.requiredLevel})
								</Badge>
							))}
						</div>
					</div>
				)}
			</CardHeader>

			<CardContent>
				<Tabs defaultValue="onTheJob">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="onTheJob" className="flex items-center gap-2">
							<Briefcase className="h-4 w-4" />
							<span className="hidden sm:inline">On the Job (70%)</span>
							<span className="sm:hidden">70%</span>
						</TabsTrigger>
						<TabsTrigger value="socialLearning" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							<span className="hidden sm:inline">Social Learning (20%)</span>
							<span className="sm:hidden">20%</span>
						</TabsTrigger>
						<TabsTrigger value="formalLearning" className="flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							<span className="hidden sm:inline">Formal Learning (10%)</span>
							<span className="sm:hidden">10%</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="onTheJob" className="mt-4 space-y-4">
						{displayOnTheJob.map(activity => (
							<ActivityCard
								key={activity.id}
								activity={activity}
								type="onTheJob"
							/>
						))}
					</TabsContent>

					<TabsContent value="socialLearning" className="mt-4 space-y-4">
						{displaySocialLearning.map(activity => (
							<ActivityCard
								key={activity.id}
								activity={activity}
								type="socialLearning"
							/>
						))}
					</TabsContent>

					<TabsContent value="formalLearning" className="mt-4 space-y-4">
						{displayFormalLearning.map(activity => (
							<ActivityCard
								key={activity.id}
								activity={activity}
								type="formalLearning"
							/>
						))}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}

// Helper component for activity cards
function ActivityCard({
	activity,
	type
}: {
	activity: { id: string; name: string; description: string; durationWeeks: number }
	type: "onTheJob" | "socialLearning" | "formalLearning"
}) {
	// Set icon based on type
	let Icon = Briefcase
	if (type === "socialLearning") Icon = Users
	if (type === "formalLearning") Icon = BookOpen

	return (
		<div className="rounded-lg border bg-card p-4 shadow-sm">
			<div className="flex items-start gap-3">
				<div className="mt-1 rounded-full bg-primary/10 p-2">
					<Icon className="h-4 w-4 text-primary" />
				</div>
				<div className="flex-1">
					<h4 className="text-sm font-medium">{activity.name}</h4>
					<p className="mt-1 text-xs text-muted-foreground">{activity.description}</p>
					<div className="mt-3 flex items-center gap-2">
						<div className="text-xs text-muted-foreground">Duration: {activity.durationWeeks} weeks</div>
						<Progress value={0} className="h-1 flex-1" />
						<div className="text-xs font-medium">0%</div>
					</div>
				</div>
			</div>
		</div>
	)
}
// src/app/_components/metro/development/DevelopmentModal.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Briefcase, Users, BookOpen, Star, ArrowRight } from "lucide-react"
import type { MetroStation } from "../types/metro"
import type { DevelopmentStep, CompetencyGap } from "../types/development"
import { fetchDevelopmentPath, fetchDevelopmentSteps, fetchCompetencyGaps } from "../services/developmentService"

interface DevelopmentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentStation: MetroStation | null;
	targetStation: MetroStation | null;
	schema?: string;
}

export function DevelopmentModal({
	open,
	onOpenChange,
	currentStation,
	targetStation,
	schema = 'gasunie'
}: DevelopmentModalProps) {
	const [developmentSteps, setDevelopmentSteps] = useState<DevelopmentStep[]>([])
	const [competencyGaps, setCompetencyGaps] = useState<CompetencyGap[]>([])
	const [estimatedMonths, setEstimatedMonths] = useState(0)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		async function fetchDevelopmentData() {
			if (!currentStation || !targetStation || currentStation.id === targetStation.id) {
				return;
			}

			setIsLoading(true);
			try {
				// Fetch development path
				const path = await fetchDevelopmentPath(currentStation.id, targetStation.id, schema);

				if (path) {
					// Set estimated months
					setEstimatedMonths(path.estimatedMonths);

					// Fetch development steps
					const steps = await fetchDevelopmentSteps(path.id, schema);
					setDevelopmentSteps(steps);
				} else {
					// If no direct path, provide sample data
					setEstimatedMonths(12);
					setDevelopmentSteps(getSampleDevelopmentSteps());
				}

				// Fetch competency gaps
				const gaps = await fetchCompetencyGaps(currentStation.id, targetStation.id, schema);
				setCompetencyGaps(gaps.length > 0 ? gaps : getSampleCompetencyGaps());

			} catch (error) {
				console.error("Error fetching development data:", error);
				// Set sample data as fallback
				setDevelopmentSteps(getSampleDevelopmentSteps());
				setCompetencyGaps(getSampleCompetencyGaps());
				setEstimatedMonths(12);
			} finally {
				setIsLoading(false);
			}
		}

		if (open) {
			fetchDevelopmentData();
		}
	}, [open, currentStation, targetStation, schema]);

	// Group development steps by type
	const onTheJobActivities = developmentSteps.filter(step => step.type === "onTheJob");
	const socialLearningActivities = developmentSteps.filter(step => step.type === "socialLearning");
	const formalLearningActivities = developmentSteps.filter(step => step.type === "formalLearning");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				{isLoading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
						<span className="ml-2">Loading development path...</span>
					</div>
				) : currentStation && targetStation ? (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center text-xl">
								Development Path
								<Badge className="ml-3" variant="outline">
									~{estimatedMonths} months
								</Badge>
							</DialogTitle>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<div className="font-medium">{currentStation.name}</div>
								<ArrowRight className="h-4 w-4" />
								<div className="font-medium">{targetStation.name}</div>
							</div>
						</DialogHeader>

						<div className="space-y-6">
							{/* Competency gaps section */}
							<Card className="p-4">
								<h3 className="mb-3 font-medium">Key Skills to Develop</h3>
								<div className="flex flex-wrap gap-2">
									{competencyGaps.map(gap => (
										<div key={gap.skillId} className="flex items-center rounded-md bg-muted p-2">
											<Star className="mr-2 h-4 w-4 text-amber-500" />
											<div>
												<div className="text-sm font-medium">{gap.skillName}</div>
												<div className="text-xs text-muted-foreground">
													Level {gap.currentLevel} → {gap.requiredLevel}
												</div>
											</div>
										</div>
									))}
								</div>
							</Card>

							{/* Development steps section */}
							<Tabs defaultValue="onTheJob" className="w-full">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="onTheJob" className="flex items-center gap-2">
										<Briefcase className="h-4 w-4" />
										<span>On the Job (70%)</span>
									</TabsTrigger>
									<TabsTrigger value="socialLearning" className="flex items-center gap-2">
										<Users className="h-4 w-4" />
										<span>Social Learning (20%)</span>
									</TabsTrigger>
									<TabsTrigger value="formalLearning" className="flex items-center gap-2">
										<BookOpen className="h-4 w-4" />
										<span>Formal Learning (10%)</span>
									</TabsTrigger>
								</TabsList>

								<TabsContent value="onTheJob" className="mt-4 space-y-4">
									{onTheJobActivities.map(activity => (
										<ActivityCard
											key={activity.id}
											activity={activity}
											type="onTheJob"
										/>
									))}
								</TabsContent>

								<TabsContent value="socialLearning" className="mt-4 space-y-4">
									{socialLearningActivities.map(activity => (
										<ActivityCard
											key={activity.id}
											activity={activity}
											type="socialLearning"
										/>
									))}
								</TabsContent>

								<TabsContent value="formalLearning" className="mt-4 space-y-4">
									{formalLearningActivities.map(activity => (
										<ActivityCard
											key={activity.id}
											activity={activity}
											type="formalLearning"
										/>
									))}
								</TabsContent>
							</Tabs>

							{/* Action buttons */}
							<div className="flex justify-end space-x-2">
								<Button variant="outline" onClick={() => onOpenChange(false)}>
									Close
								</Button>
								<Button>Set as Career Goal</Button>
							</div>
						</div>
					</>
				) : (
					<div className="flex flex-col items-center justify-center p-8 text-center">
						<p className="text-muted-foreground">
							Select a starting and destination station to view development path
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

// Helper component for activity cards
function ActivityCard({
	activity,
	type
}: {
	activity: DevelopmentStep;
	type: "onTheJob" | "socialLearning" | "formalLearning";
}) {
	// Set icon based on type
	let Icon = Briefcase;
	if (type === "socialLearning") Icon = Users;
	if (type === "formalLearning") Icon = BookOpen;

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
					</div>
				</div>
			</div>
		</div>
	);
}

// Sample data for fallback
function getSampleDevelopmentSteps(): DevelopmentStep[] {
	return [
		{
			id: "sample-1",
			name: "Take ownership of small project initiatives",
			description: "Lead small projects within your current team to develop project management skills",
			type: "onTheJob",
			durationWeeks: 12
		},
		{
			id: "sample-2",
			name: "Find a mentor in the target role",
			description: "Learn from experienced professionals through regular mentoring sessions",
			type: "socialLearning",
			durationWeeks: 24
		},
		{
			id: "sample-3",
			name: "Attend formal training in required skills",
			description: "Complete courses to develop the technical skills needed for the role",
			type: "formalLearning",
			durationWeeks: 4
		}
	];
}

function getSampleCompetencyGaps(): CompetencyGap[] {
	return [
		{
			skillId: "sample-skill-1",
			skillName: "Project Management",
			currentLevel: 2,
			requiredLevel: 4,
			gap: 2
		},
		{
			skillId: "sample-skill-2",
			skillName: "Stakeholder Management",
			currentLevel: 1,
			requiredLevel: 3,
			gap: 2
		}
	];
}
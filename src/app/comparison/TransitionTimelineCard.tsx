// src/app/comparison/TransitionTimelineCard.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowRight, Check, Clock } from "lucide-react";
import { useCareerPlan } from "~/contexts/CareerPlanContext";
import { Skeleton } from "~/components/ui/skeleton";

interface TransitionTimelineCardProps {
	currentPosition: any;
	targetPosition: any;
}

export function TransitionTimelineCard({
	currentPosition,
	targetPosition
}: TransitionTimelineCardProps) {
	const { createPlan } = useCareerPlan();

	// Check if we have valid data
	if (!currentPosition || !targetPosition) {
		return (
			<Card className="shadow-sm dark:bg-card">
				<CardHeader>
					<CardTitle className="text-lg">Transition Timeline</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<Skeleton className="h-4 w-3/4 mb-3" />
							<Skeleton className="h-4 w-full mb-3" />
							<Skeleton className="h-16 w-full rounded-lg" />
						</div>
						<div>
							<Skeleton className="h-4 w-1/2 mb-3" />
							<Skeleton className="h-4 w-full mb-3" />
							<Skeleton className="h-4 w-3/4 mb-3" />
							<Skeleton className="h-4 w-full mb-3" />
						</div>
					</div>
				</CardContent>
				<CardFooter className="pt-2 px-6 pb-6">
					<Skeleton className="h-9 w-full" />
				</CardFooter>
			</Card>
		);
	}

	// Generate transition timeline based on position data
	const transitionTimeline = useMemo(() => {
		// Calculate estimated duration based on level difference
		const currentLevel = parseInt(currentPosition?.level) || 1;
		const targetLevel = parseInt(targetPosition?.level) || 1;
		const levelDiff = Math.abs(targetLevel - currentLevel);

		// Base duration on level difference
		let duration = '6-9 months';
		if (levelDiff >= 2) {
			duration = '12-18 months';
		} else if (levelDiff < 1) {
			duration = '3-6 months';
		}

		// Details for subtitle
		const details = 'with active development';

		// Description
		const description = "Based on your current skills and the requirements for this role, a transition would take:";

		// Generate key development areas based on positions
		const keyDevelopmentAreas = [];

		// Add development area based on whether it's an upward or lateral move
		if (targetLevel > currentLevel) {
			keyDevelopmentAreas.push('Leadership skills and strategic thinking');
			keyDevelopmentAreas.push('Stakeholder management with higher-level teams');
		} else if (targetLevel < currentLevel) {
			keyDevelopmentAreas.push('Technical specialization in ' + (targetPosition?.position?.name || 'this domain'));
			keyDevelopmentAreas.push('Hands-on execution and delivery focus');
		} else {
			keyDevelopmentAreas.push('Cross-functional collaboration skills');
			keyDevelopmentAreas.push('Domain knowledge in new area');
		}

		// Add path-specific skills if they have different paths
		const currentPathId = currentPosition?.career_path?.id;
		const targetPathId = targetPosition?.career_path?.id;

		if (currentPathId && targetPathId && currentPathId !== targetPathId) {
			keyDevelopmentAreas.push(
				`${targetPosition?.career_path?.name || 'New path'} specific knowledge and skills`
			);
		}

		// Always add methodologies as a generic one
		keyDevelopmentAreas.push('Relevant methodologies and tools');

		return {
			duration,
			details,
			description,
			keyDevelopmentAreas
		};
	}, [currentPosition, targetPosition]);

	// Handle the button click
	const handleGoHereClick = () => {
		if (targetPosition?.id) {
			const currentName = currentPosition?.position?.name || "Current Role";
			const targetName = targetPosition?.position?.name || "Target Role";

			createPlan(
				targetPosition.id,
				`Transition plan from ${currentName} to ${targetName}`,
				transitionTimeline.duration
			);
		}
	};

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader>
				<CardTitle className="text-lg">Transition Timeline</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Left Column - Timeline Overview */}
					<div>
						<p className="mb-4 text-sm text-muted-foreground">
							{transitionTimeline.description}
						</p>
						<div className="mb-4 rounded-lg bg-primary/10 p-4 flex items-center gap-4 dark:bg-primary/20">
							<Clock className="h-10 w-10 text-primary flex-shrink-0" />
							<div>
								<p className="text-xl font-bold text-primary">
									{transitionTimeline.duration}
								</p>
								<p className="text-xs text-muted-foreground">
									{transitionTimeline.details}
								</p>
							</div>
						</div>
					</div>

					{/* Right Column - Development Areas */}
					<div>
						<h4 className="mb-2 text-sm font-medium text-foreground">
							Key Development Areas:
						</h4>
						<ul className="space-y-1.5 text-sm text-muted-foreground">
							{transitionTimeline.keyDevelopmentAreas.map((area, index) => (
								<li key={index} className="flex items-start gap-2">
									<Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
									<span>{area}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</CardContent>
			<CardFooter className="pt-2 px-6 pb-6">
				<Button
					className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
					onClick={handleGoHereClick}
				>
					I Want To Go Here
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}
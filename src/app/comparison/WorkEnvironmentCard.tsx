// src/app/comparison/WorkEnvironmentCard.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface WorkEnvironmentDifference {
	id: string;
	currentRoleText: string;
	targetRoleText: string;
}

interface WorkEnvironmentCardProps {
	currentPosition: any;
	targetPosition: any;
}

export function WorkEnvironmentCard({
	currentPosition,
	targetPosition
}: WorkEnvironmentCardProps) {
	// Check if we have valid data
	if (!currentPosition || !targetPosition) {
		return (
			<Card className="shadow-sm dark:bg-card">
				<CardHeader>
					<CardTitle className="text-lg">Work Environment Differences</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-20 w-full mb-4" />
					<Skeleton className="h-20 w-full mb-4" />
					<Skeleton className="h-20 w-full" />
				</CardContent>
			</Card>
		);
	}

	const currentRole = currentPosition?.position?.name || "Current Role";
	const targetRole = targetPosition?.position?.name || "Target Role";

	// Generate work environment differences based on position data
	const workEnvironmentDifferences = useMemo<WorkEnvironmentDifference[]>(() => {
		// Get values from position details if available
		const currentWorkFocus = currentPosition?.work_focus;
		const targetWorkFocus = targetPosition?.work_focus;

		const currentTeamInteraction = currentPosition?.team_interaction;
		const targetTeamInteraction = targetPosition?.team_interaction;

		const currentWorkStyle = currentPosition?.work_style;
		const targetWorkStyle = targetPosition?.work_style;

		// Determine level difference
		const currentLevel = parseInt(currentPosition?.level) || 1;
		const targetLevel = parseInt(targetPosition?.level) || 1;
		const levelDiff = targetLevel - currentLevel;

		// Create differences array
		const differences: WorkEnvironmentDifference[] = [];

		// Add work focus if both available
		if (currentWorkFocus && targetWorkFocus) {
			differences.push({
				id: 'env-1',
				currentRoleText: currentWorkFocus,
				targetRoleText: targetWorkFocus
			});
		} else {
			// Fallback if not available
			differences.push({
				id: 'env-1',
				currentRoleText: levelDiff > 0
					? 'Focused on executing assigned tasks within defined scope'
					: 'Focused on strategic planning and overseeing multiple work streams',
				targetRoleText: levelDiff > 0
					? 'Focused on planning and coordinating work across teams'
					: 'Focused on individual contributions and specialized work'
			});
		}

		// Add team interaction if both available
		if (currentTeamInteraction && targetTeamInteraction) {
			differences.push({
				id: 'env-2',
				currentRoleText: currentTeamInteraction,
				targetRoleText: targetTeamInteraction
			});
		} else {
			// Fallback
			differences.push({
				id: 'env-2',
				currentRoleText: levelDiff > 0
					? 'Work primarily within a single team or department'
					: 'Work across multiple teams and often external stakeholders',
				targetRoleText: levelDiff > 0
					? 'Work embedded with cross-functional teams and stakeholders'
					: 'Work closely with a specialized team'
			});
		}

		// Add work style if both available
		if (currentWorkStyle && targetWorkStyle) {
			differences.push({
				id: 'env-3',
				currentRoleText: currentWorkStyle,
				targetRoleText: targetWorkStyle
			});
		} else {
			// Fallback 
			differences.push({
				id: 'env-3',
				currentRoleText: levelDiff > 0
					? 'Project-based work with defined deliverables'
					: 'Strategic initiatives with evolving requirements',
				targetRoleText: levelDiff > 0
					? 'Program-level work with higher ambiguity'
					: 'Focused projects with clear scope and objectives'
			});
		}

		// Add one more dimension
		differences.push({
			id: 'env-4',
			currentRoleText: levelDiff > 0
				? 'Emphasis on execution quality and timeliness'
				: 'Emphasis on vision, strategy, and team leadership',
			targetRoleText: levelDiff > 0
				? 'Emphasis on insights, planning, and influence'
				: 'Emphasis on technical excellence and specialized skills'
		});

		return differences;
	}, [currentPosition, targetPosition]);

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader>
				<CardTitle className="text-lg">Work Environment Differences</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{workEnvironmentDifferences.map((diff) => (
					<div key={diff.id} className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
						<div className="rounded-md border bg-muted p-3 dark:bg-muted/50">
							<p className="text-muted-foreground">{diff.currentRoleText}</p>
						</div>
						<div className="rounded-md border bg-background p-3 dark:border-neutral-700">
							<p className="text-foreground">{diff.targetRoleText}</p>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
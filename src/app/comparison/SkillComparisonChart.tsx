// src/app/comparison/SkillComparisonChart.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { ColoredProgress } from "~/components/ui/colored-progress";
import * as LucideIcons from "lucide-react";
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import type { ComparisonSkill, GapType, LegendItem } from "./types";

interface SkillComparisonChartProps {
	currentPositionDetail: any;
	targetPositionDetail: any;
	userCompetences: any[];
	targetPositionCompetences: any[];
}

export function SkillComparisonChart({
	currentPositionDetail,
	targetPositionDetail,
	userCompetences,
	targetPositionCompetences
}: SkillComparisonChartProps) {
	// Check if we have valid data
	const hasValidData = !!(
		currentPositionDetail &&
		targetPositionDetail &&
		userCompetences &&
		targetPositionCompetences
	);

	if (!hasValidData) {
		return (
			<Card className="shadow-sm dark:bg-card">
				<CardHeader className="p-6">
					<div className="flex justify-between">
						<div>
							<Skeleton className="h-4 w-32 mb-2" />
							<Skeleton className="h-6 w-48" />
						</div>
						<div className="text-right">
							<Skeleton className="h-4 w-32 mb-2" />
							<Skeleton className="h-6 w-48" />
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-5 p-6 pt-0">
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
				</CardContent>
			</Card>
		);
	}

	// Prepare the comparison data from real data
	const currentRole = currentPositionDetail?.position?.name || currentPositionDetail?.positions?.name || "Current Role";
	const targetRole = targetPositionDetail?.position?.name || targetPositionDetail?.positions?.name || "Target Role";

	// Create skill comparison data based on user competences and target position requirements
	const skills = useMemo(() => {
		const result: ComparisonSkill[] = [];

		try {
			// Create a map of target competence requirements
			const targetCompMap = new Map();
			if (targetPositionCompetences && Array.isArray(targetPositionCompetences)) {
				targetPositionCompetences.forEach(tc => {
					if (tc.competence && tc.competence.id) {
						targetCompMap.set(tc.competence.id, {
							requiredLevel: tc.required_level || 0,
							name: tc.competence.name,
							category: tc.competence.category
						});
					}
				});
			}

			// Process each user competence
			if (userCompetences && Array.isArray(userCompetences)) {
				userCompetences.forEach(uc => {
					if (!uc.competence) return;

					const competenceId = uc.competence.id;
					const name = uc.competence.name || "Unknown Skill";
					const currentLevel = uc.current_level || 0;

					// Get target level from requirements if available
					const targetInfo = targetCompMap.get(competenceId);
					const targetLevel = targetInfo ? targetInfo.requiredLevel : Math.min(5, currentLevel + 1);

					// Remove from map so we know we've processed it
					targetCompMap.delete(competenceId);

					// Determine gap type
					let gapType: GapType = 'no-gap';
					const gap = targetLevel - currentLevel;

					if (gap <= 0) gapType = 'no-gap';
					else if (gap === 1) gapType = 'small-gap';
					else if (gap === 2) gapType = 'medium-gap';
					else if (gap > 2) gapType = 'large-gap';

					result.push({
						id: `skill-${uc.id}`,
						name,
						currentLevel,
						targetLevel,
						gapType
					});
				});
			}

			// Add any remaining target competences that user doesn't have yet
			targetCompMap.forEach((info, id) => {
				result.push({
					id: `skill-target-${id}`,
					name: info.name || "Required Skill",
					currentLevel: 0, // User doesn't have this skill yet
					targetLevel: info.requiredLevel,
					gapType: info.requiredLevel > 2 ? 'large-gap' : 'medium-gap'
				});
			});
		} catch (error) {
			console.error("Error processing competences:", error);
		}

		// If no competences found, add placeholder skills
		if (result.length === 0) {
			const genericSkills = [
				{ name: "Communication", currentLevel: 3, targetLevel: 4 },
				{ name: "Teamwork", currentLevel: 3, targetLevel: 3 },
				{ name: "Problem Solving", currentLevel: 2, targetLevel: 3 },
				{ name: "Technical Skills", currentLevel: 2, targetLevel: 3 },
			];

			genericSkills.forEach((skill, i) => {
				const gap = skill.targetLevel - skill.currentLevel;
				let gapType: GapType = 'no-gap';

				if (gap <= 0) gapType = 'no-gap';
				else if (gap === 1) gapType = 'small-gap';
				else if (gap === 2) gapType = 'medium-gap';
				else if (gap > 2) gapType = 'large-gap';

				result.push({
					id: `generic-skill-${i}`,
					name: skill.name,
					currentLevel: skill.currentLevel,
					targetLevel: skill.targetLevel,
					gapType
				});
			});
		}

		return result;
	}, [userCompetences, targetPositionCompetences]);

	// Define legends
	const gapLegend: LegendItem[] = [
		{ id: 'no-gap', label: 'No Gap', colorClass: 'text-green-500 dark:text-green-400', icon: 'CheckCircle2' },
		{ id: 'small-gap', label: 'Small Gap (3-6 months)', colorClass: 'text-blue-500 dark:text-blue-400', icon: 'Circle' },
		{ id: 'medium-gap', label: 'Medium Gap (6-12 months)', colorClass: 'text-yellow-500 dark:text-yellow-400', icon: 'Circle' },
		{ id: 'large-gap', label: 'Large Gap (12+ months)', colorClass: 'text-red-500 dark:text-red-400', icon: 'AlertCircle' },
	];

	const skillLevelScale: LegendItem[] = [
		{ id: 'level-1', label: '1 - Beginner', colorClass: 'bg-neutral-300 dark:bg-neutral-600' },
		{ id: 'level-2', label: '2 - Basic', colorClass: 'bg-neutral-400 dark:bg-neutral-500' },
		{ id: 'level-3', label: '3 - Intermediate', colorClass: 'bg-neutral-500 dark:bg-neutral-400' },
		{ id: 'level-4', label: '4 - Advanced', colorClass: 'bg-neutral-600 dark:bg-neutral-300' },
		{ id: 'level-5', label: '5 - Expert', colorClass: 'bg-neutral-700 dark:bg-neutral-200' },
	];

	// Helper function to get skill level percentage
	const getSkillPercentage = (level: number): number => {
		return (level / 5) * 100;
	};

	// Component to render gap icon
	const GapIcon = ({ type, className }: { type: string | undefined, className?: string }) => {
		if (!type) return <LucideIcons.Circle className={cn("h-4 w-4", className)} />;

		// Safely check if the icon exists in LucideIcons
		const IconComponent = (type in LucideIcons)
			? LucideIcons[type as keyof typeof LucideIcons] as React.ElementType
			: LucideIcons.Circle;

		return <IconComponent className={cn("h-4 w-4", className)} />;
	};

	// Helper to get gap icon details
	const getGapIconDetails = (gapType: ComparisonSkill['gapType']) => {
		return gapLegend.find(legend => legend.id === gapType) || gapLegend[1];
	};

	// If we have no skills to compare, show a message
	if (skills.length === 0) {
		return (
			<Card className="shadow-sm dark:bg-card">
				<CardHeader className="p-6">
					<div className="flex justify-between">
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Current Role</h3>
							<p className="text-lg font-semibold text-foreground">{currentRole}</p>
						</div>
						<div className="text-right">
							<h3 className="text-sm font-medium text-muted-foreground">Target Role</h3>
							<p className="text-lg font-semibold text-primary">{targetRole}</p>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-6 pt-0 text-center">
					<p className="text-muted-foreground py-12">
						No skills data available for comparison. Update your competences to see a comparison.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader className="p-6">
				<div className="flex justify-between">
					<div>
						<h3 className="text-sm font-medium text-muted-foreground">Current Role</h3>
						<p className="text-lg font-semibold text-foreground">{currentRole}</p>
					</div>
					<div className="text-right">
						<h3 className="text-sm font-medium text-muted-foreground">Target Role</h3>
						<p className="text-lg font-semibold text-primary">{targetRole}</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-5 p-6 pt-0">
				{skills.map((skill) => {
					const gapIconDetails = getGapIconDetails(skill.gapType);
					return (
						<div key={skill.id} className="w-full">
							<div className="mb-1 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<GapIcon type={gapIconDetails.icon} className={gapIconDetails.colorClass} />
									<span className="text-sm font-medium text-foreground">{skill.name}</span>
								</div>
								<div className="text-sm text-muted-foreground">
									{skill.currentLevel} → {skill.targetLevel}
								</div>
							</div>
							<div className="flex items-center gap-3">
								{/* Current Role Progress */}
								<ColoredProgress
									value={getSkillPercentage(skill.currentLevel)}
									className="h-2.5 flex-1"
									indicatorColorClassName="bg-primary" // Current role as primary color
								/>
								{/* Target Role Progress */}
								<ColoredProgress
									value={getSkillPercentage(skill.targetLevel)}
									className="h-2.5 flex-1"
									indicatorColorClassName="bg-sky-500" // Target role distinct color
								/>
							</div>
						</div>
					);
				})}

				{/* Legends */}
				<div className="mt-8 grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2 md:gap-8">
					<div>
						<h4 className="mb-3 text-sm font-medium text-foreground">Gap Legend</h4>
						<div className="space-y-2">
							{gapLegend.map((item) => (
								<div key={item.id} className="flex items-center gap-2">
									<GapIcon type={item.icon} className={item.colorClass} />
									<span className="text-xs text-muted-foreground">{item.label}</span>
								</div>
							))}
						</div>
					</div>
					<div>
						<h4 className="mb-3 text-sm font-medium text-foreground">Skill Level Scale</h4>
						<div className="space-y-2">
							{skillLevelScale.map((item) => (
								<div key={item.id} className="flex items-center gap-2">
									<span className={cn("h-3 w-3 rounded-full", item.colorClass)} />
									<span className="text-xs text-muted-foreground">{item.label}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
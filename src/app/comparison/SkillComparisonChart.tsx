// src/app/comparison/SkillComparisonChart.tsx
"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
// import { Progress } from "~/components/ui/progress"; // Remove old import
import { ColoredProgress } from "~/components/ui/colored-progress"; // Import new component
import * as LucideIcons from "lucide-react";
import {
	comparisonData,
	type ComparisonSkill,
	type LegendItem,
	getSkillPercentage
} from "./data";
import { cn } from "~/lib/utils";

export function SkillComparisonChart() {
	const { currentRole, targetRole, skills, gapLegend, skillLevelScale } = comparisonData;

	const GapIcon = ({ type, className }: { type: LegendItem['icon'], className?: string }) => {
		if (!type) return <LucideIcons.Circle className={cn("h-4 w-4", className)} />;
		const IconComponent = LucideIcons[type as keyof typeof LucideIcons] as React.ElementType;
		if (!IconComponent) return <LucideIcons.Circle className={cn("h-4 w-4", className)} />;
		return <IconComponent className={cn("h-4 w-4", className)} />;
	};

	const getGapIconDetails = (gapType: ComparisonSkill['gapType']) => {
		return gapLegend.find(legend => legend.id === gapType) || gapLegend[1];
	};

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
								<ColoredProgress // Use new component
									value={getSkillPercentage(skill.currentLevel)}
									className="h-2.5 flex-1"
									indicatorColorClassName="bg-primary" // Current role as primary color
								/>
								{/* Target Role Progress */}
								<ColoredProgress // Use new component
									value={getSkillPercentage(skill.targetLevel)}
									className="h-2.5 flex-1"
									indicatorColorClassName="bg-sky-500" // Target role distinct color
								/>
							</div>
						</div>
					);
				})}

				{/* Legends (remains the same) */}
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
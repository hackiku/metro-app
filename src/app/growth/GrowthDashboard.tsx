// src/app/growth/GrowthDashboard.tsx
"use client";

import { TrendingUp } from "lucide-react";
import { growthDashboardData } from "./data";
import { OverallProgressCard } from "./OverallProgressCard";
import { UpcomingActionsCard } from "./UpcomingActionsCard";
import { LearningResourcesCard } from "./LearningResourcesCard";
import { WeeklyFocusCard } from "./WeeklyFocusCard";
import { SkillsDevelopmentCard } from "./SkillsDevelopmentCard";

export function GrowthDashboard() {
	const { targetRole } = growthDashboardData;

	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-8 flex items-start gap-4">
				<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<TrendingUp className="h-6 w-6" />
				</div>
				<div>
					<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
						Growth Dashboard
					</h1>
					<p className="text-muted-foreground">
						Track your progress toward becoming a {targetRole}
					</p>
				</div>
			</div>

			{/* Top Row Cards */}
			<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<OverallProgressCard />
				<UpcomingActionsCard />
				<LearningResourcesCard />
			</div>

			{/* Bottom Row Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<WeeklyFocusCard />
				<SkillsDevelopmentCard />
			</div>
		</div>
	);
}
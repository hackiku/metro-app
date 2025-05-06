// src/app/comparison/RoleComparisonPage.tsx
"use client";

import { BarChartBig } from "lucide-react"; // Or BarChartHorizontalBig, AreaChart, TrendingUp
import { comparisonData } from "./data";
import { SkillComparisonChart } from "./SkillComparisonChart";
import { WorkEnvironmentCard } from "./WorkEnvironmentCard";
import { TransitionTimelineCard } from "./TransitionTimelineCard";

export function RoleComparisonPage() {
	const { currentRole, targetRole, pageSubtitle } = comparisonData;

	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-8 flex items-start gap-4">
				<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<BarChartBig className="h-6 w-6" />
				</div>
				<div>
					<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
						Compare: {currentRole} vs. {targetRole}
					</h1>
					<p className="text-muted-foreground">{pageSubtitle}</p>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Column (Skill Comparison) */}
				<div className="lg:col-span-2">
					<SkillComparisonChart />
				</div>

				{/* Right Column (Work Env & Timeline) */}
				<div className="space-y-6">
					<WorkEnvironmentCard />
					<TransitionTimelineCard />
				</div>
			</div>
		</div>
	);
}
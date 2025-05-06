// src/app/growth/OverallProgressCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ColoredProgress } from "~/components/ui/colored-progress";
import { BarChart3 } from "lucide-react"; // Using a different BarChart variant
import { growthDashboardData, type ProgressItem } from "./data";

export function OverallProgressCard() {
	const { overallProgress } = growthDashboardData;

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg font-semibold">
					<BarChart3 className="h-5 w-5 text-primary" />
					Overall Progress
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="mb-5">
					<div className="mb-1 flex justify-between text-sm">
						<span className="font-medium text-foreground">{overallProgress.journeyLabel}</span>
						<span className="font-semibold text-primary">{overallProgress.journeyProgress}%</span>
					</div>
					<ColoredProgress value={overallProgress.journeyProgress} className="h-2" indicatorColorClassName="bg-primary" />
				</div>
				<div className="space-y-3">
					{overallProgress.phases.map((phase) => (
						<div key={phase.id}>
							<div className="mb-1 flex justify-between text-xs">
								<span className="text-muted-foreground">{phase.label}</span>
								<span className="font-medium text-muted-foreground">{phase.value}%</span>
							</div>
							<ColoredProgress value={phase.value} className="h-1.5" indicatorColorClassName={phase.color || "bg-primary"} />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
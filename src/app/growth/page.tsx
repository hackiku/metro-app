// src/app/growth/page.tsx
"use client";

import { CompetencesProvider } from "~/contexts/CompetencesContext";
import { CareerPlanProvider } from "~/contexts/CareerPlanContext";
import { GrowthDashboard } from "./GrowthDashboard";

export default function GrowthPage() {
	return (
		<div className="flex-1 p-6">
			<CompetencesProvider>
				<CareerPlanProvider>
					<GrowthDashboard />
				</CareerPlanProvider>
			</CompetencesProvider>
		</div>
	);
}
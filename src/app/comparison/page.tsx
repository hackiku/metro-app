// src/app/comparison/page.tsx
"use client";

import { CompetencesProvider } from "~/contexts/CompetencesContext";
import { CareerPlanProvider } from "~/contexts/CareerPlanContext";
import { RoleComparisonPage } from "./RoleComparisonPage";

export default function ComparisonRoutePage() {
	return (
		<div className="flex-1 p-6">
			<CompetencesProvider>
				<CareerPlanProvider>
					<RoleComparisonPage />
				</CareerPlanProvider>
			</CompetencesProvider>
		</div>
	);
}
// src/app/comparison/page.tsx
"use client";

import { CompetencesProvider } from "~/contexts/CompetencesContext";
import { CareerPlanProvider } from "~/contexts/CareerPlanContext";
import { RoleComparisonPage } from "./RoleComparisonPage";
import { DataDevTools } from "~/components/dev/DataDevTools";

export default function ComparisonRoutePage() {
	return (
		<div className="flex-1 p-6">
			<CompetencesProvider>
				<CareerPlanProvider>
					{process.env.NODE_ENV === 'development' && (
						<DataDevTools
							position="custom"
							className="fixed top-5 right-96 mr-18"
						/>
					)}
					<RoleComparisonPage />
				</CareerPlanProvider>
			</CompetencesProvider>
		</div>
	);
}
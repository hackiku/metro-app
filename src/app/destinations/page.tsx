// src/app/destinations/page.tsx
"use client";

import { CompetencesProvider } from "~/contexts/CompetencesContext";
import { CareerPlanProvider } from "~/contexts/CareerPlanContext";
import { DestinationsPage } from "./DestinationsPage";

export default function DestinationsRoutePage() {
	return (
		<div className="flex-1 p-6">
			<CompetencesProvider>
				<CareerPlanProvider>
					<DestinationsPage />
				</CareerPlanProvider>
			</CompetencesProvider>
		</div>
	);
}
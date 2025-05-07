// src/app/destinations/page.tsx
"use client";

import { CompetencesProvider } from "~/contexts/CompetencesContext";
import { CareerPlanProvider } from "~/contexts/CareerPlanContext";
import { DestinationsPage } from "./DestinationsPage";
import { DataDevTools } from "~/components/dev/DataDevTools";

export default function DestinationsRoutePage() {
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
					<DestinationsPage />
				</CareerPlanProvider>
			</CompetencesProvider>
		</div>
	);
}
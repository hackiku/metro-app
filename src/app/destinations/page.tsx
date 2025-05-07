// src/app/destinations/page.tsx
"use client";

import { CompetencesProvider } from "~/contexts/CompetencesContext";
import { CareerPlanProvider } from "~/contexts/CareerPlanContext";
import { DestinationsPage } from "./DestinationsPage";
import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { NavDataButton } from "~/components/dev/NavDataButton";
import { Separator } from "~/components/ui/separator";

export default function DestinationsRoutePage() {
	// Since you already have these providers in your layout, you can access them directly
	const { currentUser } = useUser();
	const { currentOrganization } = useOrganization();

	// Only show debug tools in development mode
	const isDev = process.env.NODE_ENV === 'development';

	return (
		<div className="flex-1 p-6">
			{/* These providers should still be here if you're using hooks from them in this page */}
			<CompetencesProvider>
				<CareerPlanProvider>
					{isDev && (
						<div className="fixed z-50 top-5 right-96 mr-18 flex items-center gap-2">
							{currentUser && (
								<NavDataButton
									data={currentUser}
									title="Edit Current User"
									entityType="user"
								/>
							)}
							{currentOrganization && (
								<NavDataButton
									data={currentOrganization}
									title="Edit Organization"
									entityType="organization"
								/>
							)}
						</div>
					)}
					<DestinationsPage />
				</CareerPlanProvider>
			</CompetencesProvider>
		</div>
	);
}
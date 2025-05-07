// src/app/destinations/page.tsx
"use client";

import { CompetencesProvider } from "~/contexts/CompetencesContext";
import { CareerPlanProvider } from "~/contexts/CareerPlanContext";
import { DestinationsPage } from "./DestinationsPage";
import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { DataEditorButton } from "~/components/dev/DataEditorButton";
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
						<div className="mb-4 bg-muted/20 p-2 rounded-md">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-muted-foreground">Development Tools</h3>
								<div className="flex items-center gap-2">
									{currentUser && (
										<DataEditorButton
											data={currentUser}
											title="Edit Current User"
											entityType="user"
										/>
									)}
									{currentOrganization && (
										<DataEditorButton
											data={currentOrganization}
											title="Edit Organization"
											entityType="organization"
										/>
									)}
								</div>
							</div>
						</div>
					)}
					<DestinationsPage />
				</CareerPlanProvider>
			</CompetencesProvider>
		</div>
	);
}
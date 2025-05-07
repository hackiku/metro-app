// src/app/route/page.tsx
"use client";

import { CompetencesProvider } from "~/contexts/CompetencesContext"; // Needed if CareerPlanContext depends on it implicitly
import { CareerPlanProvider } from "~/contexts/CareerPlanContext";
import { UserProvider, useUser } from "~/contexts/UserContext"; // Import UserProvider if not already wrapping higher up
import { useCareerPlan } from "~/contexts/CareerPlanContext"; // Import hook to read context
import { CareerRoutePlanPage } from "./CareerRoutePlanPage";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"; // For debug card
import { Skeleton } from "~/components/ui/skeleton"; // For loading state in debug card

// Component to display debug info from contexts
function DebugContextInfo() {
	const { currentUser, currentPosition, loading: userLoading, error: userError } = useUser();
	const { plans, activePlan, selectedPlanId, isLoading: planLoading, error: planError } = useCareerPlan();

	const isLoading = userLoading || planLoading;

	return (
		<Card className="mb-6 border-dashed border-amber-500 bg-amber-500/5">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
					DEBUG: Context State
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 text-xs">
				{isLoading ? (
					<>
						<div className="flex items-center gap-2">
							<span className="w-24 font-semibold text-muted-foreground">User:</span>
							<Skeleton className="h-4 w-32" />
						</div>
						<div className="flex items-center gap-2">
							<span className="w-24 font-semibold text-muted-foreground">Position:</span>
							<Skeleton className="h-4 w-40" />
						</div>
						<div className="flex items-center gap-2">
							<span className="w-24 font-semibold text-muted-foreground">Active Plan:</span>
							<Skeleton className="h-4 w-24" />
						</div>
					</>
				) : (
					<>
						<div><span className="font-semibold">User:</span> {currentUser?.email ?? 'null'}</div>
						<div><span className="font-semibold">User ID:</span> {currentUser?.id ?? 'null'}</div>
						<div><span className="font-semibold">Position:</span> {currentPosition?.position?.name ?? 'null'} (ID: {currentUser?.current_position_details_id ?? 'null'})</div>
						<div><span className="font-semibold">Position Lvl:</span> {currentPosition?.level ?? 'null'}</div>
						<div><span className="font-semibold">Total Plans:</span> {plans?.length ?? 0}</div>
						<div><span className="font-semibold">Selected Plan ID:</span> {selectedPlanId ?? 'null'}</div>
						<div><span className="font-semibold">Active Plan Target:</span> {activePlan?.target_position_details?.positions?.name ?? 'null'}</div>
						<div><span className="font-semibold">Active Plan Phases#:</span> {activePlan?.phases?.length ?? 0}</div>
						{userError && <div className="text-red-600"><span className="font-semibold">User Error:</span> {userError}</div>}
						{planError && <div className="text-red-600"><span className="font-semibold">Plan Error:</span> {planError}</div>}
					</>
				)}
			</CardContent>
		</Card>
	);
}


export default function RoutePage() {
	// Assuming UserProvider and OrganizationProvider wrap this page higher up in layout.tsx
	// If not, you would need to wrap them here:
	// <OrganizationProvider>
	//   <UserProvider>
	//     <CompetencesProvider>
	//       <CareerPlanProvider> ... </CareerPlanProvider>
	//     </CompetencesProvider>
	//   </UserProvider>
	// </OrganizationProvider>

	return (
		<div className="flex-1 p-6">
			{/* Wrap the content needing these contexts */}
			<CompetencesProvider>
				<CareerPlanProvider>
					{/* Debug Card - Renders info from UserContext and CareerPlanContext */}
					<DebugContextInfo />

					{/* The actual page content */}
					<CareerRoutePlanPage />
				</CareerPlanProvider>
			</CompetencesProvider>
		</div>
	);
}
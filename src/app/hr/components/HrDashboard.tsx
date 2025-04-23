// src/app/hr/components/HrDashboard.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { RefreshCw, Map } from "lucide-react";
import Link from "next/link";
import { CareerPathTable } from "./CareerPathTable";
import { PositionTable } from "./PositionTable";
import { PathPositionsList } from "./PathPositionsList";

/**
 * Main HR Dashboard component
 * 
 * This component coordinates the HR management interface by:
 * 1. Managing the selected career path state
 * 2. Providing tab navigation between different management sections
 * 3. Handling data refreshing
 */
export function HrDashboard() {
	// Get organization ID from session context
	const { currentOrgId } = useSession();

	// State for tracking which career path is selected
	const [selectedCareerPathId, setSelectedCareerPathId] = useState<string | null>(null);

	// Basic check to ensure we have an organization ID
	if (!currentOrgId) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">
					No organization selected. Please contact your administrator.
				</p>
			</div>
		);
	}

	// Fetch all career paths with tRPC
	const careerPathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrgId },
		{ enabled: true }
	);

	// Handle manual refresh
	const handleRefresh = () => {
		careerPathsQuery.refetch();
	};

	// Find the name of the selected career path if any
	const selectedPathName = selectedCareerPathId && careerPathsQuery.data
		? careerPathsQuery.data.find(p => p.id === selectedCareerPathId)?.name
		: null;

	return (
		<div className="space-y-6">
			{/* Header section with title and actions */}
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Career Framework Management</h1>
					<p className="text-muted-foreground">
						{selectedPathName
							? `Managing "${selectedPathName}" career path`
							: "Manage career paths, positions, and their relationships"}
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Button variant="outline" size="sm" onClick={handleRefresh}>
						<RefreshCw className="mr-2 h-4 w-4" />
						Refresh
					</Button>
					<Button asChild>
						<Link href="/metro">
							<Map className="mr-2 h-4 w-4" />
							View Metro Map
						</Link>
					</Button>
				</div>
			</div>

			{/* If a specific career path is selected, show its details and positions */}
			{selectedCareerPathId ? (
				<div className="space-y-6">
					<Button
						variant="outline"
						onClick={() => setSelectedCareerPathId(null)}
					>
						← Back to All Career Paths
					</Button>

					<PathPositionsList
						careerPathId={selectedCareerPathId}
						pathName={selectedPathName || "Career Path"}
					/>
				</div>
			) : (
				/* Otherwise show tabs for managing career paths and positions */
				<Tabs defaultValue="career-paths" className="space-y-6">
					<TabsList>
						<TabsTrigger value="career-paths">Career Paths</TabsTrigger>
						<TabsTrigger value="positions">Positions</TabsTrigger>
					</TabsList>

					<TabsContent value="career-paths">
						<CareerPathTable onSelectPath={setSelectedCareerPathId} />
					</TabsContent>

					<TabsContent value="positions">
						<PositionTable />
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
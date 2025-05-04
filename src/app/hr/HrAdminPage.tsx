// src/app/hr/HrAdminPage.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Button } from "~/components/ui/button";
import { RefreshCw, Map } from "lucide-react";
import { ActionsHeader } from "./components/ActionsHeader";
import CareerPaths from "./career-paths/CareerPaths";
import { AssignmentsList } from "./assignments/AssignmentsList";
import { PositionsList } from "./positions/PositionsList";
import { Toaster } from "sonner";
import Link from "next/link";
import { toast } from "sonner";

export default function HrAdminPage() {
	// Get organization ID from session context
	const { currentOrgId } = useSession();

	// State for tracking which career path is selected
	const [selectedCareerPathId, setSelectedCareerPathId] = useState<string | null>(null);

	// State for tracking active tab
	const [activeTab, setActiveTab] = useState<string>("all-positions");

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

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

	// Handle global refresh
	const handleRefresh = () => {
		// Invalidate all queries
		utils.career.getPaths.invalidate();
		utils.position.getAll.invalidate();
		utils.position.getByCareerPath.invalidate();
		toast.success("Data refreshed");
	};

	// Handle selecting a different career path
	const handleSelectPath = (id: string | null) => {
		setSelectedCareerPathId(id);
		if (id) {
			setActiveTab("assigned-positions");
		} else {
			setActiveTab("all-positions");
		}
	};

	return (
		<div className="space-y-6 p-6">
			{/* Actions row */}
			<div className="flex gap-3 justify-end">
				<Button variant="outline" size="sm" onClick={handleRefresh}>
					<RefreshCw className="mr-2 h-4 w-4" />
					Refresh Data
				</Button>

				<div className="flex items-center gap-3">
					<Button asChild size="sm" variant="default">
						<Link href="/metro">
							<Map className="mr-2 h-4 w-4" />
							View Metro Map
						</Link>
					</Button>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="space-y-6">
				{/* Career Paths Table with selectable rows */}
				<CareerPaths
					onSelectPath={handleSelectPath}
					selectedPathId={selectedCareerPathId}
				/>

				{/* Actions Header with Tabs */}
				<ActionsHeader
					selectedPathId={selectedCareerPathId}
					onTabChange={setActiveTab}
					activeTab={activeTab}
					onPathSelect={handleSelectPath}
				/>

				{/* Content based on active tab */}
				<div className="mt-6">
					{activeTab === "all-positions" && (
						<PositionsList />
					)}

					{activeTab === "assigned-positions" && selectedCareerPathId && (
						<AssignmentsList careerPathId={selectedCareerPathId} />
					)}
				</div>
			</div>

			{/* Toast container for notifications */}
			<Toaster />
		</div>
	);
}
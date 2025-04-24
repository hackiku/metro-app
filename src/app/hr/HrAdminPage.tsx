// src/app/hr/HrAdminPage.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Button } from "~/components/ui/button";
import { RefreshCw, Map } from "lucide-react";
import CareerPaths from "./career-paths/CareerPaths";
import Positions from "./positions/Positions";
import { Toaster } from "sonner";
import Link from "next/link";
import { toast } from "sonner";

export default function HrAdminPage() {
	// Get organization ID from session context
	const { currentOrgId } = useSession();

	// State for tracking which career path is selected
	const [selectedCareerPathId, setSelectedCareerPathId] = useState<string | null>(null);

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

			{/* Career Paths Table with selectable rows */}
			<CareerPaths
				onSelectPath={setSelectedCareerPathId}
				selectedPathId={selectedCareerPathId}
			/>

			{/* Position details shown based on selection */}
			{selectedCareerPathId && (
				<div className="mt-6">
					<Positions selectedPathId={selectedCareerPathId} />
				</div>
			)}

			{/* Toast container for notifications */}
			<Toaster />
		</div>
	);
}
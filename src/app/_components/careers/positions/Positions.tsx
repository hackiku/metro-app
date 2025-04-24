// src/app/hr/positions/Positions.tsx

"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AssignmentsList } from "../assignments/AssignmentsList";
import { toast } from "sonner";

interface PositionsProps {
	selectedPathId: string | null;
}

export function Positions({ selectedPathId }: PositionsProps) {
	const { currentOrgId } = useSession();
	const [pathName, setPathName] = useState<string>("");

	// Fetch the specific career path details if one is selected
	const pathQuery = api.career.getPathById.useQuery(
		{ id: selectedPathId! },
		{
			enabled: !!selectedPathId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Update path name when data changes
	useEffect(() => {
		if (pathQuery.data) {
			setPathName(pathQuery.data.name);
		}
	}, [pathQuery.data]);

	// If no path is selected, show all positions
	if (!selectedPathId) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Positions</CardTitle>
					<CardDescription>
						All generic positions across career paths
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PositionsList />
				</CardContent>
			</Card>
		);
	}

	// If path is selected but still loading
	if (pathQuery.isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Loading...</CardTitle>
					<CardDescription>
						Retrieving career path details
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-40">
						<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	// If path is selected but there was an error
	if (pathQuery.error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-xl text-destructive">Error</CardTitle>
					<CardDescription>
						Failed to load career path details
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="p-4 bg-destructive/10 rounded-md text-destructive">
						{pathQuery.error.message}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Render assignments for the selected career path
	return (
		<AssignmentsList
			careerPathId={selectedPathId}
			pathName={pathName}
		/>
	);
}

// Import at the end to avoid circular dependencies
import { PositionsList } from "./PositionsList";
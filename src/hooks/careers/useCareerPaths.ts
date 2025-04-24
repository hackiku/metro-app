// src/app/hr/hooks/useCareerPaths.tsx
"use client";

import { useSession } from "~/contexts/SessionContext";
import { api } from "~/trpc/react";
import type { CareerPath } from "~/types/compass";

export function useCareerPaths() {
	const { currentOrgId } = useSession();
	const utils = api.useUtils();

	// Query for fetching all career paths
	const careerPathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrgId! },
		{
			enabled: !!currentOrgId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Mutation for creating a career path
	const createPathMutation = api.career.createPath.useMutation({
		onSuccess: () => {
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
		}
	});

	// Mutation for updating a career path
	const updatePathMutation = api.career.updatePath.useMutation({
		onSuccess: (data) => {
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
			if (data.id) {
				utils.career.getPathById.invalidate({ id: data.id });
			}
		}
	});

	// Mutation for deleting a career path
	const deletePathMutation = api.career.deletePath.useMutation({
		onSuccess: () => {
			utils.career.getPaths.invalidate({ organizationId: currentOrgId! });
		}
	});

	return {
		careerPaths: careerPathsQuery.data || [],
		isLoading: careerPathsQuery.isLoading,
		error: careerPathsQuery.error,
		createPath: createPathMutation.mutate,
		updatePath: updatePathMutation.mutate,
		deletePath: deletePathMutation.mutate,
		isCreating: createPathMutation.isPending,
		isUpdating: updatePathMutation.isPending,
		isDeleting: deletePathMutation.isPending,
	};
}
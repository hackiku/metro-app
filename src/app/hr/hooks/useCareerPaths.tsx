// src/app/hr/hooks/useCareerPaths.tsx

"use client";

import { useOrganization } from "~/contexts/OrganizationContext";
import { api } from "~/trpc/react";
import type { CareerPath } from "~/types/compass";

export function useCareerPaths() {
	const { currentOrganization } = useOrganization();
	const utils = api.useUtils();

	const organizationId = currentOrganization?.id;

	// Query for fetching all career paths
	const careerPathsQuery = api.career.getPaths.useQuery(
		{ organizationId: organizationId! },
		{
			enabled: !!organizationId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Mutation for creating a career path
	const createPathMutation = api.career.createPath.useMutation({
		onSuccess: () => {
			if (organizationId) {
				utils.career.getPaths.invalidate({ organizationId });
			}
		}
	});

	// Mutation for updating a career path
	const updatePathMutation = api.career.updatePath.useMutation({
		onSuccess: (data) => {
			if (organizationId) {
				utils.career.getPaths.invalidate({ organizationId });
			}
			if (data.id) {
				utils.career.getPathById.invalidate({ id: data.id });
			}
		}
	});

	// Mutation for deleting a career path
	const deletePathMutation = api.career.deletePath.useMutation({
		onSuccess: () => {
			if (organizationId) {
				utils.career.getPaths.invalidate({ organizationId });
			}
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
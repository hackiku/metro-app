// src/hooks/useCareerPaths.ts

"use client";

import { useOrganization } from "~/contexts/OrganizationContext";
import { api } from "~/trpc/react";
import type { CareerPath } from "~/types/compass";

export function useCareerPaths() {
	const { currentOrganization } = useOrganization();
	const utils = api.useUtils();

	const organizationId = currentOrganization?.id || '';

	// Query for fetching all career paths
	const careerPathsQuery = api.career.getPaths.useQuery(
		{ organizationId },
		{
			enabled: !!currentOrganization?.id,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Mutation for creating a career path
	const createPathMutation = api.career.createPath.useMutation({
		onSuccess: () => {
			if (currentOrganization?.id) {
				utils.career.getPaths.invalidate({ organizationId: currentOrganization.id });
			}
		}
	});

	// Mutation for updating a career path
	const updatePathMutation = api.career.updatePath.useMutation({
		onSuccess: (data) => {
			if (currentOrganization?.id) {
				utils.career.getPaths.invalidate({ organizationId: currentOrganization.id });
			}
			if (data.id) {
				utils.career.getPathById.invalidate({ id: data.id });
			}
		}
	});

	// Mutation for deleting a career path
	const deletePathMutation = api.career.deletePath.useMutation({
		onSuccess: () => {
			if (currentOrganization?.id) {
				utils.career.getPaths.invalidate({ organizationId: currentOrganization.id });
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
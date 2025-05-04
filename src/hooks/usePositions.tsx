// src/hooks/usePositions.tsx

"use client";

import { useOrganization } from "~/contexts/OrganizationContext";
import { api } from "~/trpc/react";

export function usePositions() {
	const { currentOrganization } = useOrganization();
	const utils = api.useUtils();

	const organizationId = currentOrganization?.id;

	// Query for fetching all positions
	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: organizationId! },
		{
			enabled: !!organizationId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Mutation for creating a position
	const createPositionMutation = api.position.create.useMutation({
		onSuccess: () => {
			if (organizationId) {
				utils.position.getAll.invalidate({ organizationId });
			}
		}
	});

	// Mutation for updating a position
	const updatePositionMutation = api.position.update.useMutation({
		onSuccess: () => {
			if (organizationId) {
				utils.position.getAll.invalidate({ organizationId });
			}
		}
	});

	// Mutation for deleting a position
	const deletePositionMutation = api.position.delete.useMutation({
		onSuccess: () => {
			if (organizationId) {
				utils.position.getAll.invalidate({ organizationId });
			}
		}
	});

	return {
		positions: positionsQuery.data || [],
		isLoading: positionsQuery.isLoading,
		error: positionsQuery.error,
		createPosition: createPositionMutation.mutate,
		updatePosition: updatePositionMutation.mutate,
		deletePosition: deletePositionMutation.mutate,
		isCreating: createPositionMutation.isPending,
		isUpdating: updatePositionMutation.isPending,
		isDeleting: deletePositionMutation.isPending,
	};
}
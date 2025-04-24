// src/app/hr/hooks/usePositions.tsx
"use client";

import { useSession } from "~/contexts/SessionContext";
import { api } from "~/trpc/react";

export function usePositions() {
	const { currentOrgId } = useSession();
	const utils = api.useUtils();

	// Query for fetching all positions
	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrgId! },
		{
			enabled: !!currentOrgId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Mutation for creating a position
	const createPositionMutation = api.position.create.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrgId! });
		}
	});

	// Mutation for updating a position
	const updatePositionMutation = api.position.update.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrgId! });
		}
	});

	// Mutation for deleting a position
	const deletePositionMutation = api.position.delete.useMutation({
		onSuccess: () => {
			utils.position.getAll.invalidate({ organizationId: currentOrgId! });
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
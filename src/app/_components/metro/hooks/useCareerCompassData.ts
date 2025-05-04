// src/app/_components/metro/hooks/useCareerCompassData.ts
import { useOrganization } from "~/contexts/OrganizationContext";
import { api } from "~/trpc/react";
import type { Organization, CareerPath, Position, PositionDetail } from "~/types/compass";

/**
 * Hook to fetch all necessary data for the CareerCompass component
 * This replaces the old context-based data fetching approach
 */
export function useCareerCompassData() {
	const { currentOrganization } = useOrganization();
	const utils = api.useUtils();

	// Get the organization ID from the currentOrganization
	const currentOrgId = currentOrganization?.id;

	// Fetch all career paths
	const careerPathsQuery = api.career.getPaths.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Fetch all positions
	const positionsQuery = api.position.getAll.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Fetch all position details
	const positionDetailsQuery = api.position.getAllDetails.useQuery(
		{ organizationId: currentOrgId! },
		{ enabled: !!currentOrgId }
	);

	// Calculate loading and error states
	const isLoading =
		careerPathsQuery.isLoading ||
		positionsQuery.isLoading ||
		positionDetailsQuery.isLoading;

	// Collect any errors
	const errors: string[] = [];
	if (careerPathsQuery.error) errors.push(`Career Paths: ${careerPathsQuery.error.message}`);
	if (positionsQuery.error) errors.push(`Positions: ${positionsQuery.error.message}`);
	if (positionDetailsQuery.error) errors.push(`Position Details: ${positionDetailsQuery.error.message}`);

	// Consolidated error message if any
	const error = errors.length > 0 ? errors.join('\n') : null;

	// Function to refresh all data
	const refreshData = async () => {
		if (!currentOrgId) return;

		await Promise.all([
			utils.career.getPaths.invalidate({ organizationId: currentOrgId }),
			utils.position.getAll.invalidate({ organizationId: currentOrgId }),
			utils.position.getAllDetails.invalidate({ organizationId: currentOrgId })
		]);
	};

	return {
		organization: currentOrganization,
		careerPaths: careerPathsQuery.data || [],
		positions: positionsQuery.data || [],
		positionDetails: positionDetailsQuery.data || [],
		loading: isLoading,
		error,
		refreshData
	};
}
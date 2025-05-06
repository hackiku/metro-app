// src/hooks/useCompetences.ts

import { useOrganization } from "~/contexts/OrganizationContext";
import { useUser } from "~/contexts/UserContext";
import { api } from "~/trpc/react";
import type { CareerPath } from "~/types/compass";

export function useCompetences() {
  const { currentOrganization } = useOrganization();
  const { currentUser } = useUser();
  
  // Query for all competences
  const competencesQuery = api.competence.getAll.useQuery(
    { organizationId: currentOrganization?.id! },
    { enabled: !!currentOrganization?.id }
  );
  
  // Query for user competences
  const userCompetencesQuery = api.user.getUserCompetences.useQuery(
    { userId: currentUser?.id! },
    { enabled: !!currentUser?.id }
  );
  
  return {
    competences: competencesQuery.data || [],
    userCompetences: userCompetencesQuery.data || [],
    isLoading: competencesQuery.isLoading || userCompetencesQuery.isLoading,
    // Add additional helpful methods
  };
}
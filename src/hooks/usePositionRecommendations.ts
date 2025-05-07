// src/hooks/usePositionRecommendations.ts

"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
// Remove useCompetences import if only used for mocked skills
// import { useCompetences } from "~/contexts/CompetencesContext";
import type { PositionRecommendation } from "~/app/comparison/types"; // Use your defined type

// Define the structure returned by findSimilarPositions more accurately if possible
// This depends on your actual tRPC endpoint return type
interface SimilarPositionData {
  id: string;
  level: number;
  similarity: number; // Assuming it's 0-1
  position?: { id: string; name: string };
  career_path?: { id: string; name: string; color: string | null };
  // Add required_competences here if your endpoint returns them
  // required_competences?: Array<{ competence_id: string; required_level: number; competence?: { name: string }}>;
}

export function usePositionRecommendations() {
  const { currentUser } = useUser();
  const { currentOrganization } = useOrganization();
  // Remove useCompetences if not needed for core logic
  // const { userCompetences } = useCompetences();
  const [recommendations, setRecommendations] = useState<PositionRecommendation[]>([]);
  const [hookIsLoading, setHookIsLoading] = useState(true); // Internal loading state
  const [error, setError] = useState<string | null>(null);

  // Fetch user's current position details
  const userPositionQuery = api.user.getUserPositionDetails.useQuery(
    { userId: currentUser?.id! },
    { enabled: !!currentUser?.id }
  );

  // Fetch similar positions
  const similarPositionsQuery = api.position.findSimilarPositions.useQuery(
    {
      positionDetailId: userPositionQuery.data?.id!,
      organizationId: currentOrganization?.id!,
      limit: 5
    },
    {
      enabled: !!userPositionQuery.data?.id && !!currentOrganization?.id,
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  );

  // Process results when queries finish
  useEffect(() => {
    // Don't process until essential queries are done
    if (userPositionQuery.isLoading || similarPositionsQuery.isLoading) {
      setHookIsLoading(true);
      return;
    }

    // Handle errors
    if (userPositionQuery.error) {
      setError(`Error fetching current position: ${userPositionQuery.error.message}`);
      setHookIsLoading(false);
      setRecommendations([]);
      return;
    }
     if (similarPositionsQuery.error) {
      setError(`Error fetching similar positions: ${similarPositionsQuery.error.message}`);
      setHookIsLoading(false);
      setRecommendations([]);
      return;
    }

    // Process successful data
    if (similarPositionsQuery.data) {
      const transformed: PositionRecommendation[] = similarPositionsQuery.data.map((pos: SimilarPositionData) => {
        // Theme logic (keep as is or refine)
        let theme: 'product' | 'scientist' | 'advisor' | 'default' = 'default';
        const pathColor = pos.career_path?.color?.toLowerCase();
        if (pathColor?.includes('green')) theme = 'product';
        else if (pathColor?.includes('purple')) theme = 'scientist';
        else if (pathColor?.includes('yellow') || pathColor?.includes('orange')) theme = 'advisor';

        // --- Key Skills: Fetch REAL required skills LATER ---
        // For MVP, maybe show placeholder or omit until requirements fetched separately
        const keySkills = ["Skill A", "Skill B", "Skill C"]; // Placeholder

        // --- Match Reasons: This needs to come from the API or be derived ---
        const matchReasons = [ { type: 'Overlap', description: `${Math.round(pos.similarity * 100)}% skill overlap` }]; // Placeholder

        return {
          id: pos.id, // Usually refers to the position_details id
          position_details_id: pos.id,
          score: Math.round(pos.similarity * 100), // Convert 0-1 score to percentage
          position_detail: { // Nest the details
              id: pos.id,
              level: pos.level,
              position: pos.position,
              career_path: pos.career_path,
          },
          match_reasons: matchReasons, // Add placeholder or real reasons
          // Add other fields matching RecommendedDestination if needed
          title: pos.position?.name || 'Unknown Position',
          description: `Level ${pos.level} in ${pos.career_path?.name || 'Unknown Path'}`,
          keySkills: keySkills,
          theme: theme,
        };
      });
      setRecommendations(transformed);
      setError(null); // Clear previous errors
    } else {
      setRecommendations([]); // Handle case where data is null/undefined
    }

    setHookIsLoading(false); // Set loading false *after* processing

  }, [
    userPositionQuery.isLoading,
    userPositionQuery.error,
    userPositionQuery.data, // Add data dependency
    similarPositionsQuery.isLoading,
    similarPositionsQuery.error,
    similarPositionsQuery.data // Add data dependency
  ]);

  return {
    recommendations,
    isLoading: hookIsLoading, // Use internal loading state
    error,
    currentPosition: userPositionQuery.data // This is PositionDetails type
  };
}
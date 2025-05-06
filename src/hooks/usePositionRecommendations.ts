// src/hooks/usePositionRecommendations.ts
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import type { RecommendedDestination } from "~/app/destinations/data";

export function usePositionRecommendations() {
  const { currentUser } = useUser();
  const { currentOrganization } = useOrganization();
  const { userCompetences } = useCompetences();
  const [recommendations, setRecommendations] = useState<RecommendedDestination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get user's current position
  const userPositionQuery = api.user.getUserPositionDetails.useQuery(
    { userId: currentUser?.id! },
    { enabled: !!currentUser?.id }
  );
  
  // Get similar positions using tRPC endpoint
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
  
  // Transform similar positions to recommended destinations
  useEffect(() => {
    setIsLoading(true);
    
    if (similarPositionsQuery.isLoading || userPositionQuery.isLoading) {
      return;
    }
    
    if (similarPositionsQuery.error) {
      setError(similarPositionsQuery.error.message);
      setIsLoading(false);
      return;
    }
    
    if (!similarPositionsQuery.data || similarPositionsQuery.data.length === 0) {
      setRecommendations([]);
      setIsLoading(false);
      return;
    }
    
    // Transform positions to recommendations format
    const transformedRecommendations: RecommendedDestination[] = similarPositionsQuery.data.map(position => {
      // Determine theme based on career path color or default
      let theme: 'product' | 'scientist' | 'advisor' | 'default' = 'default';
      const pathColor = position.career_path?.color?.toLowerCase();
      
      if (pathColor?.includes('green')) {
        theme = 'product';
      } else if (pathColor?.includes('purple')) {
        theme = 'scientist';
      } else if (pathColor?.includes('yellow') || pathColor?.includes('orange')) {
        theme = 'advisor';
      }
      
      // Create skills array (would be more accurate if we had the actual required competences)
      const keySkills = userCompetences
        .slice(0, 5)
        .map(uc => uc.competence.name || 'Unknown Skill');
      
      return {
        id: position.id,
        title: position.position?.name || 'Unknown Position',
        matchPercentage: Math.round(position.similarity * 100),
        description: `Level ${position.level} position in the ${position.career_path?.name || 'Unknown'} career path.`,
        keySkills,
        theme
      };
    });
    
    setRecommendations(transformedRecommendations);
    setIsLoading(false);
  }, [
    similarPositionsQuery.data,
    similarPositionsQuery.isLoading,
    similarPositionsQuery.error,
    userPositionQuery.isLoading,
    userCompetences
  ]);
  
  return {
    recommendations,
    isLoading: isLoading || similarPositionsQuery.isLoading || userPositionQuery.isLoading,
    error,
    currentPosition: userPositionQuery.data
  };
}
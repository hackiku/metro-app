// src/hooks/usePositionRecommendations.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useUser } from "~/contexts/UserContext";

/**
 * This is a minimal "dummy" hook to maintain compatibility in case any components 
 * still import it. It doesn't make any API calls to recommendations at all.
 * 
 * DO NOT USE THIS HOOK IN NEW COMPONENTS - it exists only for backward compatibility.
 */
export function usePositionRecommendations() {
  const { currentUser } = useUser();
  const [currentPosition, setCurrentPosition] = useState<any>(null);
  
  // Fetch current position details based on user's current_position_details_id
  const {
    data: positionData,
    isLoading: positionLoading
  } = api.user.getUserPositionDetails.useQuery(
    { userId: currentUser?.id as string },
    {
      enabled: !!currentUser?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
      onSuccess: (data) => {
        // Explicitly set position data when it arrives
        if (data) {
          setCurrentPosition(data);
        }
      }
    }
  );

  // Simply return the current position and empty recommendations
  return {
    currentPosition,
    recommendations: [], // Always empty to avoid recommendation queries
    isLoading: !currentUser || positionLoading
  };
}
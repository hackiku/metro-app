// src/hooks/useLearningResources.ts
"use client";

import { useState, useEffect } from "react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { api } from "~/trpc/react";

export interface LearningResource {
  id: string;
  title: string;
  type: string;
  source?: string | null;
  estimated_duration?: string | null;
  url?: string | null;
  description?: string | null;
}

export function useLearningResources() {
  const { currentOrganization } = useOrganization();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query all learning resources for the organization
  const learningResourcesQuery = api.learning.getAll.useQuery(
    { organizationId: currentOrganization?.id! },
    { 
      enabled: !!currentOrganization?.id,
      staleTime: 1000 * 60 * 15 // 15 minutes
    }
  );

  useEffect(() => {
    if (learningResourcesQuery.data) {
      setResources(learningResourcesQuery.data.map(resource => ({
        id: resource.id,
        title: resource.title,
        type: formatResourceType(resource.type, resource.source),
        source: resource.source,
        estimated_duration: resource.estimated_duration,
        url: resource.url,
        description: resource.description
      })));
      setIsLoading(false);
    } else if (learningResourcesQuery.error) {
      setError(learningResourcesQuery.error.message);
      setIsLoading(false);
    }
  }, [learningResourcesQuery.data, learningResourcesQuery.error]);

  // Format resource type for display (e.g., "Course • Coursera")
  const formatResourceType = (type: string, source: string | null): string => {
    if (source) {
      return `${type} • ${source}`;
    }
    return type;
  };

  return {
    resources,
    isLoading,
    error
  };
}
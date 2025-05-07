// src/app/growth/GrowthDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { useUser } from "~/contexts/UserContext";
import { useCareerPlan } from "~/contexts/CareerPlanContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import { OverallProgressCard } from "./OverallProgressCard";
import { UpcomingActionsCard } from "./UpcomingActionsCard";
import { LearningResourcesCard } from "./LearningResourcesCard";
import { WeeklyFocusCard } from "./WeeklyFocusCard";
import { SkillsDevelopmentCard } from "./SkillsDevelopmentCard";
import { Skeleton } from "~/components/ui/skeleton";

export function GrowthDashboard() {
  const { currentUser, currentPosition, loading: userLoading } = useUser();
  const { activePlan, isLoading: planLoading } = useCareerPlan();
  const { userCompetences, isLoading: competencesLoading } = useCompetences();
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Target role name from active career plan
  const targetRole = activePlan?.target_position_details?.positions?.name || "Target Role";
  
  // Update loading state when data is ready
  useEffect(() => {
    setIsLoading(userLoading || planLoading || competencesLoading);
  }, [userLoading, planLoading, competencesLoading]);
  
  if (isLoading) {
    return <GrowthDashboardSkeleton />;
  }
  
  if (!currentUser) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Please select a user to view the growth dashboard.
      </div>
    );
  }
  
  if (!activePlan) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No active career plan found. Please create a career plan to track your growth.
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
            Growth Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your progress toward becoming a {targetRole}
          </p>
        </div>
      </div>

      {/* Top Row Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OverallProgressCard />
        <UpcomingActionsCard />
        <LearningResourcesCard />
      </div>

      {/* Bottom Row Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <WeeklyFocusCard />
        <SkillsDevelopmentCard />
      </div>
    </div>
  );
}

function GrowthDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}
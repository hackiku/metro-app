// src/app/comparison/types.ts
// Types specific to the comparison components

export type GapType = 'no-gap' | 'small-gap' | 'medium-gap' | 'large-gap';

export interface ComparisonSkill {
  id: string;
  name: string;
  currentLevel: number; // 0-5
  targetLevel: number;  // 0-5
  gapType: GapType;
}

export interface LegendItem {
  id: string;
  label: string;
  colorClass: string; // Tailwind CSS class for icon/dot color
  icon?: string; // Lucide icon name
}

export interface WorkEnvironmentDifference {
  id: string;
  currentRoleText: string;
  targetRoleText: string;
}

export interface TransitionTimeline {
  duration: string;
  details: string;
  description: string;
  keyDevelopmentAreas: string[];
}

// Common props for comparison components
export interface ComparisonComponentProps {
  currentPosition: any; // Import type from app.ts once ready
  targetPosition: any;  // Import type from app.ts once ready
}

// Position recommendation type
export interface PositionRecommendation {
  id: string;
  position_details_id?: string;
  score?: number;
  position_detail?: any;
  title?: string;
  matchPercentage?: number;
  description?: string;
  match_reasons?: {
    type: string;
    description: string;
  }[];
}
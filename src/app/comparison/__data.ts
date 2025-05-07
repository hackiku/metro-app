// src/app/comparison/data.ts

export type GapType = 'no-gap' | 'small-gap' | 'medium-gap' | 'large-gap';

export interface ComparisonSkill {
  id: string;
  name: string;
  currentLevel: number; // 0-5
  targetLevel: number;  // 0-5
  gapType: GapType;
}

export interface LegendItem {
  id: GapType | string;
  label: string;
  colorClass: string; // Tailwind CSS class for icon/dot color
  icon?: React.ElementType; // Lucide icon component
}

export interface WorkEnvironmentDifference {
  id: string;
  currentRoleText: string;
  targetRoleText: string;
}

export const comparisonData = {
  currentRole: 'Junior Data Analyst',
  targetRole: 'Product Analyst',
  pageSubtitle: "See what's needed for this career transition",
  skills: [
    { id: 'skill-1', name: 'Data Analysis', currentLevel: 3, targetLevel: 4, gapType: 'small-gap' as GapType },
    { id: 'skill-2', name: 'SQL Proficiency', currentLevel: 3, targetLevel: 3, gapType: 'no-gap' as GapType },
    { id: 'skill-3', name: 'Visualization', currentLevel: 3, targetLevel: 3, gapType: 'no-gap' as GapType },
    { id: 'skill-4', name: 'Product Thinking', currentLevel: 1, targetLevel: 4, gapType: 'large-gap' as GapType },
    { id: 'skill-5', name: 'A/B Testing', currentLevel: 1, targetLevel: 3, gapType: 'medium-gap' as GapType },
    { id: 'skill-6', name: 'User Behavior Analysis', currentLevel: 1, targetLevel: 3, gapType: 'medium-gap' as GapType },
    { id: 'skill-7', name: 'Agile Methodologies', currentLevel: 0, targetLevel: 2, gapType: 'medium-gap' as GapType },
    { id: 'skill-8', name: 'Stakeholder Management', currentLevel: 1, targetLevel: 3, gapType: 'medium-gap' as GapType },
  ] as ComparisonSkill[],
  gapLegend: [
    { id: 'no-gap', label: 'No Gap', colorClass: 'text-green-500 dark:text-green-400', icon: 'CheckCircle2' },
    { id: 'small-gap', label: 'Small Gap (3-6 months)', colorClass: 'text-blue-500 dark:text-blue-400', icon: 'Circle' },
    { id: 'medium-gap', label: 'Medium Gap (6-12 months)', colorClass: 'text-yellow-500 dark:text-yellow-400', icon: 'Circle' },
    { id: 'large-gap', label: 'Large Gap (12+ months)', colorClass: 'text-red-500 dark:text-red-400', icon: 'AlertCircle' },
  ] as LegendItem[],
  skillLevelScale: [
    { id: 'level-1', label: '1 - Beginner', colorClass: 'bg-neutral-300 dark:bg-neutral-600' },
    { id: 'level-2', label: '2 - Basic', colorClass: 'bg-neutral-400 dark:bg-neutral-500' },
    { id: 'level-3', label: '3 - Intermediate', colorClass: 'bg-neutral-500 dark:bg-neutral-400' },
    { id: 'level-4', label: '4 - Advanced', colorClass: 'bg-neutral-600 dark:bg-neutral-300' },
    { id: 'level-5', label: '5 - Expert', colorClass: 'bg-neutral-700 dark:bg-neutral-200' },
  ] as LegendItem[],
  workEnvironmentDifferences: [
    { id: 'env-1', currentRoleText: 'Focused on reporting and regular data updates', targetRoleText: 'Focused on user journeys and feature metrics' },
    { id: 'env-2', currentRoleText: 'Work primarily with data team and requesters', targetRoleText: 'Work embedded within product teams (PM, designers, devs)' },
    { id: 'env-3', currentRoleText: 'Project-based work with defined deliverables', targetRoleText: 'Agile sprints with evolving priorities' },
    { id: 'env-4', currentRoleText: 'Emphasis on accuracy and timeliness of data', targetRoleText: 'Emphasis on insights and actionable recommendations' },
  ] as WorkEnvironmentDifference[],
  transitionTimeline: {
    duration: '12-18 months',
    details: 'with active development',
    description: "Based on your current skills and the requirements for this role, a transition would take:",
    keyDevelopmentAreas: [
      'Product thinking and user-centric approach',
      'A/B testing methodologies',
      'Agile workflow and tools (Jira/Scrum)',
      'Stakeholder management with product teams',
    ],
  },
};

// Helper function to get skill level percentage (max 5 levels)
export const getSkillPercentage = (level: number): number => {
  return (level / 5) * 100;
};
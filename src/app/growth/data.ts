// src/app/growth/data.ts

export interface ProgressItem {
  id: string;
  label: string;
  value: number; // Percentage 0-100
  color?: string; // Optional: Tailwind color class for progress bar e.g., "bg-blue-500"
}

export interface UpcomingAction {
  id: string;
  title: string;
  category: 'Mentoring' | 'Task' | 'Training' | 'Project';
}

export interface LearningResource {
  id: string;
  title: string;
  type: string; // e.g., "Course • Coursera", "Workshop • Internal"
  duration: string; // e.g., "4 weeks", "2 hours"
}

export interface WeeklyFocusItem {
  id: string;
  title: string;
  description: string;
  isPrimary?: boolean; // For the slightly different styled card (bg-compass-light)
}

export interface SkillDevelopmentItem {
  id: string;
  name: string;
  currentLevel: number;
  targetLevel: number;
}

export const growthDashboardData = {
  targetRole: "Product Analyst",
  overallProgress: {
    journeyLabel: "Product Analyst Journey",
    journeyProgress: 0, // Example progress
    phases: [
      { id: 'phase-1', label: 'Phase 1: Cross-team Collaboration', value: 0, color: "bg-sky-500" },
      { id: 'phase-2', label: 'Phase 2: Product Metrics & Roadmap', value: 0, color: "bg-blue-500" },
      { id: 'phase-3', label: 'Phase 3: Product Tools & Agile', value: 0, color: "bg-indigo-500" },
      { id: 'phase-4', label: 'Phase 4: Feature Ownership', value: 0, color: "bg-purple-500" },
    ] as ProgressItem[],
  },
  upcomingActions: [
    { id: 'ua-1', title: 'Shadow a product manager for 2 weeks', category: 'Mentoring' },
    { id: 'ua-2', title: 'Attend product team stand-ups', category: 'Task' },
    { id: 'ua-3', title: 'Complete "Intro to Product Management" course', category: 'Training' },
  ] as UpcomingAction[],
  learningResources: [
    { id: 'lr-1', title: 'Product Analytics Fundamentals', type: 'Course • Coursera', duration: '4 weeks' },
    { id: 'lr-2', title: 'Introduction to A/B Testing', type: 'Workshop • Internal', duration: '2 hours' },
    { id: 'lr-3', title: 'Agile for Analysts', type: 'Course • Udemy', duration: '6 hours' },
  ] as LearningResource[],
  weeklyFocus: [
    { 
      id: 'wf-1', 
      title: 'Shadow a product manager', 
      description: 'Spend time with a PM to understand their daily workflow, challenges, and how they use data in decision making.',
      isPrimary: true,
    },
    { 
      id: 'wf-2', 
      title: 'Start "Intro to Product Management" course',
      description: 'Complete modules 1-3 this week covering product strategy and user-centric design.',
    },
  ] as WeeklyFocusItem[],
  skillsDevelopment: [
    { id: 'sd-1', name: 'Product Thinking', currentLevel: 1, targetLevel: 4 },
    { id: 'sd-2', name: 'A/B Testing', currentLevel: 1, targetLevel: 3 },
    { id: 'sd-3', name: 'Agile Methodologies', currentLevel: 0, targetLevel: 2 },
    { id: 'sd-4', name: 'Stakeholder Management', currentLevel: 1, targetLevel: 3 },
  ] as SkillDevelopmentItem[],
};

// Helper to calculate percentage for skills development (current/target)
export const getSkillProgressPercentage = (current: number, target: number): number => {
  if (target === 0) return 0; // Avoid division by zero
  return Math.min(Math.round((current / target) * 100), 100); // Cap at 100%
};
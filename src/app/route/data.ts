// src/app/route/data.ts
import { type LucideIcon, CheckCircle2, Circle } from "lucide-react"; // For action item status

export interface RoutePhase {
  id: string;
  number: number;
  title: string;
  duration: string; // e.g., "3 months"
  description: string;
  progress: number; // 0-100
  actions: ActionItem[];
}

export interface ActionItem {
  id: string;
  title: string;
  category: 'Mentoring' | 'Task' | 'Training' | 'Project' | 'Other';
  status: 'todo' | 'in-progress' | 'completed'; // For icon and button state
}

export const careerRoutePlanData = {
  title: "Career Route Plan",
  targetRole: "Product Analyst",
  subtitle: "Your personalized development path to become a Product Analyst",
  description: "This plan breaks down the journey into manageable phases with specific actions to help you develop the skills and experience needed for your target role.",
  totalDuration: "12-18 months",
  phases: [
    {
      id: 'phase-1',
      number: 1,
      title: 'Cross-team Collaboration',
      duration: '3 months',
      description: 'Start collaborating with product teams to understand their workflows and data needs',
      progress: 0, // Example: 25%
      actions: [
        { id: 'action-1-1', title: 'Shadow a product manager for 2 weeks', category: 'Mentoring', status: 'todo' },
        { id: 'action-1-2', title: 'Attend product team stand-ups', category: 'Task', status: 'todo' },
      ],
    },
    {
      id: 'phase-2',
      number: 2,
      title: 'Product Metrics & Roadmap',
      duration: '4 months',
      description: 'Learn to define, track, and analyze key product metrics. Contribute to roadmap planning.',
      progress: 0,
      actions: [
        { id: 'action-2-1', title: 'Complete "Data-Driven Product Management" course', category: 'Training', status: 'todo' },
        { id: 'action-2-2', title: 'Analyze metrics for an existing feature', category: 'Project', status: 'todo' },
        { id: 'action-2-3', title: 'Participate in a roadmap brainstorming session', category: 'Task', status: 'todo' },
      ],
    },
    {
      id: 'phase-3',
      number: 3,
      title: 'Product Tools & Agile',
      duration: '2 months',
      description: 'Gain proficiency in common product management tools and agile methodologies.',
      progress: 0,
      actions: [
        { id: 'action-3-1', title: 'Master Jira for product backlogs', category: 'Task', status: 'todo' },
        { id: 'action-3-2', title: 'Lead a sprint planning meeting (shadowing first)', category: 'Mentoring', status: 'todo' },
      ],
    },
    {
      id: 'phase-4',
      number: 4,
      title: 'Feature Ownership',
      duration: '3 months',
      description: 'Take ownership of a small feature from ideation to launch and iteration.',
      progress: 0,
      actions: [
        { id: 'action-4-1', title: 'Define requirements for a new feature', category: 'Project', status: 'todo' },
        { id: 'action-4-2', title: 'Create a report for a product feature', category: 'Project', status: 'todo' },
        { id: 'action-4-3', title: 'Present feature outcomes to stakeholders', category: 'Task', status: 'todo' },
      ],
    },
  ] as RoutePhase[],
};

// Add other actions from the image to the relevant phases if needed.
// Example from image:
// { id: 'action-x-y', title: 'Complete "Intro to Product Management" course', category: 'Training', status: 'todo' },
// { id: 'action-x-z', title: 'Create a report for a product feature', category: 'Project', status: 'todo' },
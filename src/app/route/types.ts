// src/app/route/types.ts
import { type LucideIcon } from "lucide-react";

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

export interface CareerRoutePlan {
  title: string;
  targetRole: string;
  subtitle: string;
  description: string;
  totalDuration: string;
  phases: RoutePhase[];
}
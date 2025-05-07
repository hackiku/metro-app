// src/types/app.ts

// Import the engine types, which are newer and better organized
export * from './engine';

// Organization types
export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  created_at: string;
}

// User types
export type UserRole = "employee" | "manager" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  current_job_family_id?: string | null;
  current_position_details_id?: string | null;
  level: string;
  years_in_role: number;
  role: UserRole;
  created_at: string;
}

// Career path and position types
export interface CareerPath {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
}

export interface Position {
  id: string;
  organization_id: string;
  name: string;
  base_description?: string | null;
  created_at: string;
}

export interface PositionDetail {
  id: string;
  organization_id: string;
  position_id: string;
  career_path_id: string;
  level: number;
  path_specific_description?: string | null;
  sequence_in_path?: number | null;
  created_at: string;
  work_focus?: string | null;
  team_interaction?: string | null;
  work_style?: string | null;
  position?: Position;
  career_path?: CareerPath;
}

// Competence types
export interface Competence {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  organization_id: string | null;
}

export interface UserCompetence {
  id: string;
  user_id: string;
  competence_id: string;
  current_level: number;
  target_level: number | null;
  last_assessed_at: string;
  competence?: Competence;
}

// Career plan types
export interface UserCareerPlan {
  id: string;
  user_id: string;
  organization_id: string;
  target_position_details_id: string;
  status: 'active' | 'completed' | 'archived';
  estimated_total_duration: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  target_position_details?: PositionDetail;
  phases?: PlanPhase[];
}

export interface PlanPhase {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  sequence: number;
  duration: string | null;
  created_at: string;
  actions?: PlanAction[];
}

export interface PlanAction {
  id: string;
  phase_id: string;
  title: string;
  description: string | null;
  category: string;
  status: 'todo' | 'in-progress' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// Development types
export interface DevelopmentActivity {
  id: string;
  competence_id: string | null;
  activity_type: 'job' | 'social' | 'formal';
  description: string;
}
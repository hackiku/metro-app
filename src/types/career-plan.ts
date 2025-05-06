// src/types/career-plan.ts

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
  target_position_details?: {
    id: string;
    position?: {
      id: string;
      name: string;
    };
    career_path?: {
      id: string;
      name: string;
      color: string | null;
    };
  };
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
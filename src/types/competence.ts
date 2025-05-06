// src/types/competence.ts

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
  current_level: number; // 0-5
  target_level: number | null;
  last_assessed_at: string; // ISO date
  competence?: Competence; // For joined data
}

export interface PositionDetailCompetence {
  id: string;
  position_details_id: string;
  competence_id: string;
  required_level: number; // 0-5
  importance_level: number | null; // 1-5
  competence?: Competence; // For joined data
}
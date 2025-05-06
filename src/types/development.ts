// src/types/development.ts

export interface LearningResource {
  id: string;
  organization_id: string | null;
  title: string;
  description: string | null;
  url: string | null;
  type: string;
  source: string | null;
  estimated_duration: string | null;
  created_at: string; // ISO date
}

export interface DevelopmentActivity {
  id: string;
  competence_id: string | null;
  activity_type: 'job' | 'social' | 'formal';
  description: string;
}
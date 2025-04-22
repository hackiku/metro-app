// src/types/compass.ts

export interface Organization {
	id: string; // UUID
	name: string;
	description?: string | null;
	logo_url?: string | null;
	primary_color?: string | null;
	secondary_color?: string | null;
	created_at: string; // Timestamp
	docs?: any | null; // JSONB?
}

export interface CareerPath {
	id: string; // UUID
	organization_id: string; // UUID
	name: string;
	description?: string | null;
	color?: string | null; // Keep for visualization
	created_at: string;
}

export interface Position {
	id: string; // UUID
	organization_id: string; // UUID
	name: string;
	base_description?: string | null;
	created_at: string;
}

export interface PositionDetail {
	id: string; // UUID
	organization_id: string; // UUID
	position_id: string; // FK to positions
	career_path_id: string; // FK to career_paths
	level: number;
	path_specific_description?: string | null;
	sequence_in_path?: number | null;
	created_at: string;
}

export interface Transition {
	id: string; // UUID
	organization_id: string; // UUID
	from_position_detail_id: string; // FK to position_details
	to_position_detail_id: string; // FK to position_details
	type?: string | null; // e.g., 'promotion', 'lateral'
	is_recommended?: boolean | null;
	created_at: string;
	// Add other fields from your actual 'position_transitions' table
}

export interface Skill {
	id: string; // UUID
	organization_id: string; // UUID
	name: string;
	description?: string | null;
	category?: string | null;
	created_at: string;
}

export interface PositionDetailSkill {
	id: string; // UUID
	organization_id: string; // UUID
	position_detail_id: string; // FK to position_details
	skill_id: string; // FK to skills
	required_level?: number | null;
	importance?: string | null; // e.g., 'core', 'secondary'
	created_at: string;
}

// Add User types later if needed for this context
// src/app/_components/metro/types/index.ts

// Core career domain entities
export interface Role {
	id: string;
	name: string;
	level: number; // 1-5 scale representing seniority
	description: string;
	careerPathId: string; // Which career path this role belongs to
	requiredSkills: RoleSkill[]; // Skills required for this role
	x?: number; // Position for visualization (populated at runtime)
	y?: number; // Position for visualization (populated at runtime)
}

export interface Skill {
	id: string;
	name: string;
	category: "technical" | "soft" | "domain" | "leadership";
	description: string;
}

export interface RoleSkill {
	skillId: string;
	skillName: string; // Denormalized for convenience
	requiredLevel: number; // 1-5 scale
}

export interface CareerPath {
	id: string;
	name: string;
	description: string;
	color: string; // For visualization
	roles: Role[]; // Roles in this path
}

export interface Transition {
	id: string;
	fromRoleId: string;
	toRoleId: string;
	estimatedMonths: number;
	isRecommended: boolean;
	developmentSteps: DevelopmentStep[];
}

export interface DevelopmentStep {
	id: string;
	name: string;
	description: string;
	type: "training" | "experience" | "certification" | "mentoring";
	durationWeeks: number;
}

export interface SkillGap {
	skillId: string;
	skillName: string;
	currentLevel: number;
	requiredLevel: number;
	gap: number; // Calculated difference
}

// User progress tracking
export interface UserProfile {
	id: string;
	name: string;
	currentRoleId: string;
	targetRoleId?: string;
	skills: UserSkill[];
}

export interface UserSkill {
	skillId: string;
	skillName: string;
	currentLevel: number; // 0-5 scale
}

export interface DevelopmentPlan {
	id: string;
	userId: string;
	targetRoleId: string;
	createdAt: string; // ISO date
	steps: PlanStep[];
}

export interface PlanStep {
	id: string;
	developmentStepId: string;
	status: "not_started" | "in_progress" | "completed";
	order: number;
}

// Visualization state types
export interface MapViewState {
	zoom: number;
	position: { x: number, y: number };
	selectedRoleId: string | null;
	selectedPathId: string | null;
	detailsOpen: boolean;
}

// Filter options
export interface FilterOptions {
	skillCategory: string;
	searchQuery: string;
	levelRange: [number, number];
}
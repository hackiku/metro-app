// src/types/user/index.ts

/**
 * User domain entities
 */

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
	estimatedStartDate?: string; // ISO date
	estimatedEndDate?: string; // ISO date
	completedAt?: string; // ISO date
}
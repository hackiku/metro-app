// src/types/career/index.ts

/**
 * Core career domain entities
 */

export interface CareerPath {
	id: string;
	name: string;
	description: string;
	color: string;
	roles: Role[];
}

export interface Role {
	id: string;
	name: string;
	level: number; // 1-5 scale representing seniority
	description: string;
	careerPathId: string;
	requiredSkills: RoleSkill[];
}

export interface Skill {
	id: string;
	name: string;
	category: "technical" | "soft" | "domain" | "leadership";
	description: string;
}

export interface RoleSkill {
	skillId: string;
	skillName: string;
	requiredLevel: number; // 1-5 scale
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
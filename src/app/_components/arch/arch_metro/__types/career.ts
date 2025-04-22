// src/app/_components/metro/types/career.ts

// Core entities
export interface Career {
	id: string;
	name: string;
	description: string;
	domains: string[]; // Areas of the business this applies to
}

export interface Role {
	id: string;
	name: string;
	level: number; // 1-5 junior to senior
	description: string;
	requiredSkills: RoleSkill[];
	careerPathId: string;
}

export interface Skill {
	id: string;
	name: string;
	category: "technical" | "soft" | "domain" | "leadership";
	description: string;
}

export interface RoleSkill {
	skillId: string;
	requiredLevel: number; // 1-5 basic to expert
}

export interface CareerPath {
	id: string;
	name: string;
	description: string;
	roles: string[]; // Role IDs in sequence
	color: string; // For visualization
}

export interface TransitionRequirement {
	fromRoleId: string;
	toRoleId: string;
	skillGaps: SkillGap[];
	estimatedTimeMonths: number;
	developmentSteps: DevelopmentStep[];
}

// Supporting entities for user progress
export interface UserProfile {
	id: string;
	name: string;
	currentRoleId: string;
	skills: UserSkill[];
	targetRoleId: string;
	developmentPlan: DevelopmentPlan;
}
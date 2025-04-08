// src/app/_components/metro/types/development.ts

import type { MetroStation } from "./metro";

// Development pathway between stations
export interface DevelopmentPath {
	id: string;
	fromStationId: string;
	toStationId: string;
	difficulty: number; // 1-5 scale
	estimatedMonths: number;
	isRecommended: boolean;
	developmentSteps: DevelopmentStep[];
}

// Individual development step
export interface DevelopmentStep {
	id: string;
	name: string;
	description: string;
	type: "onTheJob" | "socialLearning" | "formalLearning";
	durationWeeks: number;
	order: number;
}

// Competency/skill gap
export interface CompetencyGap {
	skillId: string;
	skillName: string;
	currentLevel: number;
	requiredLevel: number;
	gap: number; // Calculated difference
}

// Career journey plan
export interface CareerPlan {
	id: string;
	userId: string;
	name: string;
	description: string;
	currentStationId: string;
	targetStationId: string;
	intermediateStationIds: string[];
	estimatedCompletionDate: string; // ISO date
	createdAt: string; // ISO date
}

// Step in a career plan
export interface CareerPlanStep {
	id: string;
	careerPlanId: string;
	stationId: string;
	stepOrder: number;
	estimatedStartDate: string; // ISO date
	estimatedEndDate: string; // ISO date
}

// Complete journey with all dependencies
export interface DevelopmentJourney {
	currentStation: MetroStation;
	targetStation: MetroStation;
	intermediateStations: MetroStation[];
	paths: DevelopmentPath[];
	competencyGaps: CompetencyGap[];
	estimatedTotalMonths: number;
}
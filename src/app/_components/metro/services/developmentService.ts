// src/app/_components/metro/services/developmentService.ts

import { supabase } from "~/server/db/supabase";
import type { MetroStation } from "../types/metro";
import type {
	DevelopmentPath,
	DevelopmentStep,
	CompetencyGap,
	DevelopmentJourney
} from "../types/development";

// Fetch development path between two stations
export async function fetchDevelopmentPath(
	fromStationId: string,
	toStationId: string,
	schema: string = 'gasunie'
): Promise<DevelopmentPath | null> {
	try {
		const { data, error } = await supabase
			.schema(schema)
			.from('station_connections')
			.select('id, transition_difficulty, estimated_months, is_recommended')
			.eq('from_station_id', fromStationId)
			.eq('to_station_id', toStationId)
			.single();

		if (error || !data) {
			console.error('Error fetching development path:', error);
			return null;
		}

		return {
			id: data.id,
			fromStationId,
			toStationId,
			difficulty: data.transition_difficulty || 3,
			estimatedMonths: data.estimated_months || 12,
			isRecommended: data.is_recommended || false
		};
	} catch (error) {
		console.error('Error in fetchDevelopmentPath:', error);
		return null;
	}
}

// Fetch development steps for a path
export async function fetchDevelopmentSteps(
	pathId: string,
	schema: string = 'gasunie'
): Promise<DevelopmentStep[]> {
	try {
		const { data, error } = await supabase
			.schema(schema)
			.from('development_steps')
			.select('id, name, description, step_type, duration_weeks')
			.eq('connection_id', pathId);

		if (error) {
			console.error('Error fetching development steps:', error);
			return [];
		}

		// Map to our development step interface
		return (data || []).map(step => ({
			id: step.id,
			name: step.name,
			description: step.description || '',
			type: mapStepType(step.step_type),
			durationWeeks: step.duration_weeks || 4
		}));
	} catch (error) {
		console.error('Error in fetchDevelopmentSteps:', error);
		return [];
	}
}

// Fetch competency gaps between stations
export async function fetchCompetencyGaps(
	fromStationId: string,
	toStationId: string,
	schema: string = 'gasunie'
): Promise<CompetencyGap[]> {
	try {
		// First get the skills required for both stations
		const [fromSkills, toSkills] = await Promise.all([
			fetchStationSkills(fromStationId, schema),
			fetchStationSkills(toStationId, schema)
		]);

		// Create a map of skill IDs to level for the current station
		const currentLevels = new Map();
		fromSkills.forEach(skill => {
			currentLevels.set(skill.skillId, skill.level);
		});

		// Calculate gaps
		const gaps: CompetencyGap[] = [];
		toSkills.forEach(targetSkill => {
			const currentLevel = currentLevels.get(targetSkill.skillId) || 0;
			const requiredLevel = targetSkill.level;

			// Only include if there's a gap
			if (requiredLevel > currentLevel) {
				gaps.push({
					skillId: targetSkill.skillId,
					skillName: targetSkill.skillName,
					currentLevel,
					requiredLevel,
					gap: requiredLevel - currentLevel
				});
			}
		});

		return gaps;
	} catch (error) {
		console.error('Error in fetchCompetencyGaps:', error);
		return [];
	}
}

// Helper to fetch skills for a station
async function fetchStationSkills(
	stationId: string,
	schema: string
): Promise<Array<{ skillId: string, skillName: string, level: number }>> {
	const { data, error } = await supabase
		.schema(schema)
		.from('station_skills')
		.select(`
      skill_id,
      importance_level,
      skills:skill_id(name)
    `)
		.eq('station_id', stationId);

	if (error || !data) {
		console.error('Error fetching station skills:', error);
		return [];
	}

	return data.map(item => ({
		skillId: item.skill_id,
		skillName: item.skills?.name || 'Unknown Skill',
		level: item.importance_level || 1
	}));
}

// Fetch a complete development journey
export async function fetchDevelopmentJourney(
	currentStationId: string,
	targetStationId: string,
	schema: string = 'gasunie'
): Promise<DevelopmentJourney> {
	try {
		// Fetch current and target stations
		const [currentStation, targetStation] = await Promise.all([
			fetchStationById(currentStationId, schema),
			fetchStationById(targetStationId, schema)
		]);

		if (!currentStation || !targetStation) {
			throw new Error("Could not find one or both stations");
		}

		// Fetch the development path
		const path = await fetchDevelopmentPath(currentStationId, targetStationId, schema);

		// Fetch development steps if path exists
		const developmentSteps = path
			? await fetchDevelopmentSteps(path.id, schema)
			: [];

		// Fetch competency gaps
		const competencyGaps = await fetchCompetencyGaps(currentStationId, targetStationId, schema);

		return {
			currentStation,
			targetStation,
			path,
			developmentSteps,
			competencyGaps,
			estimatedMonths: path?.estimatedMonths || 0
		};
	} catch (error) {
		console.error('Error in fetchDevelopmentJourney:', error);
		// Return a partially populated journey with the current station
		return {
			currentStation: await fetchStationById(currentStationId, schema) || createDummyStation(currentStationId),
			targetStation: null,
			path: null,
			developmentSteps: [],
			competencyGaps: [],
			estimatedMonths: 0
		};
	}
}

// Helper to fetch a station by ID
async function fetchStationById(
	stationId: string,
	schema: string
): Promise<MetroStation | null> {
	const { data, error } = await supabase
		.schema(schema)
		.from('metro_stations')
		.select(`
      id, 
      name, 
      description,
      position_x, 
      position_y,
      job_level_id
    `)
		.eq('id', stationId)
		.single();

	if (error || !data) {
		console.error('Error fetching station:', error);
		return null;
	}

	return {
		id: data.id,
		name: data.name,
		description: data.description || '',
		level: parseInt(data.job_level_id?.slice(0, 1) || '1', 10),
		x: data.position_x || 0,
		y: data.position_y || 0
	};
}

// Create a dummy station as fallback
function createDummyStation(id: string): MetroStation {
	return {
		id,
		name: "Unknown Station",
		description: "Station information not available",
		level: 1,
		x: 0,
		y: 0
	};
}

// Map database step types to our enum
function mapStepType(type: string | null): "onTheJob" | "socialLearning" | "formalLearning" {
	if (!type) return "onTheJob";

	type = type.toLowerCase();

	if (type.includes('training') || type.includes('certification')) {
		return "formalLearning";
	} else if (type.includes('mentoring') || type.includes('feedback')) {
		return "socialLearning";
	} else {
		return "onTheJob";
	}
}
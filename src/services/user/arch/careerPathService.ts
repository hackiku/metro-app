// src/services/career/careerPathService.ts

import { careersClient } from '~/server/supabase';
import type { CareerPath, Role } from '~/types/career';

/**
 * Fetches all career paths with their associated roles
 * @returns A promise resolving to an array of career paths
 */
export async function fetchCareerPaths(): Promise<CareerPath[]> {
	try {
		// Fetch career paths
		const { data: pathsData, error: pathsError } = await careersClient
			.from('career_paths')
			.select('id, name, description, color');

		if (pathsError) {
			console.error('Error fetching career paths:', pathsError);
			return [];
		}

		// Fetch roles for each path
		const careerPaths = await Promise.all(
			pathsData.map(async (path) => {
				const { data: rolesData, error: rolesError } = await careersClient
					.from('roles')
					.select(`
            id, 
            name, 
            level,
            description
          `)
					.eq('career_path_id', path.id)
					.order('level', { ascending: true });

				if (rolesError) {
					console.error(`Error fetching roles for path ${path.id}:`, rolesError);
					return {
						...path,
						roles: []
					};
				}

				// For each role, fetch its required skills
				const rolesWithSkills = await Promise.all(
					rolesData.map(async (role) => {
						const { data: skillsData, error: skillsError } = await careersClient
							.from('role_skills')
							.select(`
                skill_id,
                required_level,
                skills:skill_id(id, name, category, description)
              `)
							.eq('role_id', role.id);

						if (skillsError) {
							console.error(`Error fetching skills for role ${role.id}:`, skillsError);
							return {
								...role,
								requiredSkills: [],
								careerPathId: path.id
							};
						}

						// Transform the skills data
						const requiredSkills = skillsData.map(item => ({
							skillId: item.skill_id,
							skillName: item.skills?.name || 'Unknown Skill',
							requiredLevel: item.required_level
						}));

						return {
							...role,
							requiredSkills,
							careerPathId: path.id
						};
					})
				);

				return {
					...path,
					roles: rolesWithSkills
				};
			})
		);

		return careerPaths;
	} catch (error) {
		console.error('Error in fetchCareerPaths:', error);
		return [];
	}
}

/**
 * Fetches a single career path by ID with all roles
 * @param pathId The ID of the career path to fetch
 */
export async function fetchCareerPathById(pathId: string): Promise<CareerPath | null> {
	try {
		const { data, error } = await careersClient
			.from('career_paths')
			.select('id, name, description, color')
			.eq('id', pathId)
			.single();

		if (error || !data) {
			console.error('Error fetching career path:', error);
			return null;
		}

		// Fetch roles for this path
		const { data: rolesData, error: rolesError } = await careersClient
			.from('roles')
			.select(`
        id, 
        name, 
        level,
        description
      `)
			.eq('career_path_id', pathId)
			.order('level', { ascending: true });

		if (rolesError) {
			console.error(`Error fetching roles for path ${pathId}:`, rolesError);
			return {
				...data,
				roles: []
			};
		}

		// Process roles to include required skills
		// (Simplified for brevity - in production you'd fetch skills too)
		const roles = rolesData.map(role => ({
			...role,
			requiredSkills: [], // Fetch these in a real implementation
			careerPathId: pathId
		}));

		return {
			...data,
			roles
		};
	} catch (error) {
		console.error(`Error fetching career path ${pathId}:`, error);
		return null;
	}
}
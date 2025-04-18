// src/app/_components/metro/services/dataService.ts

import { careersClient } from "~/server/db/supabase";
import { CareerPath, Role, Skill, Transition, UserProfile } from "../types";

/**
 * Fetches all career paths with their roles
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
 * Fetches all role transitions (connections between roles)
 */
export async function fetchTransitions(): Promise<Transition[]> {
	try {
		// First check if the table exists and debug
		const { data: tableInfo, error: tableError } = await careersClient
			.from('role_transitions')
			.select('*', { count: 'exact', head: true })

		if (tableError) {
			console.error('Error checking role_transitions table:', tableError);
			return [];
		}

		console.log('Role transitions table info:', tableInfo);

		// Fetch transitions with proper column selection
		const { data: transitionsData, error: transitionsError } = await careersClient
			.from('role_transitions')
			.select(`
        id,
        from_role_id,
        to_role_id,
        estimated_months,
        is_recommended
      `);

		if (transitionsError) {
			console.error('Error fetching transitions:', transitionsError);
			return [];
		}

		if (!transitionsData || transitionsData.length === 0) {
			console.log('No transitions found');
			return [];
		}

		// For each transition, fetch its development steps
		const transitionsWithSteps = await Promise.all(
			transitionsData.map(async (transition) => {
				const { data: stepsData, error: stepsError } = await careersClient
					.from('development_steps')
					.select(`
            id,
            name,
            description,
            step_type,
            duration_weeks,
            order_index
          `)
					.eq('transition_id', transition.id)
					.order('order_index', { ascending: true });

				if (stepsError) {
					console.error(`Error fetching steps for transition ${transition.id}:`, stepsError);
					return {
						id: transition.id,
						fromRoleId: transition.from_role_id,
						toRoleId: transition.to_role_id,
						estimatedMonths: transition.estimated_months,
						isRecommended: transition.is_recommended,
						developmentSteps: []
					};
				}

				// Transform the steps data
				const developmentSteps = stepsData ? stepsData.map(step => ({
					id: step.id,
					name: step.name,
					description: step.description,
					type: step.step_type as "training" | "experience" | "certification" | "mentoring",
					durationWeeks: step.duration_weeks
				})) : [];

				return {
					id: transition.id,
					fromRoleId: transition.from_role_id,
					toRoleId: transition.to_role_id,
					estimatedMonths: transition.estimated_months,
					isRecommended: transition.is_recommended,
					developmentSteps
				};
			})
		);

		return transitionsWithSteps;
	} catch (error) {
		console.error('Error in fetchTransitions:', error);
		// Return empty array with detailed error info
		console.log('Error details:', JSON.stringify(error));
		return [];
	}
}

/**
 * Fetches user profile with current skills
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
	try {
		// Fetch user basic information
		const { data: userData, error: userError } = await careersClient
			.from('users')
			.select(`
        id,
        name,
        current_role_id,
        target_role_id
      `)
			.eq('id', userId)
			.single();

		if (userError) {
			console.error('Error fetching user profile:', userError);
			return null;
		}

		// Fetch user skills
		const { data: skillsData, error: skillsError } = await careersClient
			.from('user_skills')
			.select(`
        skill_id,
        current_level,
        skills:skill_id(name)
      `)
			.eq('user_id', userId);

		if (skillsError) {
			console.error('Error fetching user skills:', skillsError);
			return {
				...userData,
				skills: []
			};
		}

		// Transform skills data
		const skills = skillsData.map(item => ({
			skillId: item.skill_id,
			skillName: item.skills?.name || 'Unknown Skill',
			currentLevel: item.current_level
		}));

		return {
			id: userData.id,
			name: userData.name,
			currentRoleId: userData.current_role_id,
			targetRoleId: userData.target_role_id,
			skills
		};
	} catch (error) {
		console.error('Error in fetchUserProfile:', error);
		return null;
	}
}

/**
 * Fetches a demo user profile for testing
 */
export async function fetchDemoUserProfile(): Promise<UserProfile | null> {
	try {
		// Get the first user from the database for demo purposes
		const { data: users, error: usersError } = await careersClient
			.from('users')
			.select('id')
			.limit(1);

		if (usersError || !users || users.length === 0) {
			console.error('Error fetching demo user:', usersError);
			return createFallbackUserProfile();
		}

		return fetchUserProfile(users[0].id);
	} catch (error) {
		console.error('Error in fetchDemoUserProfile:', error);
		return createFallbackUserProfile();
	}
}

/**
 * Creates a fallback user profile for when the database is unavailable
 */
function createFallbackUserProfile(): UserProfile {
	return {
		id: 'demo-user',
		name: 'Demo User',
		currentRoleId: 'fallback-role-1',
		skills: [
			{ skillId: 'skill-1', skillName: 'Data Analysis', currentLevel: 2 },
			{ skillId: 'skill-2', skillName: 'SQL', currentLevel: 2 },
			{ skillId: 'skill-3', skillName: 'Product Thinking', currentLevel: 1 }
		]
	};
}
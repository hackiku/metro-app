// src/services/career/userService.ts

import { careersClient } from '../api/supabase';
import type { UserProfile } from '~/types/career';

/**
 * Fetches user profile with current skills
 * @param userId The ID of the user
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
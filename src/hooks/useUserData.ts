// src/hooks/useUserData.ts
import { useState, useEffect } from 'react';
import { supabase } from '~/server/db/supabase';

export interface UserSkill {
	id: string;
	name: string;
	category: string;
	proficiency: number; // 0-100 scale
}

export interface UserData {
	id: string;
	name: string;
	email: string;
	position: string;
	department: string;
	level: string;
	yearsInRole: number;
	skills: UserSkill[];
	jobFamilyId?: string; // current_job_family_id in the DB
}

export function useUserData() {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchUserData() {
			try {
				setIsLoading(true);

				// For demo purposes, fetch the first user from users table
				const { data: users, error: usersError } = await supabase
					.from('users')
					.select('id, email, full_name, level, years_in_role, current_job_family_id')
					.limit(1);

				if (usersError) throw new Error(`Error fetching user: ${usersError.message}`);
				if (!users || users.length === 0) throw new Error('No users found');

				const user = users[0];

				// Fetch job family data to get position name and department
				let position = "Employee";
				let department = "Department";

				if (user.current_job_family_id) {
					const { data: jobFamily, error: jobFamilyError } = await supabase
						.from('job_families')
						.select('name, department')
						.eq('id', user.current_job_family_id)
						.single();

					if (!jobFamilyError && jobFamily) {
						position = jobFamily.name;
						department = jobFamily.department;
					}
				}

				// For demo, create some mock skills since we don't have the skills table yet
				const mockSkills: UserSkill[] = [
					{ id: '1', name: 'JavaScript', category: 'Technical', proficiency: 85 },
					{ id: '2', name: 'Data Analysis', category: 'Technical', proficiency: 70 },
					{ id: '3', name: 'Leadership', category: 'Leadership', proficiency: 65 },
					{ id: '4', name: 'Communication', category: 'Soft Skills', proficiency: 80 },
					{ id: '5', name: 'Product Knowledge', category: 'Domain Knowledge', proficiency: 75 },
				];

				// Transform DB data to our UserData format
				setUserData({
					id: user.id,
					name: user.full_name || 'Demo User',
					email: user.email || 'user@example.com',
					position: position,
					department: department,
					level: user.level || 'Senior',
					yearsInRole: parseFloat(user.years_in_role) || 2.5,
					skills: mockSkills,
					jobFamilyId: user.current_job_family_id,
				});

			} catch (err) {
				console.error('Error fetching user data:', err);
				setError(err instanceof Error ? err.message : 'An unexpected error occurred');

				// Provide fallback data for demo purposes
				setUserData({
					id: 'demo-123',
					name: 'Demo User',
					email: 'demo@example.com',
					position: 'Software Engineer',
					department: 'Technology',
					level: 'Senior',
					yearsInRole: 2.5,
					skills: [
						{ id: '1', name: 'JavaScript', category: 'Technical', proficiency: 85 },
						{ id: '2', name: 'Data Analysis', category: 'Technical', proficiency: 70 },
						{ id: '3', name: 'Leadership', category: 'Leadership', proficiency: 65 },
						{ id: '4', name: 'Communication', category: 'Soft Skills', proficiency: 80 },
						{ id: '5', name: 'Product Knowledge', category: 'Domain Knowledge', proficiency: 75 },
					],
				});
			} finally {
				setIsLoading(false);
			}
		}

		fetchUserData();
	}, []);

	return { userData, isLoading, error };
}
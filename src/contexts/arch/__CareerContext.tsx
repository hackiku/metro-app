"use client";

// src/contexts/CareerContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CareerPath, Role, Skill, Transition, SkillGap } from "~/types/career";
import { careersClient } from "~/server/db/supabase";

interface CareerContextType {
	// Data
	careerPaths: CareerPath[];
	transitions: Transition[];
	skills: Skill[];

	// Loading state
	loading: boolean;
	error: string | null;

	// Actions
	refreshData: () => Promise<void>;
	getCareerPathById: (pathId: string) => CareerPath | undefined;
	getRoleById: (roleId: string) => Role | undefined;
	getTransitionsForRole: (roleId: string) => Transition[];
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export function CareerProvider({ children }: { children: ReactNode }) {
	// Data state
	const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
	const [transitions, setTransitions] = useState<Transition[]>([]);
	const [skills, setSkills] = useState<Skill[]>([]);

	// Loading state
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load initial data
	useEffect(() => {
		loadData();
	}, []);

	// Load all career data from API
	async function loadData() {
		try {
			setLoading(true);
			setError(null);

			// Fetch career paths with roles
			const { data: pathsData, error: pathsError } = await careersClient
				.from('career_paths')
				.select('id, name, description, color');

			if (pathsError) {
				throw new Error(`Error fetching career paths: ${pathsError.message}`);
			}

			// Fetch roles for each path
			const pathsWithRoles = await Promise.all(
				pathsData.map(async (path) => {
					const { data: rolesData, error: rolesError } = await careersClient
						.from('roles')
						.select('id, name, level, description')
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

			// Fetch all transitions
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
				throw new Error(`Error fetching transitions: ${transitionsError.message}`);
			}

			// For each transition, fetch development steps
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
					const developmentSteps = stepsData.map(step => ({
						id: step.id,
						name: step.name,
						description: step.description,
						type: step.step_type as "training" | "experience" | "certification" | "mentoring",
						durationWeeks: step.duration_weeks
					}));

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

			// Fetch all skills for reference
			const { data: skillsData, error: skillsError } = await careersClient
				.from('skills')
				.select('id, name, category, description');

			if (skillsError) {
				throw new Error(`Error fetching skills: ${skillsError.message}`);
			}

			// Update state with all fetched data
			setCareerPaths(pathsWithRoles);
			setTransitions(transitionsWithSteps);
			setSkills(skillsData);

		} catch (err) {
			console.error("Error loading career data:", err);
			setError(err instanceof Error ? err.message : "An unknown error occurred");
		} finally {
			setLoading(false);
		}
	}

	// Utility function to get a career path by ID
	const getCareerPathById = (pathId: string) => {
		return careerPaths.find(path => path.id === pathId);
	};

	// Utility function to get a role by ID from any career path
	const getRoleById = (roleId: string) => {
		for (const path of careerPaths) {
			const role = path.roles.find(r => r.id === roleId);
			if (role) return role;
		}
		return undefined;
	};

	// Utility function to get transitions for a specific role
	const getTransitionsForRole = (roleId: string) => {
		return transitions.filter(t =>
			t.fromRoleId === roleId || t.toRoleId === roleId
		);
	};

	const contextValue: CareerContextType = {
		// Data
		careerPaths,
		transitions,
		skills,

		// Loading state
		loading,
		error,

		// Actions
		refreshData: loadData,
		getCareerPathById,
		getRoleById,
		getTransitionsForRole
	};

	return (
		<CareerContext.Provider value={contextValue}>
			{children}
		</CareerContext.Provider>
	);
}

export function useCareer() {
	const context = useContext(CareerContext);
	if (context === undefined) {
		throw new Error('useCareer must be used within a CareerProvider');
	}
	return context;
}
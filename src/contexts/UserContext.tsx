"use client"

// src/contexts/UserContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type {  ReactNode } from "react";
import type { UserProfile, UserSkill, DevelopmentPlan, PlanStep } from "~/types/user";
import type { SkillGap } from "~/types/career";
import { careersClient } from "~/server/db/supabase";
import { useCareer } from "./CareerContext";

interface UserContextType {
	// Data
	user: UserProfile | null;
	developmentPlan: DevelopmentPlan | null;

	// Loading state
	loading: boolean;
	error: string | null;

	// Actions
	setCurrentRole: (roleId: string) => Promise<void>;
	setTargetRole: (roleId: string) => Promise<void>;
	calculateSkillGaps: (roleId: string) => SkillGap[];
	updateUserSkill: (skillId: string, level: number) => Promise<void>;
	createDevelopmentPlan: (targetRoleId: string) => Promise<string>;
	updatePlanStepStatus: (stepId: string, status: PlanStep['status']) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	// Get career data from CareerContext
	const { getRoleById } = useCareer();

	// Data state
	const [user, setUser] = useState<UserProfile | null>(null);
	const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlan | null>(null);

	// Loading state
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load initial data
	useEffect(() => {
		loadUserData();
	}, []);

	// Load user data from API
	async function loadUserData() {
		try {
			setLoading(true);
			setError(null);

			// For demo purposes, fetch the first user
			// In a real app, this would use authentication
			const { data: usersData, error: usersError } = await careersClient
				.from('users')
				.select('id, name, current_role_id, target_role_id')
				.limit(1);

			if (usersError || !usersData || usersData.length === 0) {
				throw new Error('No users found');
			}

			const userData = usersData[0];

			// Fetch user skills
			const { data: skillsData, error: skillsError } = await careersClient
				.from('user_skills')
				.select(`
          skill_id,
          current_level,
          skills:skill_id(name)
        `)
				.eq('user_id', userData.id);

			if (skillsError) {
				throw new Error(`Error fetching user skills: ${skillsError.message}`);
			}

			// Transform skills data
			const userSkills: UserSkill[] = skillsData.map(skill => ({
				skillId: skill.skill_id,
				skillName: skill.skills?.name || 'Unknown Skill',
				currentLevel: skill.current_level
			}));

			// Build user profile
			const userProfile: UserProfile = {
				id: userData.id,
				name: userData.name,
				currentRoleId: userData.current_role_id,
				targetRoleId: userData.target_role_id,
				skills: userSkills
			};

			// If user has a target role, fetch their development plan
			if (userData.target_role_id) {
				const { data: planData, error: planError } = await careersClient
					.from('development_plans')
					.select('id, created_at')
					.eq('user_id', userData.id)
					.eq('target_role_id', userData.target_role_id)
					.order('created_at', { ascending: false })
					.limit(1);

				if (!planError && planData && planData.length > 0) {
					const plan = planData[0];

					// Fetch plan steps
					const { data: stepsData, error: stepsError } = await careersClient
						.from('plan_steps')
						.select('id, development_step_id, status, order_index, completed_at')
						.eq('plan_id', plan.id)
						.order('order_index', { ascending: true });

					if (!stepsError && stepsData) {
						const planSteps: PlanStep[] = stepsData.map(step => ({
							id: step.id,
							developmentStepId: step.development_step_id,
							status: step.status as PlanStep['status'],
							order: step.order_index,
							completedAt: step.completed_at
						}));

						setDevelopmentPlan({
							id: plan.id,
							userId: userData.id,
							targetRoleId: userData.target_role_id,
							createdAt: plan.created_at,
							steps: planSteps
						});
					}
				}
			}

			setUser(userProfile);
		} catch (err) {
			console.error("Error loading user data:", err);
			setError(err instanceof Error ? err.message : "An unknown error occurred");

			// Create fallback user for development/demo
			setUser({
				id: 'demo-user',
				name: 'Demo User',
				currentRoleId: '',
				skills: [
					{ skillId: 'skill-1', skillName: 'Data Analysis', currentLevel: 2 },
					{ skillId: 'skill-2', skillName: 'SQL', currentLevel: 2 },
					{ skillId: 'skill-3', skillName: 'Product Thinking', currentLevel: 1 }
				]
			});
		} finally {
			setLoading(false);
		}
	}

	// Update user's current role
	async function setCurrentRole(roleId: string) {
		if (!user) return;

		try {
			// Update in database
			const { error } = await careersClient
				.from('users')
				.update({ current_role_id: roleId })
				.eq('id', user.id);

			if (error) throw new Error(`Error updating current role: ${error.message}`);

			// Update local state
			setUser(prev => prev ? { ...prev, currentRoleId: roleId } : null);
		} catch (err) {
			console.error("Error setting current role:", err);
			// For demo, update the state even if the API call fails
			setUser(prev => prev ? { ...prev, currentRoleId: roleId } : null);
		}
	}

	// Update user's target role
	async function setTargetRole(roleId: string) {
		if (!user) return;

		try {
			// Update in database
			const { error } = await careersClient
				.from('users')
				.update({ target_role_id: roleId })
				.eq('id', user.id);

			if (error) throw new Error(`Error updating target role: ${error.message}`);

			// Update local state
			setUser(prev => prev ? { ...prev, targetRoleId: roleId } : null);
		} catch (err) {
			console.error("Error setting target role:", err);
			// For demo, update the state even if the API call fails
			setUser(prev => prev ? { ...prev, targetRoleId: roleId } : null);
		}
	}

	// Calculate skill gaps between user skills and role requirements
	function calculateSkillGaps(roleId: string): SkillGap[] {
		if (!user) return [];

		const role = getRoleById(roleId);
		if (!role) return [];

		return role.requiredSkills.map(requiredSkill => {
			const userSkill = user.skills.find(s => s.skillId === requiredSkill.skillId);
			const currentLevel = userSkill?.currentLevel || 0;
			const gap = requiredSkill.requiredLevel - currentLevel;

			return {
				skillId: requiredSkill.skillId,
				skillName: requiredSkill.skillName,
				currentLevel,
				requiredLevel: requiredSkill.requiredLevel,
				gap: Math.max(0, gap)
			};
		});
	}

	// Update a user's skill level
	async function updateUserSkill(skillId: string, level: number) {
		if (!user) return;

		try {
			// Check if skill exists for user
			const { data, error: checkError } = await careersClient
				.from('user_skills')
				.select('*')
				.eq('user_id', user.id)
				.eq('skill_id', skillId);

			if (checkError) throw new Error(`Error checking user skill: ${checkError.message}`);

			let updateError;

			if (data && data.length > 0) {
				// Update existing skill
				const { error } = await careersClient
					.from('user_skills')
					.update({ current_level: level })
					.eq('user_id', user.id)
					.eq('skill_id', skillId);

				updateError = error;
			} else {
				// Insert new skill
				const { error } = await careersClient
					.from('user_skills')
					.insert({
						user_id: user.id,
						skill_id: skillId,
						current_level: level
					});

				updateError = error;
			}

			if (updateError) throw new Error(`Error updating skill: ${updateError.message}`);

			// Update local state
			setUser(prev => {
				if (!prev) return prev;

				const updatedSkills = [...prev.skills];
				const existingSkillIndex = updatedSkills.findIndex(s => s.skillId === skillId);

				if (existingSkillIndex >= 0) {
					// Update existing skill
					updatedSkills[existingSkillIndex] = {
						...updatedSkills[existingSkillIndex],
						currentLevel: level
					};
				} else {
					// Add new skill
					updatedSkills.push({
						skillId,
						skillName: 'Unknown Skill', // Would be populated from API in real implementation
						currentLevel: level
					});
				}

				return {
					...prev,
					skills: updatedSkills
				};
			});
		} catch (err) {
			console.error("Error updating user skill:", err);
			// For demo, update the state even if the API call fails
			setUser(prev => {
				if (!prev) return prev;

				const updatedSkills = [...prev.skills];
				const existingSkillIndex = updatedSkills.findIndex(s => s.skillId === skillId);

				if (existingSkillIndex >= 0) {
					updatedSkills[existingSkillIndex] = {
						...updatedSkills[existingSkillIndex],
						currentLevel: level
					};
				} else {
					updatedSkills.push({
						skillId,
						skillName: 'Unknown Skill',
						currentLevel: level
					});
				}

				return {
					...prev,
					skills: updatedSkills
				};
			});
		}
	}

	// Create a new development plan
	async function createDevelopmentPlan(targetRoleId: string): Promise<string> {
		if (!user) throw new Error("No user available");

		try {
			// Create the plan
			const { data: planData, error: planError } = await careersClient
				.from('development_plans')
				.insert({
					user_id: user.id,
					target_role_id: targetRoleId
				})
				.select('id')
				.single();

			if (planError || !planData) throw new Error(`Error creating development plan: ${planError?.message}`);

			const planId = planData.id;

			// Set the plan in state (without steps for now)
			setDevelopmentPlan({
				id: planId,
				userId: user.id,
				targetRoleId,
				createdAt: new Date().toISOString(),
				steps: []
			});

			return planId;
		} catch (err) {
			console.error("Error creating development plan:", err);
			throw err;
		}
	}

	// Update a plan step status
	async function updatePlanStepStatus(stepId: string, status: PlanStep['status']) {
		if (!developmentPlan) return;

		try {
			// Update in database
			const updateData: any = { status };
			if (status === 'completed') {
				updateData.completed_at = new Date().toISOString();
			}

			const { error } = await careersClient
				.from('plan_steps')
				.update(updateData)
				.eq('id', stepId);

			if (error) throw new Error(`Error updating plan step: ${error.message}`);

			// Update local state
			setDevelopmentPlan(prev => {
				if (!prev) return prev;

				return {
					...prev,
					steps: prev.steps.map(step =>
						step.id === stepId
							? {
								...step,
								status,
								completedAt: status === 'completed' ? new Date().toISOString() : step.completedAt
							}
							: step
					)
				};
			});
		} catch (err) {
			console.error("Error updating plan step:", err);
			// For demo, update the state even if the API call fails
			setDevelopmentPlan(prev => {
				if (!prev) return prev;

				return {
					...prev,
					steps: prev.steps.map(step =>
						step.id === stepId
							? {
								...step,
								status,
								completedAt: status === 'completed' ? new Date().toISOString() : step.completedAt
							}
							: step
					)
				};
			});
		}
	}

	const contextValue: UserContextType = {
		// Data
		user,
		developmentPlan,

		// Loading state
		loading,
		error,

		// Actions
		setCurrentRole,
		setTargetRole,
		calculateSkillGaps,
		updateUserSkill,
		createDevelopmentPlan,
		updatePlanStepStatus
	};

	return (
		<UserContext.Provider value={contextValue}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
}
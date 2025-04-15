// src/services/career/transitionService.ts

import { careersClient } from '../api/supabase';
import type { Transition } from '~/types/career';

/**
 * Fetches all role transitions with their development steps
 */
export async function fetchTransitions(): Promise<Transition[]> {
	try {
		// Check if the table exists first
		const { count, error: tableError } = await careersClient
			.from('role_transitions')
			.select('*', { count: 'exact', head: true });

		if (tableError) {
			console.error('Error checking role_transitions table:', tableError);
			return [];
		}

		console.log('Role transitions count:', count);

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
		return [];
	}
}
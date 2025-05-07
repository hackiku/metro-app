// src/contexts/CareerPlanContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "./OrganizationContext";
import { useUser } from "./UserContext";

// Define the types for our context
export interface PositionDetail {
	id: string;
	position?: {
		id: string;
		name: string;
	};
	career_path?: {
		id: string;
		name: string;
		color: string | null;
	};
}

export  interface CareerPlan {
	id: string;
	status: 'active' | 'completed' | 'archived';
	estimated_total_duration: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
	target_position_details: PositionDetail;
}

export interface PlanPhase {
	id: string;
	title: string;
	description: string | null;
	sequence: number;
	duration: string | null;
	created_at: string;
	actions?: PlanAction[];
}

export interface PlanAction {
	id: string;
	title: string;
	description: string | null;
	category: string;
	status: 'todo' | 'in-progress' | 'completed';
	due_date: string | null;
	created_at: string;
	updated_at: string;
}

interface CareerPlanWithDetails extends CareerPlan {
	phases?: PlanPhase[];
}

export interface CareerPlanContextType {
	// Data
	plans: CareerPlan[];
	activePlan: CareerPlanWithDetails | null;
	selectedPlanId: string | null;

	// State
	isLoading: boolean;
	error: string | null;

	// Actions
	selectPlan: (planId: string | null) => void;
	createPlan: (targetPositionDetailId: string, notes?: string, duration?: string) => void;
	updatePlanAction: (actionId: string, status: 'todo' | 'in-progress' | 'completed') => void;
	refreshPlans: () => void;
}

const CareerPlanContext = createContext<CareerPlanContextType | undefined>(undefined);

export function CareerPlanProvider({ children }: { children: ReactNode }) {
	const { currentOrganization } = useOrganization();
	const { currentUser } = useUser();
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Query user's career plans
	const plansQuery = api.careerPlan.getUserPlans.useQuery(
		{
			userId: currentUser?.id!,
			organizationId: currentOrganization?.id!
		},
		{
			enabled: !!currentUser?.id && !!currentOrganization?.id,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Query for selected plan details
	const selectedPlanQuery = api.careerPlan.getPlanById.useQuery(
		{ id: selectedPlanId! },
		{
			enabled: !!selectedPlanId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Auto-select active plan if available
	useEffect(() => {
		if (plansQuery.data && plansQuery.data.length > 0 && !selectedPlanId) {
			// Find the active plan, or just use the first one
			const activePlan = plansQuery.data.find(p => p.status === 'active') || plansQuery.data[0];
			setSelectedPlanId(activePlan.id);
		}
	}, [plansQuery.data, selectedPlanId]);

	// Mutations
	const createPlanMutation = api.careerPlan.createPlan.useMutation({
		onSuccess: (data) => {
			setSelectedPlanId(data.id);
			api.useUtils().careerPlan.getUserPlans.invalidate({
				userId: currentUser?.id!,
				organizationId: currentOrganization?.id!
			});
		},
		onError: (error) => {
			setError(`Failed to create plan: ${error.message}`);
		}
	});

	const updateActionMutation = api.careerPlan.updateAction.useMutation({
		onSuccess: () => {
			if (selectedPlanId) {
				api.useUtils().careerPlan.getPlanById.invalidate({ id: selectedPlanId });
			}
		},
		onError: (error) => {
			setError(`Failed to update action: ${error.message}`);
		}
	});

	// Actions
	const selectPlan = (planId: string | null) => {
		setSelectedPlanId(planId);
	};

	const createPlan = (targetPositionDetailId: string, notes?: string, duration?: string) => {
		if (!currentUser?.id || !currentOrganization?.id) {
			setError("User or organization not selected");
			return;
		}

		createPlanMutation.mutate({
			userId: currentUser.id,
			organizationId: currentOrganization.id,
			targetPositionDetailsId: targetPositionDetailId,
			notes: notes || null,
			estimatedTotalDuration: duration || null
		});
	};

	const updatePlanAction = (actionId: string, status: 'todo' | 'in-progress' | 'completed') => {
		updateActionMutation.mutate({
			id: actionId,
			status
		});
	};

	const refreshPlans = () => {
		if (currentUser?.id && currentOrganization?.id) {
			api.useUtils().careerPlan.getUserPlans.invalidate({
				userId: currentUser.id,
				organizationId: currentOrganization.id
			});

			if (selectedPlanId) {
				api.useUtils().careerPlan.getPlanById.invalidate({ id: selectedPlanId });
			}
		}
	};

	// Create context value
	const contextValue = useMemo<CareerPlanContextType>(() => ({
		plans: plansQuery.data || [],
		activePlan: selectedPlanQuery.data || null,
		selectedPlanId,
		isLoading: plansQuery.isLoading || (!!selectedPlanId && selectedPlanQuery.isLoading),
		error: error || plansQuery.error?.message || selectedPlanQuery.error?.message || null,
		selectPlan,
		createPlan,
		updatePlanAction,
		refreshPlans
	}), [
		plansQuery.data,
		plansQuery.isLoading,
		plansQuery.error,
		selectedPlanQuery.data,
		selectedPlanQuery.isLoading,
		selectedPlanQuery.error,
		selectedPlanId,
		error,
		currentUser?.id,
		currentOrganization?.id
	]);

	return (
		<CareerPlanContext.Provider value={contextValue}>
			{children}
		</CareerPlanContext.Provider>
	);
}

export function useCareerPlan() {
	const context = useContext(CareerPlanContext);
	if (context === undefined) {
		throw new Error('useCareerPlan must be used within a CareerPlanProvider');
	}
	return context;
}
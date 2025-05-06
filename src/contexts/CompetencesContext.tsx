// src/contexts/CompetencesContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "./OrganizationContext";
import { useUser } from "./UserContext";

// Define the types for our context
interface Competence {
	id: string;
	name: string;
	description: string | null;
	category: string | null;
	organization_id: string | null;
}

interface UserCompetence {
	id: string;
	current_level: number;
	target_level: number | null;
	competence: Competence;
}

interface CompetencesContextType {
	// Data
	competences: Competence[];
	userCompetences: UserCompetence[];

	// State
	isLoading: boolean;
	error: string | null;

	// Actions
	updateUserCompetence: (competenceId: string, currentLevel: number, targetLevel?: number | null) => void;
	refreshCompetences: () => void;
}

const CompetencesContext = createContext<CompetencesContextType | undefined>(undefined);

export function CompetencesProvider({ children }: { children: ReactNode }) {
	const { currentOrganization } = useOrganization();
	const { currentUser } = useUser();
	const [error, setError] = useState<string | null>(null);

	// Query all competences for the organization
	const competencesQuery = api.competence.getAll.useQuery(
		{ organizationId: currentOrganization?.id! },
		{
			enabled: !!currentOrganization?.id,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Query user competences
	const userCompetencesQuery = api.user.getUserCompetences.useQuery(
		{ userId: currentUser?.id! },
		{
			enabled: !!currentUser?.id,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Mutation to update user competences
	const updateUserCompetenceMutation = api.user.updateUserCompetence.useMutation({
		onSuccess: () => {
			// Invalidate user competences query to refresh data
			api.useUtils().user.getUserCompetences.invalidate({ userId: currentUser?.id! });
		},
		onError: (error) => {
			setError(`Failed to update competence: ${error.message}`);
		}
	});

	// Function to update a user competence
	const updateUserCompetence = (competenceId: string, currentLevel: number, targetLevel?: number | null) => {
		if (!currentUser?.id) {
			setError("No user selected");
			return;
		}

		updateUserCompetenceMutation.mutate({
			userId: currentUser.id,
			competenceId,
			currentLevel,
			targetLevel
		});
	};

	// Function to manually refresh competences
	const refreshCompetences = () => {
		if (currentOrganization?.id) {
			api.useUtils().competence.getAll.invalidate({ organizationId: currentOrganization.id });
		}
		if (currentUser?.id) {
			api.useUtils().user.getUserCompetences.invalidate({ userId: currentUser.id });
		}
	};

	// Create context value with useMemo to prevent unnecessary re-renders
	const contextValue = useMemo<CompetencesContextType>(() => ({
		competences: competencesQuery.data || [],
		userCompetences: userCompetencesQuery.data || [],
		isLoading: competencesQuery.isLoading || userCompetencesQuery.isLoading,
		error: error || competencesQuery.error?.message || userCompetencesQuery.error?.message || null,
		updateUserCompetence,
		refreshCompetences
	}), [
		competencesQuery.data,
		competencesQuery.isLoading,
		competencesQuery.error,
		userCompetencesQuery.data,
		userCompetencesQuery.isLoading,
		userCompetencesQuery.error,
		error,
		currentUser?.id
	]);

	return (
		<CompetencesContext.Provider value={contextValue}>
			{children}
		</CompetencesContext.Provider>
	);
}

export function useCompetences() {
	const context = useContext(CompetencesContext);
	if (context === undefined) {
		throw new Error('useCompetences must be used within a CompetencesProvider');
	}
	return context;
}
// src/contexts/OrganizationContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "~/trpc/react";

export interface Organization {
	id: string;
	name: string;
	description?: string | null;
	logo_url?: string | null;
	primary_color?: string | null;
	secondary_color?: string | null;
	created_at: string;
}

interface OrganizationContextType {
	// Data
	organizations: Organization[];
	currentOrganization: Organization | null;

	// Loading states
	loading: boolean;
	error: string | null;

	// Actions
	setCurrentOrganization: (id: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({
	children,
	defaultOrgId
}: {
	children: ReactNode;
	defaultOrgId?: string;
}) {
	// State for all organizations
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// API query for fetching all organizations
	const { data: orgsData, isLoading: orgsLoading, error: orgsError } = api.organization.getAll.useQuery(
		undefined,
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	// Load organizations on mount
	useEffect(() => {
		if (!orgsLoading && orgsData) {
			setOrganizations(orgsData);
			setLoading(false);

			// Set default organization
			if (orgsData.length > 0) {
				// If defaultOrgId is provided and exists in data, use it
				if (defaultOrgId && orgsData.some(org => org.id === defaultOrgId)) {
					const defaultOrg = orgsData.find(org => org.id === defaultOrgId)!;
					setCurrentOrganization(defaultOrg);
				} else {
					// Otherwise use the first org
					setCurrentOrganization(orgsData[0]);
				}
			}
		}

		if (orgsError) {
			setError("Failed to load organizations");
			setLoading(false);
		}
	}, [orgsData, orgsLoading, orgsError, defaultOrgId]);

	// Handle organization switching
	const handleSetCurrentOrganization = (id: string) => {
		const org = organizations.find(org => org.id === id);
		if (org) {
			setCurrentOrganization(org);
			// You could store this in localStorage for persistence
			localStorage.setItem('currentOrgId', id);
		} else {
			console.error(`Organization with ID ${id} not found`);
		}
	};

	// Create context value
	const contextValue: OrganizationContextType = {
		organizations,
		currentOrganization,
		loading,
		error,
		setCurrentOrganization: handleSetCurrentOrganization,
	};

	return (
		<OrganizationContext.Provider value={contextValue}>
			{children}
		</OrganizationContext.Provider>
	);
}

export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (context === undefined) {
		throw new Error('useOrganization must be used within an OrganizationProvider');
	}
	return context;
}
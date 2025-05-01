// src/contexts/CareerCompassProvider.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { CareerCompassContext } from './CareerCompassContext';
import type { CareerCompassContextType } from './CareerCompassContext';
import { supabase } from '~/server/db/supabase'; // Use the default client
import type {
	Organization,
	CareerPath,
	Position,
	PositionDetail
	// Remove Transition, Skill, PositionDetailSkill types
} from '~/types/compass';

interface CareerCompassProviderProps {
	children: ReactNode;
}

export function CareerCompassProvider({ children }: CareerCompassProviderProps) {
	// Simplified state - ONLY CORE TABLES
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
	const [positions, setPositions] = useState<Position[]>([]);
	const [positionDetails, setPositionDetails] = useState<PositionDetail[]>([]);
	// REMOVED: const [posTransitions, setPosTransitions] = useState<Transition[]>([]);
	// REMOVED: const [skills, setSkills] = useState<Skill[]>([]);
	// REMOVED: const [positionDetailSkills, setPositionDetailSkills] = useState<PositionDetailSkill[]>([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadData = useCallback(async (organizationId: string) => {
		setLoading(true);
		setError(null);
		console.log(`CareerCompassProvider: Loading CORE data for org ${organizationId}...`);

		try {
			// Simplified fetch - ONLY CORE TABLES
			const results = await Promise.allSettled([
				// 0: Organization
				supabase
					.from('organizations')
					.select('*')
					.eq('id', organizationId)
					.single(),
				// 1: Career Paths
				supabase
					.from('career_paths')
					.select('*')
					.eq('organization_id', organizationId),
				// 2: Positions (Generic)
				supabase
					.from('positions')
					.select('*')
					.eq('organization_id', organizationId),
				// 3: Position Details (Specific instances in paths)
				supabase
					.from('position_details')
					.select('*')
					.eq('organization_id', organizationId),
				// REMOVED: Fetch for transitions
				// REMOVED: Fetch for skills
				// REMOVED: Fetch for position_detail_skills
			]); // End of Promise.allSettled

			// Process results
			const errors: string[] = [];

			// --- Process Organization (Result 0) ---
			const orgResult = results[0];
			// (Organization processing logic remains the same as previous version)
			if (orgResult.status === 'fulfilled') {
				if (orgResult.value.data) {
					setOrganization(orgResult.value.data as Organization);
				} else {
					if (orgResult.value.error && orgResult.value.error.code === 'PGRST116') {
						console.warn(`Organization not found: ${organizationId}`);
						setOrganization(null);
					} else if (orgResult.value.error) {
						errors.push(`Failed to fetch organization: ${orgResult.value.error.message}`);
						setOrganization(null);
					} else {
						console.warn(`Organization query returned null data without specific error for ID: ${organizationId}`);
						setOrganization(null);
					}
				}
			} else {
				errors.push(`Failed to fetch organization (Promise rejected): ${orgResult.reason?.message || 'Unknown reason'}`);
				setOrganization(null);
			}

			// --- Helper to process Array Results (Now only 1-3) ---
			const processArrayResult = <T,>(
				result: PromiseSettledResult<{ data: T[] | null; error: any }>,
				setter: React.Dispatch<React.SetStateAction<T[]>>,
				entityName: string
			): void => {
				// (processArrayResult logic remains the same as previous version)
				if (result.status === 'fulfilled') {
					if (result.value.data) {
						setter(result.value.data as T[]);
					} else {
						if (result.value.error) {
							if (result.value.error.code !== 'PGRST116') {
								errors.push(`Failed to fetch ${entityName}: ${result.value.error.message}`);
							}
							setter([]);
						} else {
							setter([]);
						}
					}
				} else {
					errors.push(`Failed to fetch ${entityName} (Promise rejected): ${result.reason?.message || 'Unknown reason'}`);
					setter([]);
				}
			}; // End of helper

			// --- Process Simplified Array Results ---
			processArrayResult(results[1], setCareerPaths, 'Career Paths');
			processArrayResult(results[2], setPositions, 'Positions');
			processArrayResult(results[3], setPositionDetails, 'Position Details');
			// REMOVED: Processing for transitions, skills, etc.

			// --- Final Error Handling ---
			if (errors.length > 0) {
				console.error("Errors loading core data:", errors);
				setError(errors.join('\n'));
			} else {
				console.log("CareerCompassProvider: Core data loaded successfully.");
				setError(null); // Clear previous error
			}

		} catch (err) {
			console.error("Unexpected error loading core career compass data:", err);
			setError(err instanceof Error ? err.message : "An unexpected error occurred");
			// Clear simplified state on error
			setOrganization(null);
			setCareerPaths([]);
			setPositions([]);
			setPositionDetails([]);
		} finally {
			setLoading(false);
		}
	}, []); // End of loadData useCallback

	// Effect to load data for 'Veenie' on initial mount (remains the same)
	useEffect(() => {
		const veenieOrgId = 'a73148de-90e1-4f0e-955d-9790c131e13c';
		loadData(veenieOrgId);
	}, [loadData]);

	// Memoize the simplified context value
	const contextValue = useMemo<CareerCompassContextType>(() => ({
		organization,
		careerPaths,
		positions,
		positionDetails,
		// REMOVED: transitions: posTransitions,
		// REMOVED: skills,
		// REMOVED: positionDetailSkills,
		loading,
		error,
		refreshData: loadData,
	}), [ // Update dependencies for useMemo
		organization,
		careerPaths,
		positions,
		positionDetails,
		loading,
		error,
		loadData
	]); // End of useMemo

	return (
		<CareerCompassContext.Provider value={contextValue}>
			{children}
		</CareerCompassContext.Provider>
	);
} // End of CareerCompassProvider component

// Custom hook remains the same
export function useCareerCompass() {
	const context = React.useContext(CareerCompassContext);
	if (context === undefined) {
		throw new Error('useCareerCompass must be used within a CareerCompassProvider');
	}
	return context;
}
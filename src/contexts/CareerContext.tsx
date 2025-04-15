// src/contexts/CareerDataContext.tsx

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchCareerPaths } from "~/services/career/careerPathService";
import { fetchTransitions } from "~/services/career/transitionService";
import { fetchDemoUserProfile } from "~/services/career/userService";
import type { CareerPath, Transition, UserProfile } from "~/types/career";

interface CareerDataContextType {
	careerPaths: CareerPath[];
	transitions: Transition[];
	userProfile: UserProfile | null;
	loading: boolean;
	error: string | null;
	refreshData: () => Promise<void>;
}

const CareerDataContext = createContext<CareerDataContextType | undefined>(undefined);

export function CareerDataProvider({ children }: { children: ReactNode }) {
	const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
	const [transitions, setTransitions] = useState<Transition[]>([]);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	async function loadData() {
		try {
			setLoading(true);
			setError(null);

			// Fetch all required data in parallel
			const [pathsData, transitionsData, userProfileData] = await Promise.all([
				fetchCareerPaths(),
				fetchTransitions(),
				fetchDemoUserProfile()
			]);

			setCareerPaths(pathsData);
			setTransitions(transitionsData);
			setUserProfile(userProfileData);
		} catch (err) {
			console.error("Error loading career data:", err);
			setError("Failed to load career data. Please try again later.");
		} finally {
			setLoading(false);
		}
	}

	// Initial data load
	useEffect(() => {
		loadData();
	}, []);

	return (
		<CareerDataContext.Provider
			value={{
				careerPaths,
				transitions,
				userProfile,
				loading,
				error,
				refreshData: loadData
			}}
		>
			{children}
		</CareerDataContext.Provider>
	);
}

export function useCareerData() {
	const context = useContext(CareerDataContext);
	if (context === undefined) {
		throw new Error('useCareerData must be used within a CareerDataProvider');
	}
	return context;
}
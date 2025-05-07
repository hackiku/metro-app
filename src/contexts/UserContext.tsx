// src/contexts/UserContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "./OrganizationContext";

export type UserRole = "employee" | "manager" | "admin";

export interface User {
	id: string;
	email: string;
	full_name: string;
	current_position_details_id?: string | null;
	level: string;
	years_in_role: number;
	role: UserRole; // This would come from a user_roles table in a real app
	created_at: string;
}

interface UserContextType {
	// Data
	users: User[];
	currentUser: User | null;
	currentPosition: any | null; // Add the position data

	// Loading states
	loading: boolean;
	error: string | null;

	// Actions
	setCurrentUser: (id: string | null) => void; // Update to accept null
	hasPermission: (permission: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
	children,
	defaultUserId
}: {
	children: ReactNode;
	defaultUserId?: string | null;
}) {
	// Get organization from context
	const { currentOrganization } = useOrganization();

	// State for all users and current user
	const [users, setUsers] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [currentPosition, setCurrentPosition] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// API query for fetching users
	const { data: usersData, isLoading: usersLoading, error: usersError } = api.user.getAll.useQuery(
		undefined,
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
			enabled: !!currentOrganization // Only fetch users once we have an organization
		}
	);

	// Load users when organization changes
	useEffect(() => {
		if (!usersLoading && usersData) {
			setUsers(usersData);

			// Set default user
			if (usersData.length > 0) {
				// If defaultUserId is provided and exists in data, use it
				if (defaultUserId && usersData.some(user => user.id === defaultUserId)) {
					const defaultUser = usersData.find(user => user.id === defaultUserId)!;
					setCurrentUser(defaultUser);
					localStorage.setItem('currentUserId', defaultUserId);
				} else {
					// Otherwise use the first user
					setCurrentUser(usersData[0]);
					localStorage.setItem('currentUserId', usersData[0].id);
				}
			}
		}

		if (usersError) {
			setError("Failed to load users");
		}
	}, [usersData, usersLoading, usersError, defaultUserId]);

	// Fetch position details once we have a user
	const { data: positionData, isLoading: positionLoading } = api.user.getUserPositionDetails.useQuery(
		{ userId: currentUser?.id || "" },
		{
			enabled: !!currentUser?.id,
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 3
		}
	);

	// Set position data when it loads
	useEffect(() => {
		if (positionData) {
			setCurrentPosition(positionData);
		}
	}, [positionData]);

	// Update overall loading state
	useEffect(() => {
		const isPositionLoadingNeeded = !!currentUser?.id;
		setLoading(usersLoading || (isPositionLoadingNeeded && positionLoading));
	}, [usersLoading, positionLoading, currentUser]);

	// Reset user selection when organization changes
	useEffect(() => {
		if (currentOrganization) {
			// setLoading(true);
			// Clear the current user since we're changing organizations
			// setCurrentUser(null);
			// setCurrentPosition(null);
			// The api.user.getAll query will refetch automatically
		}
	}, [currentOrganization]);

	// Handle user switching - UPDATED to handle null values
	const handleSetCurrentUser = (id: string | null) => {
		// Handle null case explicitly
		if (id === null) {
			setCurrentUser(null);
			setCurrentPosition(null);
			localStorage.removeItem('currentUserId'); // Remove from local storage
			return;
		}

		// Handle string ID case
		const user = users.find(user => user.id === id);
		if (user) {
			setCurrentUser(user);
			setCurrentPosition(null); // Reset position when user changes
			localStorage.setItem('currentUserId', id);
		} else {
			console.error(`User with ID ${id} not found`);
		}
	};

	// Simple permission check based on role
	const hasPermission = (permission: string): boolean => {
		if (!currentUser) return false;

		// Role-based permissions
		switch (permission) {
			case 'hr.access':
				return ['manager', 'admin'].includes(currentUser.role);
			case 'hr.manage_paths':
				return ['manager', 'admin'].includes(currentUser.role);
			case 'admin':
				return currentUser.role === 'admin';
			default:
				return false;
		}
	};

	// Create context value with useMemo to prevent unnecessary re-renders
	const contextValue = useMemo<UserContextType>(() => ({
		users,
		currentUser,
		currentPosition,
		loading,
		error: error || usersError?.message || null,
		setCurrentUser: handleSetCurrentUser,
		hasPermission
	}), [
		users,
		currentUser,
		currentPosition,
		loading,
		error,
		usersError
	]);

	useEffect(() => {
		if (currentOrganization && usersData) {
			// When organization changes and we have user data, 
			// get organization members to check if current user is still valid
			const checkUserInOrg = async () => {
				try {
					// This would typically be a separate query, but for now we'll simulate it
					// In a real app, you'd make an API call to check if the user is in the org
					const isUserInOrg = currentUser &&
						usersData.some(user => user.id === currentUser.id);

					if (!isUserInOrg && usersData.length > 0) {
						// Current user is not in this org, select first available user
						const newUser = usersData[0];
						console.log("Switching to first available user:", newUser.full_name);
						setCurrentUser(newUser);
						localStorage.setItem('currentUserId', newUser.id);
					} else if (!isUserInOrg) {
						// No users in this org
						setCurrentUser(null);
						localStorage.removeItem('currentUserId');
					}
					// If user is in org, keep them selected
				} catch (err) {
					console.error("Error checking user in organization:", err);
				}
			};

			checkUserInOrg();
		}
	}, [currentOrganization?.id, usersData]);

	// Debug logging
	useEffect(() => {
		console.log("UserContext - Current User:", currentUser);
		console.log("UserContext - Current Position:", currentPosition);
		console.log("UserContext - Loading State:", loading);
	}, [currentUser, currentPosition, loading]);

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
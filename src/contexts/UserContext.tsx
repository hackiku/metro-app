"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "~/trpc/react";
import { useOrganization } from "./OrganizationContext";

export type UserRole = "employee" | "manager" | "admin";

export interface User {
	id: string;
	email: string;
	full_name: string;
	current_job_family_id?: string | null;
	level: string;
	years_in_role: number;
	role: UserRole; // This would come from a user_roles table in a real app
	created_at: string;
}

interface UserContextType {
	// Data
	users: User[];
	currentUser: User | null;

	// Loading states
	loading: boolean;
	error: string | null;

	// Actions
	setCurrentUser: (id: string) => void;
	hasPermission: (permission: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
	children,
	defaultUserId
}: {
	children: ReactNode;
	defaultUserId?: string;
}) {
	// Get organization from context
	const { currentOrganization } = useOrganization();

	// State for all users and current user
	const [users, setUsers] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
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
			setLoading(false);

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
			setLoading(false);
		}
	}, [usersData, usersLoading, usersError, defaultUserId]);

	// If organization changes, we need to reset user state
	useEffect(() => {
		if (currentOrganization) {
			setLoading(true);
			// The api.user.getAll query will refetch automatically
		}
	}, [currentOrganization]);

	// Handle user switching
	const handleSetCurrentUser = (id: string) => {
		const user = users.find(user => user.id === id);
		if (user) {
			setCurrentUser(user);
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

	// Create context value
	const contextValue: UserContextType = {
		users,
		currentUser,
		loading,
		error,
		setCurrentUser: handleSetCurrentUser,
		hasPermission
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
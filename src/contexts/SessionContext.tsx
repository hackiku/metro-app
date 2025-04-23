"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SessionContextProps {
	currentUserId: string | null;
	currentOrgId: string | null;
	setCurrentOrgId: (id: string) => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
	// In a real app, this would be populated from authentication
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	// Set a default organization ID for development
	const [currentOrgId, setCurrentOrgId] = useState<string | null>(
		'a73148de-90e1-4f0e-955d-9790c131e13c' // Veenie org ID
	);

	// Simulate loading a user on mount
	useEffect(() => {
		// This would typically fetch the user from an auth system
		setCurrentUserId('0dd0a1a3-c887-43d1-af2c-b7069b4a7940'); // Placeholder ID
	}, []);

	return (
		<SessionContext.Provider
			value={{
				currentUserId,
				currentOrgId,
				setCurrentOrgId
			}}
		>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSession must be used within a SessionProvider");
	}
	return context;
}
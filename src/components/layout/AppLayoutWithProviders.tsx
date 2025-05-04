// src/components/layout/AppLayoutWithProviders.tsx

"use client";

import { useState, useEffect } from "react";
import AppLayout from "./AppLayout";
import { OrganizationProvider } from "~/contexts/OrganizationContext";
import { UserProvider } from "~/contexts/UserContext";

interface AppLayoutWithProvidersProps {
	children: React.ReactNode;
}

export default function AppLayoutWithProviders({ children }: AppLayoutWithProvidersProps) {
	const [isClient, setIsClient] = useState(false);

	// Hydration safety check
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Try to get saved IDs from localStorage (if available)
	const getSavedId = (key: string): string | null => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem(key);
		}
		return null;
	};

	if (!isClient) {
		// Simple loading state when server rendering
		return (
			<div className="h-screen flex items-center justify-center bg-background">
				<div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-foreground"></div>
			</div>
		);
	}

	// Only render the providers on the client to avoid hydration issues
	return (
		<OrganizationProvider defaultOrgId={getSavedId('currentOrgId')}>
			<UserProvider defaultUserId={getSavedId('currentUserId')}>
				<AppLayout>{children}</AppLayout>
			</UserProvider>
		</OrganizationProvider>
	);
}
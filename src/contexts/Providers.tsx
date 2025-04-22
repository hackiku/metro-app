// src/contexts/Providers.tsx
"use client";

import type { ReactNode } from "react";
// Remove old imports if they exist
// import { CareerProvider } from "./CareerContext";
// import { UserProvider } from "./UserContext";
// import { MetroVisualizationProvider } from "./MetroVisualizationContext";

// Import the NEW Provider
import { CareerCompassProvider } from "./CareerCompassProvider";

interface ProvidersProps {
	children: ReactNode;
}

/**
 * Combines all essential context providers for the application.
 * Start clean, only include what's needed now.
 */
export function Providers({ children }: ProvidersProps) {
	return (
		<CareerCompassProvider>
			{/* Add UserProvider back later when auth/user data is needed */}
			{/* <UserProvider> */}
			{children}
			{/* </UserProvider> */}
		</CareerCompassProvider>
	);
}
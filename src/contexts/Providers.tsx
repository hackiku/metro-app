// src/contexts/Providers.tsx
"use client";

import type { ReactNode } from "react";
// Import the NEW Provider
import { CareerCompassProvider } from "./CareerCompassProvider";
import { SessionProvider } from "./SessionContext";

interface ProvidersProps {
	children: ReactNode;
}

/**
 * Combines all essential context providers for the application.
 * Start clean, only include what's needed now.
 */
export function Providers({ children }: ProvidersProps) {
	return (
		<SessionProvider>
			<CareerCompassProvider>
				{children}
			</CareerCompassProvider>
		</SessionProvider>
	);
}
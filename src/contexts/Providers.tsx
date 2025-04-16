"use client";

// src/contexts/Providers.tsx
import type { ReactNode } from "react";
import { CareerProvider } from "./CareerContext";
import { UserProvider } from "./UserContext";
import { MetroVisualizationProvider } from "./MetroVisualizationContext";

interface ProvidersProps {
	children: ReactNode;
}

/**
 * Combines all context providers into a single component for easier usage
 */
export function Providers({ children }: ProvidersProps) {
	return (
		<CareerProvider>
			<UserProvider>
				<MetroVisualizationProvider>
					{children}
				</MetroVisualizationProvider>
			</UserProvider>
		</CareerProvider>
	);
}
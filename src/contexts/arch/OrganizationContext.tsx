// src/contexts/OrganizationContext.tsx

import React, { createContext, useContext, useState, useMemo } from 'react'; // Added useMemo

type Organization = {
	id: string;
	name: string;
	schema: string;
	primaryColor: string;
	logo: string;
};

// It's slightly safer to define the type for the array itself
const organizations: Organization[] = [
	{
		id: "bol",
		name: "Bol.com",
		schema: "bol",
		primaryColor: "#0000A4",
		logo: "/logos/bol.svg"
	},
	{
		id: "gasunie",
		name: "Gasunie",
		schema: "gasunie",
		primaryColor: "#FF671F",
		logo: "/logos/gasunie.svg"
	}
	// Add other organizations here
];

// Define the context type explicitly
interface OrganizationContextType {
	organization: Organization;
	setOrganization: (org: Organization) => void;
	organizations: Organization[];
}

// Create context with a default value that satisfies the type
// We use the non-null assertion operator `!` because we know organizations[0] exists
const OrganizationContext = createContext<OrganizationContextType>({
	organization: organizations[0]!, // <-- Add the '!' here
	setOrganization: () => { console.warn("setOrganization called before Provider") }, // Add a warning for default
	organizations
});

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
	// Ensure the default state is valid
	const [currentOrganization, setCurrentOrganization] = useState<Organization>(organizations[0]!);

	// Memoize the context value to prevent unnecessary re-renders
	const value = useMemo(() => ({
		organization: currentOrganization,
		setOrganization: setCurrentOrganization,
		organizations
	}), [currentOrganization]); // Only update when currentOrganization changes

	return (
		<OrganizationContext.Provider value={value}>
			{children}
		</OrganizationContext.Provider>
	);
};

export const useOrganization = () => {
	const context = useContext(OrganizationContext);
	if (context === undefined) {
		// This error will be thrown if useOrganization is used outside of an OrganizationProvider
		throw new Error('useOrganization must be used within an OrganizationProvider');
	}
	return context;
};
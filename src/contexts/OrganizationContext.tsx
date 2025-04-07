// src/contexts/OrganizationContext.tsx

import React, { createContext, useContext, useState } from 'react';

type Organization = {
	id: string;
	name: string;
	schema: string;
	primaryColor: string;
	logo: string;
};

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
];

const OrganizationContext = createContext<{
	organization: Organization;
	setOrganization: (org: Organization) => void;
	organizations: Organization[];
}>({
	organization: organizations[0],
	setOrganization: () => { },
	organizations
});

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
	const [organization, setOrganization] = useState(organizations[0]);

	return (
		<OrganizationContext.Provider value={{ organization, setOrganization, organizations }}>
			{children}
		</OrganizationContext.Provider>
	);
};

export const useOrganization = () => useContext(OrganizationContext);
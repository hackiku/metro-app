// src/components/dev/DataDevTools.tsx
"use client";

import { NavDataButton } from "./buttons/NavDataButton";
import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import { useCareerPlan } from "~/contexts/CareerPlanContext";

interface DataDevToolsProps {
	position?: 'top-right' | 'bottom-right' | 'custom';
	className?: string;
	showCurrentUser?: boolean;
	showOrganization?: boolean;
	showCompetences?: boolean;
	showCareerPlan?: boolean;
}

export function DataDevTools({
	position = 'top-right',
	className = '',
	showCurrentUser = true,
	showOrganization = true,
	showCompetences = false,
	showCareerPlan = false
}: DataDevToolsProps) {
	const { currentUser } = useUser();
	const { currentOrganization } = useOrganization();
	const { userCompetences } = useCompetences();
	const { activePlan } = useCareerPlan();

	// Only show in development
	const isDev = process.env.NODE_ENV === 'development';
	if (!isDev) return null;

	// Position classes
	const positionClasses = {
		'top-right': 'fixed top-5 right-5',
		'bottom-right': 'fixed bottom-5 right-5',
		'custom': ''
	};

	return (
		<div className={`${positionClasses[position]} ${className} flex items-center gap-2 z-50`}>
			{showCurrentUser && currentUser && (
				<NavDataButton
					data={currentUser}
					title="Edit User Data"
					entityType="user"
				/>
			)}

			{showOrganization && currentOrganization && (
				<NavDataButton
					data={currentOrganization}
					title="Edit Organization Data"
					entityType="organization"
				/>
			)}

			{showCompetences && userCompetences && userCompetences.length > 0 && (
				<NavDataButton
					data={userCompetences[0]}
					title="Edit Competence Data"
					entityType="competence"
				/>
			)}

			{showCareerPlan && activePlan && (
				<NavDataButton
					data={activePlan}
					title="View Career Plan Data"
					entityType="career_path"
				/>
			)}
		</div>
	);
}


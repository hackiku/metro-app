// Updated src/components/dev/DataDevTools.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Database } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import { useCareerPlan } from "~/contexts/CareerPlanContext";
import { X } from "lucide-react";
import { DataCard } from "./cards/DataCard";

interface DataDevToolsProps {
	position?: 'top-right' | 'bottom-right' | 'custom';
	className?: string;
}

export function DataDevTools({
	position = 'top-right',
	className = ''
}: DataDevToolsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const { currentUser } = useUser();
	const { currentOrganization } = useOrganization();
	const { userCompetences } = useCompetences();
	const { activePlan } = useCareerPlan();

	// Only show in development
	const isDev = process.env.NODE_ENV === 'development';
	if (!isDev) return null;

	// Handle clicks outside to close
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isOpen &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node) &&
				!(event.target as Element).closest('.data-grid-container')) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Position classes
	const positionClasses = {
		'top-right': 'fixed top-5 right-5',
		'bottom-right': 'fixed bottom-5 right-5',
		'custom': ''
	};

	// Function to update user data
	const handleUserUpdate = async (field: string, value: any) => {
		try {
			// The API call would go here
			console.log("Updating user field:", field, "to", value);
			// For now, just show success
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	};

	// Function to update organization data
	const handleOrgUpdate = async (field: string, value: any) => {
		try {
			// The API call would go here
			console.log("Updating organization field:", field, "to", value);
			// For now, just show success
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	};

	return (
		<>
			<div className={`${positionClasses[position]} ${className} z-50`}>
				<Button
					ref={buttonRef}
					variant="ghost"
					size="icon"
					onClick={() => setIsOpen(!isOpen)}
					className="h-7 w-7 bg-primary/5 hover:bg-primary/10"
				>
					<Database className="h-4 w-4 text-primary" />
				</Button>
				<span className="text-xs block mt-1">Dev Tools</span>
			</div>

			{isOpen && (
				<div className="data-grid-container fixed inset-x-0 z-50 mt-2 border rounded-lg shadow-lg bg-background/95 backdrop-blur-sm" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', top: '60px' }}>
					<div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b">
						<h2 className="text-xl font-semibold">Development Data Explorer</h2>
						<Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
							<X className="h-4 w-4 mr-1" />
							Close
						</Button>
					</div>

					<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
						{currentUser && (
							<DataCard
								title="User Information"
								data={currentUser}
								fields={['id', 'full_name', 'email', 'level', 'years_in_role']}
								onChange={handleUserUpdate}
								onSave={() => Promise.resolve()}
								category="primary"
							/>
						)}

						{currentOrganization && (
							<DataCard
								title="Organization"
								data={currentOrganization}
								fields={['id', 'name', 'description', 'primary_color', 'secondary_color']}
								onChange={handleOrgUpdate}
								onSave={() => Promise.resolve()}
								category="details"
							/>
						)}

						{userCompetences && userCompetences.length > 0 && (
							<DataCard
								title="Competences"
								data={userCompetences[0]}
								fields={['id', 'current_level', 'target_level']}
								onChange={() => { }}
								onSave={() => Promise.resolve()}
								category="details"
							/>
						)}

						{activePlan && (
							<DataCard
								title="Active Career Plan"
								data={activePlan}
								fields={['id', 'status', 'estimated_total_duration']}
								onChange={() => { }}
								onSave={() => Promise.resolve()}
								category="details"
							/>
						)}
					</div>
				</div>
			)}
		</>
	);
}
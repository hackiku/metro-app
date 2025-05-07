// src/components/dev/DataDevTools.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Database, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";

import { useUser } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { useCompetences } from "~/contexts/CompetencesContext";
import { useCareerPlan } from "~/contexts/CareerPlanContext";
import { usePositionRecommendations } from "~/hooks/usePositionRecommendations";

// Import entity card
import { EntityCard } from "./cards/EntityCard";

interface DataDevToolsProps {
	position?: 'top-right' | 'bottom-right' | 'custom';
	className?: string;
}

export function DataDevTools({
	position = 'top-right',
	className = ''
}: DataDevToolsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("all");
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Get data from contexts
	const { currentUser } = useUser();
	const { currentOrganization } = useOrganization();
	const { userCompetences } = useCompetences();
	const { plans, activePlan } = useCareerPlan();
	const { recommendations, currentPosition } = usePositionRecommendations();

	// Only show in development
	const isDev = process.env.NODE_ENV === 'development';
	if (!isDev) return null;

	// Handle clicks outside to close
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isOpen &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node) &&
				!(event.target as Element).closest('.data-dev-container')) {
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

	// Content for the All tab
	const renderAllTabContent = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{/* User Card */}
			{currentUser && (
				<EntityCard
					entity="user"
					data={currentUser}
					category="primary"
				/>
			)}

			{/* Organization Card */}
			{currentOrganization && (
				<EntityCard
					entity="organization"
					data={currentOrganization}
					category="primary"
				/>
			)}

			{/* Position Card */}
			{currentPosition && (
				<EntityCard
					entity="position"
					data={currentPosition}
					title="Current Position"
					category="details"
				/>
			)}

			{/* Competence Cards */}
			{userCompetences && userCompetences.length > 0 && (
				<EntityCard
					entity="competence"
					data={userCompetences[0]}
					title="User Competence"
					category="details"
				/>
			)}

			{/* Career Plan Card */}
			{activePlan && (
				<EntityCard
					entity="career_path"
					data={activePlan}
					title="Active Career Plan"
					category="relations"
				/>
			)}
		</div>
	);

	// Content for the User tab
	const renderUserTabContent = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{currentUser && (
				<>
					<EntityCard
						entity="user"
						data={currentUser}
						category="primary"
					/>
					<EntityCard
						entity="user"
						data={currentUser}
						category="details"
					/>
					<EntityCard
						entity="user"
						data={currentUser}
						category="relations"
					/>
					<EntityCard
						entity="user"
						data={currentUser}
						category="metadata"
					/>
				</>
			)}
		</div>
	);

	// Content for the Organization tab
	const renderOrganizationTabContent = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{currentOrganization && (
				<>
					<EntityCard
						entity="organization"
						data={currentOrganization}
						category="primary"
					/>
					<EntityCard
						entity="organization"
						data={currentOrganization}
						category="details"
					/>
					<EntityCard
						entity="organization"
						data={currentOrganization}
						category="metadata"
					/>
				</>
			)}
		</div>
	);

	// Content for the Competences tab
	const renderCompetencesTabContent = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{userCompetences && userCompetences.map((competence, index) => (
				<EntityCard
					key={competence.id}
					entity="competence"
					data={competence}
					title={`Competence: ${competence.competence?.name || index + 1}`}
					category="details"
				/>
			))}
		</div>
	);

	// Content for the Position tab
	const renderPositionTabContent = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{currentPosition && (
				<>
					<EntityCard
						entity="position"
						data={currentPosition}
						title="Current Position"
						category="primary"
					/>
					<EntityCard
						entity="position"
						data={currentPosition}
						title="Position Details"
						category="details"
					/>
					<EntityCard
						entity="position"
						data={currentPosition}
						title="Position Relations"
						category="relations"
					/>
				</>
			)}
		</div>
	);

	// Content for the Plans tab
	const renderPlansTabContent = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{plans && plans.map(plan => (
				<EntityCard
					key={plan.id}
					entity="career_path"
					data={plan}
					title={`Plan ${plan.id === activePlan?.id ? '(Active)' : ''}`}
					category="details"
				/>
			))}
		</div>
	);

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
				<div className="data-dev-container fixed inset-x-0 z-50 mt-2 border rounded-lg shadow-lg bg-background/95 backdrop-blur-sm" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', top: '60px' }}>
					<div className="sticky top-0 z-10 flex flex-col bg-background/95 backdrop-blur-sm border-b">
						<div className="flex items-center justify-between p-4">
							<h2 className="text-xl font-semibold">Development Data Explorer</h2>
							<Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
								<X className="h-4 w-4 mr-1" />
								Close
							</Button>
						</div>

						<div className="px-4 pb-2">
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<TabsList>
									<TabsTrigger value="all">All Data</TabsTrigger>
									<TabsTrigger value="user">User</TabsTrigger>
									<TabsTrigger value="organization">Organization</TabsTrigger>
									<TabsTrigger value="competences">Competences</TabsTrigger>
									<TabsTrigger value="position">Position</TabsTrigger>
									<TabsTrigger value="plans">Career Plans</TabsTrigger>
								</TabsList>

								<div className="py-4">
									<TabsContent value="all">
										{renderAllTabContent()}
									</TabsContent>

									<TabsContent value="user">
										{renderUserTabContent()}
									</TabsContent>

									<TabsContent value="organization">
										{renderOrganizationTabContent()}
									</TabsContent>

									<TabsContent value="competences">
										{renderCompetencesTabContent()}
									</TabsContent>

									<TabsContent value="position">
										{renderPositionTabContent()}
									</TabsContent>

									<TabsContent value="plans">
										{renderPlansTabContent()}
									</TabsContent>
								</div>
							</Tabs>
						</div>
					</div>

					<Separator className="mt-2 mb-4" />

					<div className="px-4 pb-4">
						<p className="text-xs text-muted-foreground">
							Note: This panel is only visible in development mode and helps visualize and edit the available data for debugging purposes.
						</p>
					</div>
				</div>
			)}
		</>
	);
}
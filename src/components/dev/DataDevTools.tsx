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
import { EntityCard } from "./cards/EntityCard";
import { entityFieldCategories } from "./utils/entityHandler";

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

	// Render entity cards for a given entity type and category
	const renderEntityCards = (
		entity: 'user' | 'organization' | 'position' | 'competence' | 'career_path',
		dataArray: any[],
		category: string,
		titleFn?: (item: any, index: number) => string
	) => {
		if (!dataArray || dataArray.length === 0) {
			return <div className="text-sm text-muted-foreground italic">No data available</div>;
		}

		return dataArray.map((item, index) => (
			<EntityCard
				key={`${entity}-${item.id || index}`}
				entity={entity}
				data={item}
				title={titleFn ? titleFn(item, index) : `${entity} ${category}`}
				category={category}
			/>
		));
	};

	// Create tabs content based on entity type
	const renderTabContent = (entityType: 'user' | 'organization' | 'position' | 'competence' | 'career_path') => {
		const categories = Object.keys(entityFieldCategories[entityType] || {});
		const data = {
			user: currentUser ? [currentUser] : [],
			organization: currentOrganization ? [currentOrganization] : [],
			position: currentPosition ? [currentPosition] : [],
			competence: userCompetences || [],
			career_path: plans || []
		};

		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{categories.map(category => (
					<div key={category}>
						{renderEntityCards(
							entityType,
							data[entityType],
							category,
							(item, index) => {
								if (entityType === 'competence') {
									return `Competence: ${item.competence?.name || `#${index + 1}`}`;
								}
								if (entityType === 'career_path') {
									return `Plan${item.id === activePlan?.id ? ' (Active)' : ''}`;
								}
								return `${entityType} ${category}`;
							}
						)}
					</div>
				))}
			</div>
		);
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
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{/* User Card */}
											{currentUser && (
												<EntityCard
													entity="user"
													data={currentUser}
													title="User"
													category="primary"
												/>
											)}

											{/* Organization Card */}
											{currentOrganization && (
												<EntityCard
													entity="organization"
													data={currentOrganization}
													title="Organization"
													category="primary"
												/>
											)}

											{/* Position Card */}
											{currentPosition && (
												<EntityCard
													entity="position"
													data={currentPosition}
													title="Current Position"
													category="primary"
												/>
											)}

											{/* Competence Card */}
											{userCompetences && userCompetences.length > 0 && (
												<EntityCard
													entity="competence"
													data={userCompetences[0]}
													title="Top Competence"
													category="primary"
												/>
											)}

											{/* Career Plan Card */}
											{activePlan && (
												<EntityCard
													entity="career_path"
													data={activePlan}
													title="Active Career Plan"
													category="primary"
												/>
											)}
										</div>
									</TabsContent>

									<TabsContent value="user">
										{renderTabContent('user')}
									</TabsContent>

									<TabsContent value="organization">
										{renderTabContent('organization')}
									</TabsContent>

									<TabsContent value="competences">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{userCompetences && userCompetences.map((competence, index) => (
												<EntityCard
													key={competence.id}
													entity="competence"
													data={competence}
													title={`Competence: ${competence.competence?.name || index + 1}`}
													category="primary"
												/>
											))}
										</div>
									</TabsContent>

									<TabsContent value="position">
										{renderTabContent('position')}
									</TabsContent>

									<TabsContent value="plans">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{plans && plans.map(plan => (
												<EntityCard
													key={plan.id}
													entity="career_path"
													data={plan}
													title={`Plan${plan.id === activePlan?.id ? ' (Active)' : ''}`}
													category="primary"
												/>
											))}
										</div>
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